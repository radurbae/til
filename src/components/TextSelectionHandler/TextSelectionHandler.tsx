'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import QuoteCard from '../QuoteCard/QuoteCard';
import styles from '../QuoteCard/QuoteCard.module.css';

interface TextSelectionHandlerProps {
    articleTitle: string;
}

export default function TextSelectionHandler({ articleTitle }: TextSelectionHandlerProps) {
    const [selectedText, setSelectedText] = useState('');
    const [buttonPosition, setButtonPosition] = useState<{ x: number; y: number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const checkSelection = useCallback(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (text && text.length > 10 && text.length < 500) {
            const range = selection?.getRangeAt(0);
            const rect = range?.getBoundingClientRect();

            if (rect && rect.width > 0) {
                setSelectedText(text);

                const buttonWidth = 180;
                const x = Math.max(
                    buttonWidth / 2 + 10,
                    Math.min(
                        rect.left + rect.width / 2,
                        window.innerWidth - buttonWidth / 2 - 10
                    )
                );

                setButtonPosition({
                    x: x,
                    y: rect.bottom + window.scrollY + 15
                });
            }
        } else {
            setButtonPosition(null);
        }
    }, []);

    const handleSelectionChange = useCallback(() => {
        if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current);
        }

        selectionTimeoutRef.current = setTimeout(() => {
            checkSelection();
        }, 300);
    }, [checkSelection]);

    const handleTouchEnd = useCallback(() => {
        if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current);
        }

        selectionTimeoutRef.current = setTimeout(() => {
            checkSelection();
        }, 500);
    }, [checkSelection]);

    const handleMouseUp = useCallback(() => {
        if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current);
        }

        selectionTimeoutRef.current = setTimeout(() => {
            checkSelection();
        }, 100);
    }, [checkSelection]);

    const handleClickOutside = useCallback((e: MouseEvent | TouchEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest(`.${styles.selectionButton}`)) {
            return;
        }

        setTimeout(() => {
            const selection = window.getSelection();
            if (!selection?.toString().trim()) {
                setButtonPosition(null);
            }
        }, 200);
    }, []);

    useEffect(() => {
        document.addEventListener('selectionchange', handleSelectionChange);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);

            if (selectionTimeoutRef.current) {
                clearTimeout(selectionTimeoutRef.current);
            }
        };
    }, [handleSelectionChange, handleMouseUp, handleTouchEnd, handleClickOutside]);

    const handleCreateQuote = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsModalOpen(true);
        setButtonPosition(null);
    };

    return (
        <>
            {buttonPosition && (
                <button
                    className={styles.selectionButton}
                    style={{
                        left: `${buttonPosition.x}px`,
                        top: `${buttonPosition.y}px`,
                        transform: 'translateX(-50%)'
                    }}
                    onClick={handleCreateQuote}
                    onTouchEnd={handleCreateQuote}
                >
                    📷 Buat Quote
                </button>
            )}

            <QuoteCard
                quote={selectedText}
                source={articleTitle}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
