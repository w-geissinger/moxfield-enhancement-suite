import { CheckCircle, Clock, X } from 'react-bootstrap-icons';
import icon128 from '../public/icon128.png';


function App() {

    return (
        <div className="mes:flex mes:flex-col mes:w-120 mes:p-2 mes:pb-1 mes:gap-6 mes:text-base">
            <div className="mes:flex mes:flex-row mes:w-full mes:items-center mes:justify-between mes:text-xl mes:border-b-1 mes:pb-2">
                <div className="mes:flex mes:flex-row mes:items-center">
                    <img src={chrome.runtime.getURL(icon128)} alt="MES Logo" className="mes:w-6 mes:h-auto" />
                    <span className="mes:font-bold mes:text-nowrap mes:pl-2">Moxfield Enhancement Suite</span>
                </div>

                <div title="close" onClick={() => window.close()}>
                    <X size="2rem" />
                </div>
            </div>

            <div className="mes:rounded-lg mes:flex mes:flex-row mes:items-center mes:w-full mes:shadow-md mes:p-1 mes:dark:border-1 mes:dark:border-light-300">
                <CheckCircle size="6rem" className="mes:px-3" color="currentColor" />
                <div className="mes:flex mes:flex-col mes:py-4 mes:pr-2 mes:gap-1 mes:w-92">
                    <span className="mes:font-bold mes:text-lg">
                        Current Features:
                    </span>

                    <ul className="mes:pl-4">
                        <li>
                            • Adds a 'bulk import' button to your collection for importing TCGPlayer CSV files
                        </li>
                    </ul>
                </div>
            </div>


            <div className="mes:rounded-lg mes:flex mes:flex-row mes:items-center mes:w-full mes:shadow-md mes:p-1 mes:dark:border-1 mes:dark:border-light-300">
                <Clock size="6rem" className="mes:px-3" color="currentColor" />
                <div className="mes:flex mes:flex-col mes:py-4 mes:pr-2 mes:gap-1 mes:w-92">
                    <span className="mes:font-bold mes:text-lg">
                        Potential Additions:
                    </span>

                    <ul className="mes:pl-4">
                        <li>
                            • Improved search controls within the moxfield search page(s)
                        </li>
                        <li>
                            • Applying a dark mode to Moxfield
                        </li>
                    </ul>
                </div>

            </div>

            <div className="mes:flex mes:flex-row mes:w-full mes:justify-between mes:text-sm">
                <a
                    className="mes:underline mes:text-violet-400 mes:hover:text-violet-600"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/w-geissinger/moxfield-enhancement-suite"
                >
                    Github
                </a>
                <span>v. 1.0.0</span>
            </div>
        </div>
    )
}

export default App
