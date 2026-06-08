import { Row } from "@tanstack/react-table"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onEdit?: (row: Row<TData>) => void
  onDelete?: (row: Row<TData>) => void
  onView?: (row: Row<TData>) => void
  customActions?: React.ReactNode
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
  onView,
  customActions
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-muted/50 rounded-md transition-none shadow-none"
        >
          <Icon icon="solar:menu-dots-line-duotone" className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Mở menu thao tác</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px] border-border">
        {onView && (
          <DropdownMenuItem onClick={() => onView(row)} className="font-semibold text-sm cursor-pointer">
            <Icon icon="solar:eye-line-duotone" className="mr-2 h-4 w-4 text-muted-foreground" />
            Xem chi tiết
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(row)} className="font-semibold text-sm cursor-pointer">
            <Icon icon="solar:pen-new-square-line-duotone" className="mr-2 h-4 w-4 text-primary" />
            Chỉnh sửa
          </DropdownMenuItem>
        )}
        {customActions && (
          <>
            {(onView || onEdit) && <DropdownMenuSeparator />}
            {customActions}
          </>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(row)} className="font-semibold text-sm cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10">
              <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 h-4 w-4" />
              Xóa bản ghi
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
