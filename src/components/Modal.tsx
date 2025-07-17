export default function Modal(props: { closeModal: () => void, children: React.ReactElement | React.ReactElement[] }): React.ReactElement {
    const { closeModal, children } = props;

    return <>
        <div className="mes:fixed mes:top-0 mes:left-0 mes:z-998 mes:opacity-20 mes:bg-black mes:h-screen mes:w-screen" onClick={closeModal}></div>
        <div className="mes:z-999 mes:rounded-lg mes:fixed mes:top-1/2 mes:left-1/2 mes:-translate-y-1/2 mes:-translate-x-1/2 mes:p-4 mes:px-6 mes:bg-neutral-100 mes:shadow-2xl">
            {children}
        </div>

    </>
}
