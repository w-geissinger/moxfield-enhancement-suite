import React from 'react'
import { FileUploader } from "react-drag-drop-files"
import { Authenticate, CreateBinder, ImportCards, TCGPlayerToMoxfieldCSV } from './Requests';
import { rateLimitedMap } from '../../utilities/rateLimiting';
import { CheckCircle, ChevronDown, ChevronUp, CloudArrowUp, ExclamationCircle, X, XCircle } from 'react-bootstrap-icons';
import { Trefoil } from 'ldrs/react';
import 'ldrs/react/Trefoil.css';

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
    'binderExists': 'Some of your binders already exist! \n Rename them below.',
    'cardsNotFound': 'Certain cards couldn\'t be found.'
} as const

const SingularErrors: { [key in UploadErrorType]: string } = {
    'authentication': 'This error shouldn\'t have been shown to you.',
    'conversion': 'There was an error converting this file to Moxfield\'s format.',
    'binderExists': 'You already have a binder with this name. \n Rename this item and try again.',
    'cardsNotFound': 'The following cards couldn\'t be found. \n All other cards in the list were imported successfully.'
} as const

export default function UploadInterface(props: { completed: () => void }) {

    const [uploads, setUploads] = React.useState<UploadedFileWithMetadata[] | null>(null);

    const [loading, setLoading] = React.useState<boolean>(false);

    const [error, setError] = React.useState<UploadErrorType | false>(false);

    const [forbiddenNames, setForbiddenNames] = React.useState<string[]>([]);

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
            if (forbiddenNames.includes(label)) {
                newUploads[index].error = 'binderExists';
            } else {
                newUploads[index].error = undefined;
            }
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
                        if (result.error === 'binderExists' && result.uploads) {
                            const agg: string[] = [];
                            result.uploads.forEach(upload => {
                                if (upload.error === 'binderExists') {
                                    agg.push(upload.label);
                                }
                            })
                            setForbiddenNames(prev => [...prev, ...agg])
                        }
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
        return <div className="mes:flex mes:flex-col mes:gap-2 mes:w-[50vw] mes:h-51">
            <div className="mes:relative mes:flex mes:flex-col mes:pb-2">
                <span className="mes:text-xl mes:font-bold">Moxfield Enhancement Suite</span>
                <div className="mes:absolute mes:top-0 mes:-right-2 mes:justify-self-end mes:h-6 mes:w-6 mes:text-gray-500 mes:hover:text-black">
                    <X size="1.5rem" onClick={() => { props.completed() }} />
                </div>
            </div>
            <div className="mes:flex mes:flex-col mes:flex-grow mes:items-center mes:justify-center mes:gap-5">
                <span className="mes:text-xs">
                    Packing up your cards...
                </span>
                <Trefoil
                    size="40"
                    stroke="4"
                    strokeLength="0.15"
                    bgOpacity="0.1"
                    speed="1.4"
                    color="black"
                />
                <span className="mes:text-xs mes:text-center">
                    We only send one request per second to avoid spamming servers!
                </span>
            </div>
        </div>
    }

    return <div className="mes:flex mes:flex-col mes:gap-4 mes:max-h-[80vh]">
        <div className="mes:relative mes:flex mes:flex-col mes:pb-2">
            <span className="mes:text-xl mes:font-bold">Moxfield Enhancement Suite</span>
            <span className="mes:text-base">Import CSV file(s) from TCGPlayer</span>
            <div className="mes:absolute mes:top-0 mes:-right-2 mes:justify-self-end mes:h-6 mes:w-6 mes:text-gray-500 mes:hover:text-black">
                <X size="1.5rem" onClick={() => { props.completed() }} />
            </div>

            {
                error && <div className="mes:flex mes:flex-row mes:items-center mes:gap-2 mes:text-red-500 mes:bg-red-200 mes:rounded mes:p-2 mes:mt-4 mes:max-w-min">
                    <ExclamationCircle size="1rem" />
                    <span className="mes:text-base mes:font-semibold mes:text-nowrap">{PluralErrors[error]}</span>
                </div>
            }
        </div>
        {
            !uploads?.length &&
            <FileUploader multiple handleChange={handleFileUploads} name="file" types={['CSV']} >
                <div className="mes:flex mes:flex-col mes:items-center mes:justify-center mes:gap-2 mes:p-6 mes:w-[50vw] mes:border-1 mes:border-dashed" style={{ borderColor: 'hsl(279, 68%, 32%)' }}>
                    <CloudArrowUp size="4rem" />
                    <span className="mes:text-xs">Drop your CSV files here...</span>
                </div>
            </FileUploader>
        }
        {
            !!uploads?.length &&
            <div className="mes:flex mes:flex-col mes:w-[50vw] mes:gap-2 mes:overflow-y-auto mes:px-3 mes:pt-2 mes:overflow-x-none z-1">
                {
                    uploads.map((uploadData, index) => {
                        return <UploadCard uploadData={uploadData} renameBinder={renameBinder} removeUpload={removeUpload} index={index} key={index} />
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

function UploadCard(props: { uploadData: UploadedFileWithMetadata, renameBinder: (value: string, index: number) => void, removeUpload: (index: number) => void, index: number }) {
    const { uploadData, renameBinder, removeUpload, index } = props;

    const [isExpanded, setExpanded] = React.useState(false);

    if (!uploadData) {
        return null;
    }

    return <div
        className={`mes:flex mes:flex-col mes:rounded mes:relative mes:max-w-full mes:group mes:border-1 mes:border-gray-200 mes:shadow-sm mes:hover:shadow-2xl mes:hover:border-gray-400 mes:bg-neutral-100`}
    >
        <div className="mes:flex mes:flex-row mes:justify-between mes:items-center mes:h-12" key={index}>
            <div className="mes:text-sm mes:flex mes:flex-row mes:gap-2 mes:pr-2 mes:h-full mes:w-full mes:items-center">
                <span className="mes:border-r-1 mes:w-10 mes:pl-3 mes:pr-2 mes:py-2 mes:h-8 mes:text-center mes:leading-4">{index + 1}</span>
                {
                    !uploadData.binderId &&
                    <fieldset className=' mes:border-1! mes:focus-within:!border-gray-700 mes:!border-gray-300 mes:rounded-md mes:w-full mes:leading-3 mes:-mt-1'>
                        <legend className="mes:relative mes:-top-0.25 mes:pb-0! mes:mb-0! mes:ml-1.5 mes:!px-0.5 mes:!text-[0.5rem] mes:!float-none mes:max-w-min mes:text-nowrap mes:font-semibold">
                            Binder Name
                        </legend>
                        <input
                            id={`upload-${index}`}
                            className="mes:w-full mes:px-2 mes:pb-1 mes:!-mt-1 mes:focus:!border-none mes:focus:outline-0"
                            value={uploadData.label}
                            onClick={e => { e.stopPropagation(); }}
                            onChange={(e) => renameBinder(e.target.value, index)}
                            type="text"
                        ></input>
                    </fieldset>

                }
                {
                    !!uploadData.binderId &&
                    <span className="mes:text-sm">{uploadData.label}</span>
                }
            </div>

            {
                !!uploadData.error && uploadData.error === 'cardsNotFound' &&
                <div className="mes:pr-3 mes:pl-1 mes:text-gray-500 mes:hover:text-black">
                    {
                        isExpanded
                            ? <ChevronUp size="1rem" onClick={() => setExpanded(false)} />
                            : <ChevronDown size="1rem" onClick={() => setExpanded(true)} />
                    }
                </div>
            }

            <div className="mes:absolute mes: mes:-top-2 mes:right-4 mes:flex mes:flex-row mes:gap-1">
                {
                    !!uploadData.error &&
                    <div className="mes:text-red-300 mes:group-hover:text-red-500">
                        <ExclamationCircle size="1rem" />
                    </div>
                }
                {
                    !!uploadData.uploaded &&
                    <div className="mes:text-green-500 mes:group-hover:text-green-600">
                        <CheckCircle size="1rem" />
                    </div>
                }
            </div>

            <div className="mes:absolute mes:-top-2 mes:-right-2 mes:hidden mes:group-hover:flex mes:text-red-500 mes:hover:text-red-700">
                <XCircle size="1rem" onClick={() => { removeUpload(index) }} title="Remove File" />
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
            if (file.format !== 'moxfield' && !file.uploaded) {
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
            // if a binder was previously created, or the list has already been uploaded
            if (upload.binderId || upload.uploaded) {
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

            if (!response.errors?.length) {
                upload.uploaded = true;
                upload.error = undefined;
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