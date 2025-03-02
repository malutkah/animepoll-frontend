"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import MessageBox, { MessageType } from './MessageBox';

interface MessageOptions {
    type: MessageType;
    title?: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    autoClose?: boolean;
    autoCloseTime?: number;
    showIcon?: boolean;
    showCloseButton?: boolean;
}

interface Message extends MessageOptions {
    id: string;
}

interface MessageContextType {
    showMessage: (options: MessageOptions) => string;
    hideMessage: (id: string) => void;
    hideAllMessages: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);

    const showMessage = (options: MessageOptions): string => {
        const id = Date.now().toString();
        const message: Message = { id, ...options };
        setMessages((prev) => [...prev, message]);
        return id;
    };

    const hideMessage = (id: string) => {
        setMessages((prev) => prev.filter((message) => message.id !== id));
    };

    const hideAllMessages = () => {
        setMessages([]);
    };

    return (
        <MessageContext.Provider value={{ showMessage, hideMessage, hideAllMessages }}>
            <div className="fixed top-4 right-4 z-50 w-96 max-w-full space-y-2">
                {messages.map((message) => (
                    <MessageBox
                        key={message.id}
                        type={message.type}
                        title={message.title}
                        message={message.message}
                        onClose={() => hideMessage(message.id)}
                        onConfirm={message.onConfirm}
                        onCancel={message.onCancel}
                        confirmText={message.confirmText}
                        cancelText={message.cancelText}
                        autoClose={message.autoClose}
                        autoCloseTime={message.autoCloseTime}
                        showIcon={message.showIcon}
                        showCloseButton={message.showCloseButton}
                    />
                ))}
            </div>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessage = (): MessageContextType => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessage must be used within a MessageProvider');
    }
    return context;
};