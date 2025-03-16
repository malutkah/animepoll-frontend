"use client"

import {memo} from "react";

interface ModalBoxProps {
    title: string;
    bodyText: string;
    footerText: string;
    messageType: "info" | "warning" | "error";
    buttonType: "ok" | "yesno" | "next";
    onOkClick?: () => void;
    onYesClick?: () => void;
    onNoClick?: () => void;
    onNextClick?: () => void;
    onClose: () => void;
}

const ModalBox = memo(({
                      title,
                      bodyText,
                      footerText,
                      messageType,
                      buttonType,
                      onOkClick,
                      onYesClick,
                      onNoClick,
                      onNextClick,
                      onClose
                  }: ModalBoxProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog"
             aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-11/12 md:w-1/2 p-6" role="document">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{title}</h2>
                <p className="text-lg mb-4 text-gray-800 dark:text-gray-100">{bodyText}</p>
                <p className="text-lg mb-4 text-gray-800 dark:text-gray-100">{footerText}</p>
                <div className="flex justify-end space-x-4">
                    {buttonType === "ok" ? (
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                        >
                            Ok
                        </button>
                    ) : buttonType === "yesno" ? (
                        <>
                            <button
                                type="button"
                                onClick={onYesClick}
                                className="bg-emerald-400 hover:bg-emerald-600 text-gray-800 font-bold py-2 px-4 rounded"
                            >
                                Yes
                            </button>
                            <button
                                type="button"
                                onClick={onNoClick}
                                className="bg-red-500 hover:bg-red-700 text-gray-800 font-bold py-2 px-4 rounded"
                            >
                                No
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={onNextClick}
                            className="bg-blue-300 hover:bg-blue-400 text-gray-800 font-bold py-2 px-4 rounded"
                        >
                            Continue
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    )
});

ModalBox.displayName = 'ModalBox'

export default ModalBox;