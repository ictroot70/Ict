import React, { useState } from 'react';
import styles from './EditDeletePost.module.scss';

interface EditDeletePostProps {
    postId: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    className?: string;
}

export const EditDeletePost: React.FC<EditDeletePostProps> = ({
    postId,
    onEdit,
    onDelete,
    className = ''
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleEditClick = () => {
        onEdit(postId);
        setIsMenuOpen(false);
    };

    const handleDeleteClick = () => {
        onDelete(postId);
        setIsMenuOpen(false);
    };

    return (
        <div className={`${styles.wrapper} ${className}`}>
            {/* Кнопка для открытия/закрытия меню */}
            <button
                className={styles.menuButton}
                onClick={handleMenuToggle}
                aria-label="Open menu"
            >
                <div className={styles.dotsIcon}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </button>

            {/* Выпадающее меню */}
            {isMenuOpen && (
                <div className={styles.container}>
                    {/* Кнопка Edit */}
                    <button
                        className={styles.button}
                        onClick={handleEditClick}
                        aria-label="Edit Post"
                    >
                        <div className={styles.buttonContent}>
                            <div className={styles.iconWrapper}>
                                <img
                                    src="/icons/svg/arrow-back-outline.svg"
                                    alt="Edit"
                                    width={24}
                                    height={24}
                                    className={styles.icon}
                                />
                            </div>
                            <span className={styles.text}>Edit Post</span>
                        </div>
                    </button>


                    <button
                        className={styles.button}
                        onClick={handleDeleteClick}
                        aria-label="Delete Post"
                    >
                        <div className={styles.buttonContent}>
                            <div className={styles.iconWrapper}>
                                <img
                                    src="/icons/svg/trash.svg"
                                    alt="Delete"
                                    width={24}
                                    height={24}
                                    className={styles.icon}
                                />
                            </div>
                            <span className={styles.text}>Delete Post</span>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};