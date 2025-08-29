import React, { useState, useRef, useEffect } from 'react';
import { Button, Typography } from '@ictroot/ui-kit';

export const EditDeletePost = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const handleEdit = () => {
        console.log('Edit Post clicked');
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        console.log('Delete Post clicked');
        setIsModalOpen(false);
    };

    // Закрытие модалки при клике вне её области
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsModalOpen(false);
            }
        };

        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="text-center relative">
                <Button
                    ref={buttonRef}
                    onClick={() => setIsModalOpen(!isModalOpen)}
                    variant="primary"
                    size="md"
                >
                    Actions
                </Button>

                {isModalOpen && (
                    <div
                        ref={modalRef}
                        className="fixed bg-white border border-red-300 rounded-sm z-50 shadow-lg"
                        style={{
                            width: '137px',
                            height: '85px',
                            top: buttonRef.current ? `${buttonRef.current.getBoundingClientRect().bottom + 120}px` : '238px',
                            left: buttonRef.current ? `${buttonRef.current.getBoundingClientRect().left}px` : '1055px',
                            padding: '12px'
                        }}
                    >
                        <div className="flex flex-col gap-3 w-full h-full">
                            <button
                                onClick={handleEdit}
                                className="flex items-center justify-start w-full text-gray-800 hover:bg-gray-100 rounded transition-colors p-1"
                                style={{ height: '24px' }}
                            >
                                <Typography variant="bold_14" className="w-full text-left">
                                    редактировать
                                </Typography>
                            </button>

                            <button
                                onClick={handleDelete}
                                className="flex items-center justify-start w-full text-gray-800 hover:bg-gray-100 rounded transition-colors p-1"
                                style={{ height: '24px' }}
                            >
                                <Typography variant="bold_14" className="w-full text-left">
                                    удалить
                                </Typography>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};