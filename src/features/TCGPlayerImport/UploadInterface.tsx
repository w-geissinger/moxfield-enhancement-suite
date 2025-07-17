import React from 'react'
import { FileUploader } from "react-drag-drop-files"
import { Authenticate, CreateBinder, ImportCards, TCGPlayerToMoxfieldCSV } from './Requests';
import { rateLimitedMap } from '../../utilities/rateLimiting';

type UploadErrorType = 'authentication' | 'conversion' | 'binderExists' | 'cardsNotFound';

type UploadFileType = 'tcgplayer' | 'moxfield';

interface UploadedFileWithMetadata {
    /**
     * The label to be used for the binder that will hold the uploaded list of cards
     */
    label: string;
    /**
     * The CSV file to be uploaded, which may be in one of multiple formats
     */
    file: File;
    /**
     * The current format of the CSV in the 'file' key
     */
    format: UploadFileType
    /**
     * Once a binder has been created for the file, this exists.
     */
    binderId?: string;
    /**
     * Set at various points in the submission process
     */
    error?: UploadErrorType;
    /**
     * A list of errors for specific cards that were attempted to be imported.
     */
    cardErrors?: {
        errorMessage: string;
        lineNumber: number;
        originalText: string;
    }[]
    /**
     * Signifies that this item is complete
     */
    uploaded?: boolean;
}

const PluralErrors: { [key in UploadErrorType]: string } = {
    'authentication': 'There was an issue authenticating with Moxfield.',
    'conversion': 'There was an error converting one of your files.',
    'binderExists': 'One of your binders already exists!',
    'cardsNotFound': 'Certain cards couldn\'t be found.'
} as const

const SingularErrors: { [key in UploadErrorType]: string } = {
    'authentication': 'This error shouldn\'t have been shown to you.',
    'conversion': 'There was an error converting this file to Moxfield\'s format.',
    'binderExists': 'You already have a binder with this name.',
    'cardsNotFound': 'The following cards couldn\'t be found. All other cards in the list were imported successfully.'
} as const

export default function UploadInterface(props: { completed: () => void }) {

    const [uploads, setUploads] = React.useState<UploadedFileWithMetadata[] | null>(null);

    const [loading, setLoading] = React.useState<boolean>(false);

    const [error, setError] = React.useState<UploadErrorType | false>(false);

    const handleFileUploads = (_files: FileList) => {
        if (_files) {
            const newState = Array.from(_files).map(file => {
                return {
                    label: file.name.slice(0, -4),
                    file: file,
                    format: 'tcgplayer' as UploadFileType
                }
            })
            setUploads(newState);
        }
    };

    const removeUpload = (index: number) => {
        if (uploads) {
            const newUploads = [...uploads];
            newUploads.splice(index, 1);
            setUploads(newUploads);
        }
    }

    const renameBinder = (label: string, index: number) => {
        if (uploads) {
            const newUploads = [...uploads];
            newUploads[index].label = label;
            setUploads(newUploads);
        }
    }

    const handleSubmission = () => {
        if (uploads) {
            setLoading(true)
            convertAndSubmitUploads(uploads).then((result) => {
                if (result.success) {
                    props.completed()
                    setLoading(false)
                } else {
                    if (result.error) {
                        setError(result.error)
                    }
                    if (result.uploads) {
                        setUploads(result.uploads)
                    }
                    setLoading(false)
                }
            })
        }
    }

    if (loading) {
        return <div className="mes:flex mes:flex-col mes:gap-4 mes:w-90 mes:h-51">
            <div className="mes:relative mes:flex mes:flex-col mes:pb-2">
                <span className="mes:text-xl mes:font-bold">Moxfield Enhancement Suite</span>
                <span className="mes:text-base">Import CSV file(s) from TCGPlayer</span>
                <div className="mes:absolute mes:top-0 mes:-right-2 mes:justify-self-end mes:h-6 mes:w-6 mes:text-gray-500 mes:hover:text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" onClick={() => { props.completed() }}>
                        <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="currentColor" />
                    </svg>
                </div>
            </div>
            <div className="mes:flex mes:flex-col mes:flex-grow mes:items-center mes:justify-center">
                <span>Loading...</span>
            </div>
        </div>
    }

    return <div className="mes:flex mes:flex-col mes:gap-4">
        <div className="mes:relative mes:flex mes:flex-col mes:pb-2">
            <span className="mes:text-xl mes:font-bold">Moxfield Enhancement Suite</span>
            <span className="mes:text-base">Import CSV file(s) from TCGPlayer</span>
            <div className="mes:absolute mes:top-0 mes:-right-2 mes:justify-self-end mes:h-6 mes:w-6 mes:text-gray-500 mes:hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" onClick={() => { props.completed() }}>
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="currentColor" />
                </svg>
            </div>

            {
                error && <div className="mes:flex mes:flex-row mes:items-center mes:pt-6 mes:gap-2 mes:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24px" height="24px" viewBox="0 0 24 24">
                        <g data-name="Layer 2">
                            <g data-name="alert-circle">
                                <rect width="24" height="24" opacity="0" />
                                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                                <circle cx="12" cy="16" r="1" />
                                <path d="M12 7a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1z" />
                            </g>
                        </g>
                    </svg>
                    <span className="mes:text-base mes:font-bold">{PluralErrors[error]}</span>
                </div>
            }
        </div>
        {
            !uploads?.length &&
            <FileUploader multiple handleChange={handleFileUploads} name="file" types={['CSV']} >
                <div className="mes:flex mes:items-center mes:justify-center mes:h-25 mes:w-90 mes:border-1 mes:border-dashed" style={{ borderColor: 'hsl(279, 68%, 32%)' }}>
                    <span className="mes:text-xs">Drop your CSV files here...</span>
                </div>
            </FileUploader>
        }
        {
            !!uploads?.length &&
            <div className="mes:flex mes:flex-col mes:p-2 mes:gap-2 mes:max-h-400 mes:overflow-y-auto mes:w-90 mes:bg-neutral-200 mes:shadow-lg mes:rounded">
                {
                    uploads.map((uploadData, index) => {
                        return <UploadItem uploadData={uploadData} renameBinder={renameBinder} removeUpload={removeUpload} index={index} key={index} />
                    })
                }
            </div>
        }
        <div className="mes:flex mes:flex-row mes:justify-end mes:pt-2 mes:border-t-1 mes:border-t-gray-300">

            <button
                className="mes:!rounded-lg mes:!text-xs mes:leading-0 mes:!p-2.5 mes:h-8 mes:!border-none mes:bg-[hsl(279,68%,32%)] mes:disabled:bg-gray-600 mes:!text-white mes:!font-600 mes:!shadow-md mes:text-center"
                disabled={!uploads?.length || !uploads?.find(upload => !upload.uploaded)}
                onClick={handleSubmission}
            >
                Submit
            </button>
        </div>
    </div>
}

function UploadItem(props: { uploadData: UploadedFileWithMetadata, renameBinder: (value: string, index: number) => void, removeUpload: (index: number) => void, index: number }) {
    const { uploadData, renameBinder, removeUpload, index } = props;

    const [isExpanded, setExpanded] = React.useState(false);

    if (!uploadData) {
        return null;
    }

    return <div className={`mes:flex mes:flex-col mes:rounded ${uploadData?.error ? 'mes:bg-red-200' : 'mes:bg-neutral-100'}`}>
        <div className="mes:flex mes:flex-row mes:justify-between mes:items-center mes:h-10" key={index}>
            <div className="mes:text-sm mes:flex mes:flex-row mes:gap-2 mes:pr-2 mes:h-full mes:w-full mes:items-center">
                <span className="mes:border-r-1 mes:w-6 mes:pl-2">{index + 1}</span>
                {
                    !uploadData.binderId &&
                    <input
                        id={`upload-${index}`}
                        className="mes:border-1 mes:border-gray-700 mes:rounded-md mes:px-2 mes:w-full"
                        value={uploadData.label}
                        onClick={e => { e.stopPropagation(); }}
                        onChange={(e) => renameBinder(e.target.value, index)}
                        type="text"
                    ></input>
                }
                {
                    !!uploadData.binderId &&
                    <span className="mes:text-sm">{uploadData.label}</span>
                }
            </div>

            {!!uploadData.error && <div className="mes:h-6 mes:w-8 mes:pr-2 mes:text-gray-500 mes:hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" onClick={() => setExpanded(!isExpanded)}>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.29289 8.29289C4.68342 7.90237 5.31658 7.90237 5.70711 8.29289L12 14.5858L18.2929 8.29289C18.6834 7.90237 19.3166 7.90237 19.7071 8.29289C20.0976 8.68342 20.0976 9.31658 19.7071 9.70711L12.7071 16.7071C12.3166 17.0976 11.6834 17.0976 11.2929 16.7071L4.29289 9.70711C3.90237 9.31658 3.90237 8.68342 4.29289 8.29289Z" fill="currentColor" />
                </svg>
            </div>}

            <div className="mes:h-6 mes:w-8 mes:pr-2 mes:text-gray-500 mes:hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" onClick={() => { removeUpload(index) }}>
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="currentColor" />
                </svg>
            </div>
        </div>
        {
            isExpanded && uploadData.error && <span className="mes:text-xs mes:p-2 mes:font-bold">
                {SingularErrors[uploadData.error]}
            </span>
        }
        {
            isExpanded && uploadData.error === 'cardsNotFound' && uploadData?.cardErrors?.map(error => {
                return <span className="mes:text-xs mes:p-2">
                    {error.lineNumber}: {error.errorMessage}
                </span>
            })
        }
    </div>
}

async function convertAndSubmitUploads(uploads: UploadedFileWithMetadata[]): Promise<{ error?: UploadErrorType, success: boolean, uploads?: UploadedFileWithMetadata[] }> {
    let isError = false;

    if (uploads) {
        const authenticated = await Authenticate();
        if (!authenticated) {
            console.error('MES IMPORT FAIL! AUTHENTICATE ERROR')
            // not necessary since we're bailing out, but for future readers...
            // isError = true;
            return {
                error: 'authentication',
                success: false
            }
        }

        let convertedUploads: UploadedFileWithMetadata[] = await Promise.all(uploads.map(async file => {
            if (file.format !== 'moxfield') {
                try {
                    const conversion = await TCGPlayerToMoxfieldCSV(file.file);
                    return {
                        ...file,
                        file: conversion,
                        format: 'moxfield'
                    }
                } catch (_e) {
                    isError = true;
                }
            }
            return file;
        }))

        if (isError) {
            console.error('MES IMPORT FAIL! CONVERSION ISSUE')
            return {
                error: 'conversion',
                success: false
            }
        }

        // get binders
        await Promise.all(rateLimitedMap(async (upload, index) => {
            if (upload.uploaded) {
                return true;
            }

            const response = await CreateBinder(upload.label);

            if (response.id) {
                convertedUploads[index].binderId = response.id;
            } else {
                // error for a preexisting binder is in... the 'name' variable?
                if (Array.isArray(response.name) && response.name[0] === "You already have a trade binder with that name.") {
                    convertedUploads[index].error = 'binderExists';
                    isError = true;
                }
            }

            return response;
        }, convertedUploads));

        if (isError) {
            console.error('MES IMPORT FAIL! BINDER EXISTS ALREADY')
            return {
                error: 'binderExists',
                success: false,
                uploads: convertedUploads
            }
        }

        convertedUploads = await Promise.all(rateLimitedMap(async (upload) => {
            if (upload.uploaded) {
                return upload;
            }

            const response = await ImportCards(upload.file, upload.binderId ?? '');

            if (!response.errors) {
                upload.uploaded = true;
            } else {
                upload.uploaded = true
                isError = true;
                upload.cardErrors = response.errors;
                upload.error = 'cardsNotFound';
            }

            return upload;
        }, convertedUploads)) as UploadedFileWithMetadata[];

        if (isError) {
            return {
                error: 'cardsNotFound',
                success: false,
                uploads: convertedUploads
            }
        }

        return {
            success: true
        }

    }

    // Nothing was provided
    return {
        success: false
    }
}