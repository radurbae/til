'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useEffect } from 'react';
import styles from './RichTextEditor.module.css';
import { 
    Bold, 
    Italic, 
    Code, 
    List, 
    ListOrdered, 
    Quote, 
    Link as LinkIcon, 
    Minus, 
    Undo, 
    Redo, 
    Heading1, 
    Heading2, 
    Heading3 
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

function markdownToHtml(markdown: string): string {
    let html = markdown.replace(/\r\n/g, '\n').trim();

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Code blocks
    html = html.replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        (_match: string, lang: string, code: string) => `<pre><code class="language-${lang || ''}">${code}</code></pre>`
    );

    // Lists
    html = html.replace(/^\s*[-*+] (.+)$/gm, '<li data-list="ul">$1</li>');
    html = html.replace(/^\s*\d+\. (.+)$/gm, '<li data-list="ol">$1</li>');
    html = html.replace(/(<li data-list="ul">.*<\/li>\n?)+/g, (listMatch: string) => {
        return `<ul>${listMatch.replace(/ data-list="ul"/g, '')}</ul>`;
    });
    html = html.replace(/(<li data-list="ol">.*<\/li>\n?)+/g, (listMatch: string) => {
        return `<ol>${listMatch.replace(/ data-list="ol"/g, '')}</ol>`;
    });

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');

    // Inline styles
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Paragraphs
    if (!html) {
        return '<p></p>';
    }

    html = html
        .split('\n\n')
        .map((block: string) => {
            if (
                block.startsWith('<h') ||
                block.startsWith('<ul') ||
                block.startsWith('<ol') ||
                block.startsWith('<pre') ||
                block.startsWith('<blockquote') ||
                block.startsWith('<hr')
            ) {
                return block;
            }
            return `<p>${block.replace(/\n/g, '<br>')}</p>`;
        })
        .join('\n');

    return html;
}

// Convert TipTap HTML to Markdown
function htmlToMarkdown(html: string): string {
    let md = html;

    // Headers
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');

    // Bold and Italic
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');

    // Links
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

    // Lists
    md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
    });
    md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match: string, content: string) => {
        let index = 0;
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, (liMatch: string, item: string) => {
            index++;
            return `${index}. ${item}\n`;
        }) + '\n';
    });

    // Blockquotes
    md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
        const cleanContent = content.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1');
        return '> ' + cleanContent.trim() + '\n\n';
    });

    // Code blocks
    md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

    // Paragraphs
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

    // Line breaks
    md = md.replace(/<br\s*\/?>/gi, '\n');

    // Horizontal rules
    md = md.replace(/<hr\s*\/?>/gi, '---\n\n');

    // Remove remaining HTML tags
    md = md.replace(/<[^>]+>/g, '');

    // Decode HTML entities
    md = md.replace(/&nbsp;/g, ' ');
    md = md.replace(/&amp;/g, '&');
    md = md.replace(/&lt;/g, '<');
    md = md.replace(/&gt;/g, '>');
    md = md.replace(/&quot;/g, '"');

    // Clean up extra whitespace
    md = md.replace(/\n{3,}/g, '\n\n');
    md = md.trim();

    return md;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
}

function ToolbarButton({ onClick, isActive, disabled, children, title }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`${styles.toolbarButton} ${isActive ? styles.active : ''}`}
            title={title}
        >
            {children}
        </button>
    );
}

export default function RichTextEditor({ content, onChange, placeholder = 'Mulai menulis...' }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const markdown = htmlToMarkdown(html);
            onChange(markdown);
        },
        editorProps: {
            attributes: {
                class: styles.editorContent,
            },
        },
    });

    // Set initial content
    useEffect(() => {
        if (!editor) return;

        const targetMarkdown = (content || "").replace(/\r\n/g, "\n").trim();
        const currentMarkdown = htmlToMarkdown(editor.getHTML()).replace(/\r\n/g, "\n").trim();

        if (targetMarkdown !== currentMarkdown) {
            editor.commands.setContent(markdownToHtml(content || ""), { emitUpdate: false });
        }
    }, [editor, content]);

    const setLink = useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) {
        return <div className={styles.loading}>Loading editor...</div>;
    }



// ... (keep ToolbarButtonProps and ToolbarButton)

    return (
        <div className={styles.editor}>
            <div className={styles.toolbar}>
                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        title="Heading 1"
                    >
                        <Heading1 size={18} strokeWidth={1.5} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        title="Heading 2"
                    >
                        <Heading2 size={18} strokeWidth={1.5} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        title="Heading 3"
                    >
                        <Heading3 size={18} strokeWidth={1.5} />
                    </ToolbarButton>
                </div>

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Bold (Ctrl+B)"
                    >
                        <Bold size={18} strokeWidth={1.5} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italic (Ctrl+I)"
                    >
                        <Italic size={18} strokeWidth={1.5} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        isActive={editor.isActive('code')}
                        title="Inline Code"
                    >
                        <Code size={18} strokeWidth={1.5} />
                    </ToolbarButton>
                </div>

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Bullet List"
                    >
                        <List size={18} strokeWidth={1.5} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Numbered List"
                    >
                        <ListOrdered size={18} strokeWidth={1.5} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        title="Quote"
                    >
                        <Quote size={18} strokeWidth={1.5} />
                    </ToolbarButton>
                </div>

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        onClick={setLink}
                        isActive={editor.isActive('link')}
                        title="Add Link"
                    >
                        <LinkIcon size={18} strokeWidth={1.5} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Horizontal Rule"
                    >
                        <Minus size={18} strokeWidth={1.5} />
                    </ToolbarButton>
                </div>

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo size={18} strokeWidth={1.5} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo size={18} strokeWidth={1.5} />
                    </ToolbarButton>
                </div>
            </div>

            <EditorContent editor={editor} className={styles.editorWrapper} />
        </div>
    );
}
