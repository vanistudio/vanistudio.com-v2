"use client"
"use no memo"

import * as React from "react"
import { useTheme } from "next-themes"
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror"
import { oneDark } from "@codemirror/theme-one-dark"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { javascript } from "@codemirror/lang-javascript"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { Underline } from "@tiptap/extension-underline"
import { Highlight } from "@tiptap/extension-highlight"
import { Link } from "@tiptap/extension-link"
import { Image } from "@tiptap/extension-image"
import { TextAlign } from "@tiptap/extension-text-align"
import { Placeholder } from "@tiptap/extension-placeholder"
import { Heading } from "@tiptap/extension-heading"
import { HorizontalRule } from "@tiptap/extension-horizontal-rule"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import { TaskList } from "@tiptap/extension-task-list"
import { TaskItem } from "@tiptap/extension-task-item"
import { Typography } from "@tiptap/extension-typography"
import { CharacterCount } from "@tiptap/extension-character-count"
import { Node, Extension, Mark } from "@tiptap/core"
import { Toolbar } from "./sexy-editor-toolbar"
import { cn } from "@/lib/utils"

const StyleExtension = Node.create({
    name: 'style',
    group: 'block',
    content: 'text*',
    parseHTML() {
        return [{ tag: 'style' }]
    },
    renderHTML({ HTMLAttributes }) {
        return ['style', HTMLAttributes, 0]
    },
})

const CoreAttributes = Extension.create({
    name: 'coreAttributes',
    addGlobalAttributes() {
        return [
            {
                types: ['paragraph', 'heading', 'table', 'tableRow', 'tableCell', 'tableHeader', 'style', 'taskItem', 'listItem', 'bulletList', 'orderedList', 'image', 'link', 'textStyle', 'div', 'span'],
                attributes: {
                    class: {
                        default: null,
                        parseHTML: (element: HTMLElement) => element.getAttribute('class'),
                        renderHTML: (attributes: Record<string, any>) => attributes.class ? { class: attributes.class } : {},
                    },
                    style: {
                        default: null,
                        parseHTML: (element: HTMLElement) => element.getAttribute('style'),
                        renderHTML: (attributes: Record<string, any>) => attributes.style ? { style: attributes.style } : {},
                    },
                    id: {
                        default: null,
                        parseHTML: (element: HTMLElement) => element.getAttribute('id'),
                        renderHTML: (attributes: Record<string, any>) => attributes.id ? { id: attributes.id } : {},
                    }
                },
            },
        ]
    },
})

const DivNode = Node.create({
    name: 'div',
    group: 'block',
    content: 'block*',
    parseHTML() {
        return [{ tag: 'div' }]
    },
    renderHTML({ HTMLAttributes }) {
        return ['div', HTMLAttributes, 0]
    },
})

const SpanNode = Mark.create({
    name: 'span',
    parseHTML() {
        return [{ tag: 'span' }]
    },
    renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
        return ['span', HTMLAttributes, 0]
    },
})

function extractHtmlEnvelope(html: string) {
    if (!html) return { prefix: "", content: "", suffix: "" }
    const commentMatch = html.match(/(^[\s\S]*?<!--\s*email-body-start\s*-->)([\s\S]*?)(<!--\s*email-body-end\s*-->[\s\S]*?$)/i)
    if (commentMatch) {
        return { prefix: commentMatch[1], content: commentMatch[2], suffix: commentMatch[3] }
    }
    const match = html.match(/(^[\s\S]*?<body[^>]*>)([\s\S]*?)(<\/body>[\s\S]*?$)/i)
    if (match) {
        return { prefix: match[1], content: match[2], suffix: match[3] }
    }
    return { prefix: "", content: html, suffix: "" }
}

interface SexyEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    isEmail?: boolean
    modeType?: "rich-text" | "code" | "css-js"
}

export interface SexyEditorRef {
    insertContent: (content: string) => void;
    getEditor: () => any;
}

export const SexyEditor = React.forwardRef<SexyEditorRef, SexyEditorProps>(function SexyEditor({
    value,
    onChange,
    placeholder = "Nhập nội dung tại đây...",
    className,
    isEmail = false,
    modeType = "rich-text",
}, ref) {
    const [mode, setMode] = React.useState<"edit" | "source" | "preview">(
        isEmail ? "source" : (modeType === "rich-text" ? "edit" : "source")
    )
    const initialEnv = React.useMemo(() => extractHtmlEnvelope(value || ""), [])
    const envelopeRef = React.useRef({ prefix: initialEnv.prefix, suffix: initialEnv.suffix })
    const lastHtmlRef = React.useRef<string | null>(value)
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0)
    const { resolvedTheme } = useTheme()
    const codeMirrorRef = React.useRef<ReactCodeMirrorRef>(null)

    const extensions = React.useMemo(() => [
        StarterKit.configure({
            heading: false,
            horizontalRule: false,
        }),
        Heading.configure({
            levels: [1, 2, 3, 4],
        }),
        Underline,
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                class: "text-vanixjnk underline underline-offset-4 cursor-pointer",
            },
        }),
        Image.configure({
            HTMLAttributes: {
                class: "rounded-md border shadow-sm max-w-full h-auto my-4",
            },
        }),
        TextAlign.configure({
            types: ["heading", "paragraph"],
        }),
        TextStyle,
        Color,
        Highlight.configure({ multicolor: true }),
        Placeholder.configure({
            placeholder: placeholder,
            emptyEditorClass: "is-editor-empty",
        }),
        HorizontalRule,
        Subscript,
        Superscript,
        Table.configure({
            resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        TaskList,
        TaskItem.configure({
            nested: true,
        }),
        Typography,
        CharacterCount,
        StyleExtension,
        CoreAttributes,
        DivNode,
        SpanNode,
    ], [placeholder])

    const editor = useEditor({
        extensions,
        content: initialEnv.content,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            const finalContent = html === "<p></p>" ? "" : html
            const fullHtml = envelopeRef.current.prefix ? (envelopeRef.current.prefix + finalContent + envelopeRef.current.suffix) : finalContent
            lastHtmlRef.current = fullHtml
            onChange(fullHtml)
        },
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[350px] p-4",
                    className
                ),
            },
        },
    })

    React.useImperativeHandle(ref, () => ({
        insertContent: (content: string) => {
            if (mode === "source") {
                const view = codeMirrorRef.current?.view;
                if (view) {
                    const selection = view.state.selection.main;
                    view.dispatch({
                        changes: { from: selection.from, to: selection.to, insert: content },
                        selection: { anchor: selection.from + content.length },
                        userEvent: "input"
                    });
                    view.focus();
                    return;
                }
            }
            if (editor) {
                editor.commands.insertContent(content);
            }
        },
        getEditor: () => editor,
    }));

    React.useEffect(() => {
        if (!editor) return

        const handleTransaction = () => {
            forceUpdate()
        }

        editor.on("transaction", handleTransaction)
        return () => {
            editor.off("transaction", handleTransaction)
        }
    }, [editor])

    React.useEffect(() => {
        if (!editor || mode !== "edit") return

        const currentHTML = editor.getHTML()
        
        if (value === lastHtmlRef.current) return

        if (value !== currentHTML) {
            const isEmptyValue = value === "" || value === null || value === undefined
            const isEditorEmpty = currentHTML === "<p></p>" || currentHTML === ""

            if (isEmptyValue && isEditorEmpty) return

            const env = extractHtmlEnvelope(value || "")
            envelopeRef.current = { prefix: env.prefix, suffix: env.suffix }
            editor.commands.setContent(env.content)
            lastHtmlRef.current = value || ""
        }
    }, [value, mode, editor])

    const getLanguageExtension = () => {
        if (modeType === "css-js") {
            if (typeof value === "string" && value.includes("{") && (value.includes(":") || value.includes(";"))) {
                return [css()];
            }
            return [javascript()];
        }
        return [html()];
    };

    return (
        <div className="flex flex-col w-full border rounded-md overflow-hidden shadow-sm">
            {modeType !== "css-js" && (
                <Toolbar
                    editor={editor}
                    mode={mode}
                    onModeChange={setMode}
                    modeType={modeType}
                    isEmail={isEmail}
                />
            )}
            <div className="relative">
                {mode === "source" ? (
                    <div className="w-full min-h-[450px] bg-background border-none overflow-hidden">
                        <CodeMirror
                            ref={codeMirrorRef}
                            value={value}
                            height="450px"
                            theme={resolvedTheme === "light" ? "light" : oneDark}
                            extensions={getLanguageExtension()}
                            onChange={onChange}
                            placeholder={
                                modeType === "css-js"
                                    ? "Nhập mã CSS hoặc JS tùy chỉnh..."
                                    : placeholder || "Nhập mã HTML tại đây..."
                            }
                            className="w-full h-full text-xs font-mono"
                            basicSetup={{
                                lineNumbers: true,
                                foldGutter: true,
                                dropCursor: true,
                                allowMultipleSelections: true,
                                indentOnInput: true,
                            }}
                        />
                    </div>
                ) : mode === "preview" ? (
                    <div className="w-full min-h-[450px] p-4 lg:p-8 overflow-auto border-none">
                        <div 
                            className="mx-auto shadow-lg border rounded-md overflow-hidden max-w-[800px] min-h-[450px] transition-all bg-white"
                        >
                            {isEmail || (typeof value === 'string' && (value.includes('<html') || value.includes('<!DOCTYPE'))) ? (
                                <iframe 
                                    srcDoc={value} 
                                    className="w-full min-h-[600px] border-none bg-white"
                                    title="HTML Preview"
                                />
                            ) : (
                                <div 
                                    className="p-8 sm:p-12 prose prose-sm dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: value }} 
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    <EditorContent editor={editor} />
                )}

                {editor && (
                    <div className="absolute bottom-2 right-4 text-[10px] text-muted-foreground backdrop-blur-sm border px-2 py-0.5 rounded-full shadow-sm z-10">
                        {editor.storage.characterCount.characters()} ký tự | {editor.storage.characterCount.words()} từ
                    </div>
                )}

                <style jsx global>{`
                    .ProseMirror p.is-editor-empty:first-child::before {
                        content: attr(data-placeholder);
                        float: left;
                        color: #adb5bd;
                        pointer-events: none;
                        height: 0;
                    }
                    /* Task List Styling */
                    ul[data-type="taskList"] {
                        list-style: none;
                        padding: 0;
                    }
                    ul[data-type="taskList"] li {
                        display: flex;
                        align-items: flex-start;
                        gap: 0.5rem;
                        margin-bottom: 0.25rem;
                    }
                    ul[data-type="taskList"] input[type="checkbox"] {
                        margin-top: 0.25rem;
                        cursor: pointer;
                    }
                    /* Table Styling */
                    .ProseMirror table {
                        border-collapse: collapse;
                        table-layout: fixed;
                        width: 100%;
                        margin: 0;
                        overflow: hidden;
                    }
                    .ProseMirror td, .ProseMirror th {
                        min-width: 1em;
                        border: 1px solid #ced4da;
                        padding: 3px 5px;
                        vertical-align: top;
                        box-sizing: border-box;
                        position: relative;
                    }
                    .ProseMirror th {
                        font-weight: bold;
                        text-align: left;
                        background-color: rgba(0,0,0,0.05);
                    }
                `}</style>
            </div>
        </div>
    );
});