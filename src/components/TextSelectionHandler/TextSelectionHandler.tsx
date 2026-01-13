'use client';

import { useState, useEffect, useCallback } from 'react';
import QuoteCard from '../QuoteCard/QuoteCard';
import styles from '../QuoteCard/QuoteCard.module.css';

interface TextSelectionHandlerProps {
    articleTitle: string;
}

export default function TextSelectionHandler({ articleTitle }: TextSelectionHandlerProps) {
    const [selectedText, setSelectedText] = useState('');
    const [buttonPosition, setButtonPosition] = useState<{ x: number; y: number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelection = useCallback(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (text && text.length > 10 && text.length < 500) {
            const range = selection?.getRangeAt(0);
            const rect = range?.getBoundingClientRect();

            if (rect) {
                setSelectedText(text);
                setButtonPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.bottom + window.scrollY + 10
                });
            }
        } else {
            setButtonPosition(null);
        }
    }, []);

    const handleClickOutside = useCallback(() => {
        // Small delay to allow button click to register
        setTimeout(() => {
            const selection = window.getSelection();
            if (!selection?.toString().trim()) {
                setButtonPosition(null);
            }
        }, 100);
    }, []);

    useEffect(() => {
        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('touchend', handleSelection);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('touchend', handleSelection);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleSelection, handleClickOutside]);

    const handleCreateQuote = () => {
        setIsModalOpen(true);
        setButtonPosition(null);
        window.getSelection()?.removeAllRanges();
    };

    return (
        <>
            {buttonPosition && (
                <button
                    className={styles.selectionButton}
                    style={{
                        left: `${Math.max(80, Math.min(buttonPosition.x - 60, window.innerWidth - 180))}px`,
                        top: `${buttonPosition.y}px`
                    }}
                    onClick={handleCreateQuote}
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
