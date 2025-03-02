"use client"

import React, { useState, useEffect } from 'react';
import {
    AlertCircle,
    CheckCircle,
    Info,
    HelpCircle,
    X as CloseIcon,
    AlertTriangle
} from 'lucide-react';

export type MessageType = 'success' | 'error' | 'info' | 'warning' | 'question';

interface MessageBoxProps {
    type: MessageType;
    title?: string;
    message: string;
    onClose?: () => void;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    autoClose?: boolean;
    autoCloseTime?: number;
    showIcon?: boolean;
    showCloseButton?: boolean;
    className?: string;
}

const MessageBox: React.FC<MessageBoxProps> = ({
                                                   type = 'info',
                                                   title,
                                                   message,
                                                   onClose,
                                                   onConfirm,
                                                   onCancel,
                                                   confirmText = 'Confirm',
                                                   cancelText = 'Cancel',
                                                   autoClose = false,
                                                   autoCloseTime = 5000,
                                                   showIcon = true,
                                                   showCloseButton = true,
                                                   className = '',
                                               }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (autoClose) {
            timer = setTimeout(() => {
                handleClose();
            }, autoCloseTime);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [autoClose, autoCloseTime]);

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) onClose();
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        handleClose();
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        handleClose();
    };

    if (!isVisible) return null;

    // Determine colors and icon based on type
    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50 dark:bg-green-900',
                    border: 'border-green-400 dark:border-green-700',
                    text: 'text-green-800 dark:text-green-200',
                    icon: <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />,
                    buttonBg: 'bg-green-500 hover:bg-green-600',
                };
            case 'error':
                return {
                    bg: 'bg-red-50 dark:bg-red-900',
                    border: 'border-red-400 dark:border-red-700',
                    text: 'text-red-800 dark:text-red-200',
                    icon: <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />,
                    buttonBg: 'bg-red-500 hover:bg-red-600',
                };
            case 'warning':
                return {
                    bg: 'bg-amber-50 dark:bg-amber-900',
                    border: 'border-amber-400 dark:border-amber-700',
                    text: 'text-amber-800 dark:text-amber-200',
                    icon: <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />,
                    buttonBg: 'bg-amber-500 hover:bg-amber-600',
                };
            case 'question':
                return {
                    bg: 'bg-purple-50 dark:bg-purple-900',
                    border: 'border-purple-400 dark:border-purple-700',
                    text: 'text-purple-800 dark:text-purple-200',
                    icon: <HelpCircle className="h-6 w-6 text-purple-500 dark:text-purple-400" />,
                    buttonBg: 'bg-purple-500 hover:bg-purple-600',
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-50 dark:bg-blue-900',
                    border: 'border-blue-400 dark:border-blue-700',
                    text: 'text-blue-800 dark:text-blue-200',
                    icon: <Info className="h-6 w-6 text-blue-500 dark:text-blue-400" />,
                    buttonBg: 'bg-blue-500 hover:bg-blue-600',
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div
            className={`rounded-lg border ${styles.border} ${styles.bg} p-4 shadow-md mb-4 animate-fadeIn ${className}`}
            role={type === 'error' ? 'alert' : 'status'}
            aria-live={type === 'error' ? 'assertive' : 'polite'}
        >
            <div className="flex items-start">
                {showIcon && (
                    <div className="flex-shrink-0 mr-3">
                        {styles.icon}
                    </div>
                )}

                <div className="flex-1">
                    {title && (
                        <h3 className={`text-lg font-semibold ${styles.text}`}>
                            {title}
                        </h3>
                    )}

                    <div className={`${title ? 'mt-1' : ''} ${styles.text}`}>
                        {message}
                    </div>

                    {(onConfirm || onCancel) && (
                        <div className="mt-3 flex space-x-3">
                            {onConfirm && (
                                <button
                                    className={`${styles.buttonBg} text-white py-1 px-3 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2`}
                                    onClick={handleConfirm}
                                >
                                    {confirmText}
                                </button>
                            )}

                            {onCancel && (
                                <button
                                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-1 px-3 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
                                    onClick={handleCancel}
                                >
                                    {cancelText}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {showCloseButton && (
                    <button
                        onClick={handleClose}
                        className="ml-auto flex-shrink-0 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                        aria-label="Close"
                    >
                        <CloseIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default MessageBox;