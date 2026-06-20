"use client"
"use no memo"

import * as React from "react"
import { type Editor } from "@tiptap/react"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Toggle,
} from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface ToolbarProps {
    editor: Editor | null
    mode: "edit" | "source" | "preview"
    onModeChange: (mode: "edit" | "source" | "preview") => void
    modeType?: "rich-text" | "code" | "css-js"
}

export function Toolbar({ editor, mode, onModeChange, modeType = "rich-text" }: ToolbarProps) {
    const [linkUrl, setLinkUrl] = React.useState("")
    const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false)

    const [imageUrl, setImageUrl] = React.useState("")
    const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false)

    if (!editor) return null
    const handleAddLink = (e: React.FormEvent) => {
        e.preventDefault()
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run()
            setLinkUrl("")
            setIsLinkDialogOpen(false)
        }
    }

    const handleAddImage = (e: React.FormEvent) => {
        e.preventDefault()
        if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run()
            setImageUrl("")
            setIsImageDialogOpen(false)
        }
    }

    const setHeading = (value: string) => {
        if (value === "paragraph") {
            editor.chain().focus().setParagraph().run()
        } else {
            const level = parseInt(value.replace("h", "")) as 1 | 2 | 3 | 4
            editor.chain().focus().setHeading({ level }).run()
        }
    }

    const currentHeading = () => {
        if (editor.isActive("heading", { level: 1 })) return "h1"
        if (editor.isActive("heading", { level: 2 })) return "h2"
        if (editor.isActive("heading", { level: 3 })) return "h3"
        if (editor.isActive("heading", { level: 4 })) return "h4"
        return "paragraph"
    }

    return (
        <>
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Chèn liên kết</DialogTitle>
                        <DialogDescription>
                            Nhập địa chỉ URL bạn muốn chèn vào nội dung.
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="link-url" className="text-right">URL</Label>
                                <Input
                                    id="link-url"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault()
                                            handleAddLink(e)
                                        }
                                    }}
                                    placeholder="https://example.com"
                                    className="col-span-3"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" onClick={handleAddLink} variant="vanixjnk" className="font-bold">Hoàn tất</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Chèn hình ảnh</DialogTitle>
                        <DialogDescription>
                            Nhập địa chỉ URL của hình ảnh bạn muốn chèn.
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="image-url" className="text-right">URL Ảnh</Label>
                                <Input
                                    id="image-url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault()
                                            handleAddImage(e)
                                        }
                                    }}
                                    placeholder="https://example.com/image.jpg"
                                    className="col-span-3"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" onClick={handleAddImage} variant="vanixjnk" className="font-bold">Chèn ảnh</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="sticky top-0 z-10 bg-muted/40 border-b backdrop-blur-md">
                <ScrollArea className="w-full">
                    <div className="flex items-center gap-1.5 px-3 py-2">
                        {modeType !== "css-js" && (
                            <div className="flex items-center gap-1 rounded-md p-1 border shrink-0 shadow-sm">
                                {modeType === "rich-text" && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button type="button" variant={mode === "edit" ? "secondary" : "ghost"} size="sm" onClick={() => onModeChange("edit")} className="h-7 px-2.5 gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                                                <Icon icon="solar:text-square-line-duotone" className="h-3.5 w-3.5" /> Edit
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Chế độ soạn thảo</TooltipContent>
                                    </Tooltip>
                                )}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant={mode === "source" ? "secondary" : "ghost"} size="sm" onClick={() => onModeChange("source")} className="h-7 px-2.5 gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                                            <Icon icon="solar:code-square-line-duotone" className="h-3.5 w-3.5" /> Source
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{modeType === "code" ? "Chế độ mã nguồn" : "Chế độ mã HTML"}</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant={mode === "preview" ? "secondary" : "ghost"} size="sm" onClick={() => onModeChange("preview")} className="h-7 px-2.5 gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                                            <Icon icon="solar:eye-line-duotone" className="h-3.5 w-3.5" /> Preview
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Xem trước hiển thị thực tế</TooltipContent>
                                </Tooltip>
                            </div>
                        )}

                        <div className="flex items-center gap-0.5 shrink-0 border p-0.5 rounded-md shadow-sm">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo() || mode !== "edit"} className="h-8 w-8 p-0">
                                        <Icon icon="solar:undo-left-line-duotone" className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Hoàn tác (Ctrl+Z)</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo() || mode !== "edit"} className="h-8 w-8 p-0">
                                        <Icon icon="solar:undo-right-line-duotone" className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Làm lại (Ctrl+Y)</TooltipContent>
                            </Tooltip>
                        </div>

                        <div className={cn("flex items-center gap-2 shrink-0 transition-opacity", mode !== "edit" && "pointer-events-none opacity-50")}>
                            <div className="flex items-center gap-0.5 border p-0.5 rounded-md shadow-sm">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()} className="h-8 w-8 p-0 data-[state=on]:bg-vanixjnk/15 data-[state=on]:text-vanixjnk transition-colors">
                                            <Icon icon="solar:text-bold-line-duotone" className="h-4 w-4" />
                                        </Toggle>
                                    </TooltipTrigger>
                                    <TooltipContent>In đậm</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Toggle size="sm" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()} className="h-8 w-8 p-0 data-[state=on]:bg-vanixjnk/15 data-[state=on]:text-vanixjnk transition-colors">
                                            <Icon icon="solar:text-italic-line-duotone" className="h-4 w-4" />
                                        </Toggle>
                                    </TooltipTrigger>
                                    <TooltipContent>In nghiêng</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Toggle size="sm" pressed={editor.isActive("underline")} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} className="h-8 w-8 p-0 data-[state=on]:bg-vanixjnk/15 data-[state=on]:text-vanixjnk transition-colors">
                                            <Icon icon="solar:text-underline-line-duotone" className="h-4 w-4" />
                                        </Toggle>
                                    </TooltipTrigger>
                                    <TooltipContent>Gạch chân</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Toggle size="sm" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()} className="h-8 w-8 p-0 data-[state=on]:bg-vanixjnk/15 data-[state=on]:text-vanixjnk transition-colors">
                                            <Icon icon="solar:text-cross-line-duotone" className="h-4 w-4" />
                                        </Toggle>
                                    </TooltipTrigger>
                                    <TooltipContent>Gạch ngang</TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="flex items-center gap-0.5 border p-0.5 rounded-md shadow-sm">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Toggle size="sm" pressed={editor.isActive("subscript")} onPressedChange={() => editor.chain().focus().toggleSubscript().run()} className="h-8 w-8 p-0 data-[state=on]:bg-vanixjnk/15 data-[state=on]:text-vanixjnk transition-colors">
                                            <Icon icon="solar:sort-from-bottom-to-top-line-duotone" className="h-4 w-4" />
                                        </Toggle>
                                    </TooltipTrigger>
                                    <TooltipContent>Chỉ số dưới</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Toggle size="sm" pressed={editor.isActive("superscript")} onPressedChange={() => editor.chain().focus().toggleSuperscript().run()} className="h-8 w-8 p-0 data-[state=on]:bg-vanixjnk/15 data-[state=on]:text-vanixjnk transition-colors">
                                            <Icon icon="solar:sort-from-top-to-bottom-line-duotone" className="h-4 w-4" />
                                        </Toggle>
                                    </TooltipTrigger>
                                    <TooltipContent>Chỉ số trên</TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="flex items-center gap-0.5 border p-0.5 rounded-md shadow-sm">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Toggle size="sm" pressed={editor.isActive({ textAlign: "left" })} onPressedChange={() => editor.chain().focus().setTextAlign("left").run()} className="h-8 w-8 p-0 data-[state=on]:bg-vanixjnk/15 data-[state=on]:text-vanixjnk transition-colors">
                                            <Icon icon="solar:align-left-line-duotone" className="h-4 w-4" />
                                        </Toggle>
                                    </TooltipTrigger>
                                    <TooltipContent>Căn trái</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Toggle size="sm" pressed={editor.isActive({ textAlign: "center" })} onPressedChange={() => editor.chain().focus().setTextAlign("center").run()} className="h-8 w-8 p-0 data-[state=on]:bg-vanixjnk/15 data-[state=on]:text-vanixjnk transition-colors">
                                            <Icon icon="solar:align-horizontal-center-line-duotone" className="h-4 w-4" />
                                        </Toggle>
                                    </TooltipTrigger>
                                    <TooltipContent>Căn giữa</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Toggle size="sm" pressed={editor.isActive({ textAlign: "right" })} onPressedChange={() => editor.chain().focus().setTextAlign("right").run()} className="h-8 w-8 p-0 data-[state=on]:bg-vanixjnk/15 data-[state=on]:text-vanixjnk transition-colors">
                                            <Icon icon="solar:align-right-line-duotone" className="h-4 w-4" />
                                        </Toggle>
                                    </TooltipTrigger>
                                    <TooltipContent>Căn phải</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Toggle size="sm" pressed={editor.isActive({ textAlign: "justify" })} onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()} className="h-8 w-8 p-0 data-[state=on]:bg-vanixjnk/15 data-[state=on]:text-vanixjnk transition-colors">
                                            <Icon icon="solar:hamburger-menu-line-duotone" className="h-4 w-4" />
                                        </Toggle>
                                    </TooltipTrigger>
                                    <TooltipContent>Căn đều</TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="flex items-center gap-0.5 border p-0.5 rounded-md shadow-sm">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Toggle size="sm" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} className="h-8 w-8 p-0 data-[state=on]:bg-vanixjnk/15 data-[state=on]:text-vanixjnk transition-colors">
                                            <Icon icon="solar:list-check-minimalistic-line-duotone" className="h-4 w-4" />
                                        </Toggle>
                                    </TooltipTrigger>
                                    <TooltipContent>Danh sách gạch đầu dòng</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Toggle size="sm" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} className="h-8 w-8 p-0 data-[state=on]:bg-vanixjnk/15 data-[state=on]:text-vanixjnk transition-colors">
                                            <Icon icon="solar:list-line-duotone" className="h-4 w-4" />
                                        </Toggle>
                                    </TooltipTrigger>
                                    <TooltipContent>Danh sách số</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Toggle size="sm" pressed={editor.isActive("taskList")} onPressedChange={() => editor.chain().focus().toggleTaskList().run()} className="h-8 w-8 p-0 data-[state=on]:bg-vanixjnk/15 data-[state=on]:text-vanixjnk transition-colors">
                                            <Icon icon="solar:check-square-line-duotone" className="h-4 w-4" />
                                        </Toggle>
                                    </TooltipTrigger>
                                    <TooltipContent>Danh sách công việc</TooltipContent>
                                </Tooltip>
                            </div>

                            <Separator orientation="vertical" className="h-6 shrink-0 bg-border/60" />

                            <div className="flex items-center gap-0.5 border p-0.5 rounded-md shadow-sm">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Toggle size="sm" pressed={editor.isActive("link")} onPressedChange={() => setIsLinkDialogOpen(true)} className="h-8 w-8 p-0 data-[state=on]:bg-vanixjnk/15 data-[state=on]:text-vanixjnk transition-colors">
                                            <Icon icon="solar:link-line-duotone" className="h-4 w-4" />
                                        </Toggle>
                                    </TooltipTrigger>
                                    <TooltipContent>Liên kết</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsImageDialogOpen(true)} className="h-8 w-8 p-0">
                                            <Icon icon="solar:gallery-wide-line-duotone" className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Hình ảnh</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="h-8 w-8 p-0">
                                            <Icon icon="solar:minus-circle-line-duotone" className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Đường kẻ ngang</TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="flex items-center gap-0.5 border p-0.5 rounded-md shadow-sm">
                                <Popover>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <PopoverTrigger asChild>
                                                <Button type="button" variant={editor.isActive("table") ? "secondary" : "ghost"} size="sm" className="h-8 w-8 p-0 data-[state=open]:bg-vanixjnk/15 data-[state=open]:text-vanixjnk transition-colors">
                                                    <Icon icon="solar:server-square-line-duotone" className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>Bảng</TooltipContent>
                                    </Tooltip>
                                    <PopoverContent className="w-fit p-2 flex flex-col gap-1">
                                        <Button type="button" variant="ghost" size="sm" className="justify-start gap-2" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                                            <Icon icon="solar:add-circle-line-duotone" className="h-4 w-4" /> Chèn bảng 3x3
                                        </Button>
                                        <Separator />
                                        <div className="grid grid-cols-2 gap-1">
                                            <Button type="button" variant="ghost" size="sm" disabled={!editor.isActive("table")} onClick={() => editor.chain().focus().addColumnBefore().run()}>Thêm cột <Icon icon="solar:add-circle-line-duotone" className="ml-1 h-3 w-3" /></Button>
                                            <Button type="button" variant="ghost" size="sm" disabled={!editor.isActive("table")} onClick={() => editor.chain().focus().deleteColumn().run()}>Xóa cột <Icon icon="solar:trash-bin-trash-line-duotone" className="ml-1 h-3 w-3" /></Button>
                                            <Button type="button" variant="ghost" size="sm" disabled={!editor.isActive("table")} onClick={() => editor.chain().focus().addRowBefore().run()}>Thêm hàng <Icon icon="solar:add-circle-line-duotone" className="ml-1 h-3 w-3" /></Button>
                                            <Button type="button" variant="ghost" size="sm" disabled={!editor.isActive("table")} onClick={() => editor.chain().focus().deleteRow().run()}>Xóa hàng <Icon icon="solar:trash-bin-trash-line-duotone" className="ml-1 h-3 w-3" /></Button>
                                        </div>
                                        <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-1" disabled={!editor.isActive("table")} onClick={() => editor.chain().focus().deleteTable().run()}>
                                            <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 h-4 w-4" /> Xóa toàn bộ bảng
                                        </Button>
                                    </PopoverContent>
                                </Popover>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors">
                                            <Icon icon="solar:eraser-line-duotone" className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Xóa định dạng</TooltipContent>
                                </Tooltip>
                            </div>

                            <Select value={currentHeading()} onValueChange={setHeading}>
                                <SelectTrigger className="h-10 min-w-[150px] text-xs font-semibold focus:ring-0 focus:ring-offset-0 transition-colors">
                                    <SelectValue placeholder="Định dạng" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="paragraph" className="font-medium">Văn bản thường</SelectItem>
                                    <SelectItem value="h1" className="text-xl font-bold">Tiêu đề 1</SelectItem>
                                    <SelectItem value="h2" className="text-lg font-bold">Tiêu đề 2</SelectItem>
                                    <SelectItem value="h3" className="text-base font-bold">Tiêu đề 3</SelectItem>
                                    <SelectItem value="h4" className="text-sm font-bold">Tiêu đề 4</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </>
    )
}