import React from 'react'
import icon16 from '../../../public/icon128.png';
import Modal from '../../components/Modal';
import UploadInterface from './UploadInterface';

export default function ImportButton(): React.ReactElement {

    const [isModalOpen, setModalOpen] = React.useState(false);

    return <div className="mes:float-right">
        <button
            className="mes:static mes:right-2 mes:top-80vh mes:flex mes:flex-row mes:gap-1 mes:!text-xs mes:!p-2.5 mes:!border-none mes:!text-white mes:!font-600 mes:!shadow-md mes:!rounded-full"
            style={{ backgroundColor: 'hsl(279, 68%, 32%)' }}
            onClick={() => setModalOpen(v => !v)}
            title="Moxfield Enhancement Suite - Bulk Importer"
        >
            <div className="mes:h-4 mes:w-4">
                <img src={chrome.runtime.getURL(icon16)} alt="MES Logo" className="mes:w-full mes:h-auto" />
            </div>
        </button>

        {
            isModalOpen && <Modal closeModal={() => setModalOpen(false)}>
                <UploadInterface completed={() => setModalOpen(false)} />
            </Modal>
        }
    </div>
}

