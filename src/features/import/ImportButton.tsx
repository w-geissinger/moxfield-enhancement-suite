import React from 'react'
import { FileUploader } from "react-drag-drop-files"
import { Authenticate, CreateBinder, ImportCards, TCGPlayerToMoxfieldCSV } from './Requests';
import icon16 from '../../../public/icon128.png';
import { rateLimitedMap } from '../../utilities/rateLimiting';

export default function ImportButton(): React.ReactElement {

    const [isModalOpen, setModalOpen] = React.useState(false);

    return <div className="mes:float-right" id="mes-importer-root">
        <button
            className="mes:flex mes:flex-row mes:gap-1 mes:!rounded-lg mes:!text-xs mes:!p-2.5 mes:!border-none mes:!text-white mes:!font-600 mes:!shadow-md"
            style={{ backgroundColor: 'hsl(279, 68%, 32%)' }}
            onClick={() => setModalOpen(v => !v)}
        >
            <div className="mes:h-4 mes:w-4">
                <img src={chrome.runtime.getURL(icon16)} alt="MES Logo" className="mes:w-full mes:h-auto" />
            </div>

            TCGPlayer Import
        </button>

        {
            isModalOpen && <Modal closeModal={() => setModalOpen(false)}>
                <UploadInterface />
            </Modal>
        }
    </div>
}

function Modal(props: { closeModal: () => void, children: React.ReactElement | React.ReactElement[] }): React.ReactElement {
    const { closeModal, children } = props;

    return <>
        <div className="mes:fixed mes:top-0 mes:left-0 mes:z-998 mes:opacity-20 mes:bg-black mes:h-screen mes:w-screen" onClick={closeModal}></div>
        <div className="mes:z-999 mes:rounded-lg mes:fixed mes:top-1/2 mes:left-1/2 mes:-translate-y-1/2 mes:-translate-x-1/2 mes:p-4 mes:px-6 mes:bg-neutral-100 mes:shadow-2xl">
            {children}
        </div>

    </>
}

function UploadInterface() {

    const [files, setFile] = React.useState<File[] | null>(null);
    const handleChange = (_files: FileList) => {
        console.log(_files)

        setFile(Array.from(_files));
    };

    const [binderNames, setBinderNames] = React.useState<string[]>([]);

    const submissionHandler = async () => {
        if (files) {
            const authenticated = await Authenticate();
            if (!authenticated) {
                console.error('MES IMPORT FAIL! AUTHENTICATE ERROR')
            }

            const convertedFiles = await Promise.all(files.map(TCGPlayerToMoxfieldCSV))

            if (!convertedFiles) {
                console.error('MES IMPORT FAIL! CONVERSION ISSUE')
            }

            const binderResponses = await Promise.all(rateLimitedMap((value, index) => CreateBinder(binderNames[index] ?? value.name?.slice(0, -4)), files));

            const importResponses = await Promise.all(rateLimitedMap((value, index) => ImportCards(value, binderResponses[index].id), files));

            const errors = importResponses.map(response => {
                return response.errors;
            })
        }
    }

    return <div className="mes:flex mes:flex-col mes:gap-4">
        <div className="mes:flex mes:flex-col mes:pb-2">
            <span className="mes:text-xl mes:font-bold">Moxfield Enhancement Suite</span>
            <span className="mes:text-base">Import CSV file(s) from TCGPlayer</span>
        </div>
        {!files && <FileUploader multiple file={files} handleChange={handleChange} name="file" types={['CSV']} >
            <div className="mes:flex mes:items-center mes:justify-center mes:h-25 mes:w-90 mes:border-1 mes:border-dashed" style={{ borderColor: 'hsl(279, 68%, 32%)' }}>
                <span className="mes:text-xs">Drop your CSV files here...</span>
            </div>
        </FileUploader>
        }
        {
            files &&
            <div className="mes:flex mes:flex-col mes:gap-4 mes:max-h-400 mes:overflow-y-auto">
                {
                    files.map((file, index) => {
                        return <div className="mes:flex mes:flex-row mes:justify-between mes:items-center mes:h-10 mes:rounded mes:shadow-lg mes:bg-neutral-200" key={index}>
                            <div className="mes:text-sm mes:flex mes:flex-row mes:gap-2 mes:h-full mes:items-center">
                                <span className="mes:border-r-1 mes:w-6 mes:pl-2">{index}</span>
                                <input value={file.name.slice(0, -4)} onClick={e => { e.stopPropagation() }} type="text"></input>
                            </div>

                            <div className="mes:h-6 mes:w-8 mes:pr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="#0F1729" />
                                </svg>
                            </div>
                        </div>
                    })
                }
            </div>
        }
        <div className="mes:flex mes:flex-row mes:justify-end mes:pt-2">

            <button
                className="mes:!rounded-lg mes:!text-xs mes:!p-2.5 mes:!border-none mes:!text-white mes:!font-600 mes:!shadow-md"
                style={{ backgroundColor: 'hsl(279, 68%, 32%)' }}
                onClick={submissionHandler}
            >
                Confirm
            </button>
        </div>
    </div>
}