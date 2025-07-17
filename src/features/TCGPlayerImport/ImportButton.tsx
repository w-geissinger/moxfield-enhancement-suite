import React from 'react'
import icon16 from '../../../public/icon128.png';
import Modal from '../../components/Modal';
import UploadInterface from './UploadInterface';

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
                <UploadInterface completed={() => setModalOpen(false)} />
            </Modal>
        }
    </div>
}

