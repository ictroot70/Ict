import React, { useState, useRef, useEffect } from 'react';
import { TrashOutline, EditOutline, Button, Typography } from "@/shared/ui";
import styles from './EditDeletePost.module.scss';

interface EditDeletePostProps {
    postId: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    className?: string;
    isEditing?: boolean;
}

export const EditDeletePost: React.FC<EditDeletePostProps> = ({
    postId,
    onEdit,
    onDelete,
    className = '',
    isEditing = false
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={`${styles.wrapper} ${className}`} ref={menuRef}>
            <Button
                variant="text"
                className={styles.menuButton}
                onClick={handleMenuToggle}
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
                disabled={isEditing}
            >
                <div className={styles.dotsIcon}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </Button>

            {isMenuOpen && !isEditing && (
                <div
                    className={styles.container}
                    style={{
                        minWidth: '137px',
                        minHeight: '85px'
                    }}
                >
                    <Button
                        variant="text"
                        className={styles.button}
                        onClick={handleEditClick}
                        aria-label="Edit Post"
                    >
                        <div className={styles.buttonContent}>
                            <div className={styles.iconWrapper}>
                                <EditOutline size={24} />
                            </div>
                            <Typography
                                variant="regular_14"
                                className={styles.text}
                            >
                                Edit Post
                            </Typography>
                        </div>
                    </Button>

                    <Button
                        variant="text"
                        className={styles.button}
                        onClick={handleDeleteClick}
                        aria-label="Delete Post"
                    >
                        <div className={styles.buttonContent}>
                            <div className={styles.iconWrapper}>
                                <TrashOutline size={24} />
                            </div>
                            <Typography
                                variant="regular_14"
                                className={styles.text}
                            >
                                Delete Post
                            </Typography>
                        </div>
                    </Button>
                </div>
            )}
        </div>
    );
};