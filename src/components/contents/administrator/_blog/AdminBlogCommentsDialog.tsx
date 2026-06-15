"use client";

import React, { useMemo } from "react";
import { Icon } from "@iconify/react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSetting } from "@/contexts/SettingContext";
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";

interface AdminBlogCommentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: {
    id: string;
    title: string;
  } | null;
}

export function AdminBlogCommentsDialog({
  open,
  onOpenChange,
  blog,
}: AdminBlogCommentsDialogProps) {
  const setting = useSetting();
  const siteTimezone = setting?.siteTimezone || "Asia/Ho_Chi_Minh";

  const { data: comments, isLoading, refetch } = trpc.blog.getComments.useQuery(
    { blogId: blog?.id || "" },
    { enabled: open && !!blog?.id }
  );

  const deleteMutation = trpc.blog.deleteComment.useMutation({
    onSuccess: () => {
      toast.success("Đã xóa bình luận thành công!");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Không thể xóa bình luận này");
    },
  });

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatTime = (dateStr: string | Date) => {
    return formatWithSiteTimezone(dateStr, siteTimezone, "DD/MM/YYYY HH:mm");
  };

  const { rootComments, repliesMap } = useMemo(() => {
    const root: typeof comments = [];
    const replies: Record<string, typeof comments> = {};

    if (comments) {
      comments.forEach((c) => {
        if (!c.parentId) {
          root.push(c);
        }
      });

      comments.forEach((c) => {
        if (c.parentId) {
          let currentParentId = c.parentId;
          let iterations = 0;
          while (iterations < 10) {
            const parent = comments.find((pc) => pc.id === currentParentId);
            if (!parent) break;
            if (!parent.parentId) {
              currentParentId = parent.id;
              break;
            }
            currentParentId = parent.parentId;
            iterations++;
          }

          if (!replies[currentParentId]) {
            replies[currentParentId] = [];
          }
          replies[currentParentId]!.push(c);
        }
      });
    }

    return { rootComments: root, repliesMap: replies };
  }, [comments]);

  if (!blog) return null;

  const handleDelete = async (commentId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bình luận này không? (Thao tác này sẽ xóa toàn bộ phản hồi liên quan)")) {
      try {
        await deleteMutation.mutateAsync({ commentId });
      } catch {}
    }
  };

  const renderCommentItem = (comment: any, isReply = false) => {
    const isDeleting = deleteMutation.isPending && deleteMutation.variables?.commentId === comment.id;

    return (
      <div
        key={comment.id}
        className={`group relative flex gap-3 p-3 rounded-xl border border-border/40 bg-background/50 transition-colors hover:bg-background/80 ${
          isReply ? "ml-8 border-l-2 border-l-vanixjnk/40 bg-muted/10" : ""
        }`}
      >
        <div className="size-8 rounded-full bg-vanixjnk/15 border border-vanixjnk/25 flex items-center justify-center text-vanixjnk font-bold text-xs shrink-0 select-none overflow-hidden">
          {comment.user?.image ? (
            <img src={comment.user.image} alt={comment.user.name} className="aspect-square size-full rounded-full object-cover" />
          ) : (
            <span>{getInitials(comment.user?.name || "Anonymous")}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-foreground">
                  {comment.user?.name || "N/A"}
                </span>
                {comment.user?.username && (
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1 py-0.5 rounded">
                    @{comment.user.username}
                  </span>
                )}
                {comment.likes > 0 && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/10 border border-red-500/20">
                    <Icon icon="solar:heart-bold" className="mr-0.5 size-2.5 text-red-500" />
                    {comment.likes}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {comment.user?.email || "Chưa cập nhật email"} · {formatTime(comment.createdAt)}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              disabled={isDeleting}
              onClick={() => handleDelete(comment.id)}
              className="size-6 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Xóa bình luận"
            >
              {isDeleting ? (
                <Icon icon="solar:restart-line-duotone" className="size-3.5 animate-spin" />
              ) : (
                <Icon icon="solar:trash-bin-trash-line-duotone" className="size-3.5" />
              )}
            </Button>
          </div>

          <p className="mt-2 text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
            {comment.content}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] max-h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
            <Icon icon="solar:chat-line-line-duotone" className="text-xl text-vanixjnk shrink-0" />
            <span>Quản lý Bình luận</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground line-clamp-1">
            Quản lý bình luận của bài viết: <span className="text-foreground font-semibold">{blog.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 bg-muted/5">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-3 border border-border/40 rounded-xl bg-background animate-pulse">
                  <div className="size-8 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-32 bg-muted rounded" />
                    <div className="h-3 w-24 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : rootComments.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
              <Icon icon="solar:mailbox-line-duotone" className="size-12 text-muted-foreground/40" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Không có bình luận</h4>
                <p className="text-xs text-muted-foreground">Bài viết này chưa nhận được bình luận nào từ người đọc.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {rootComments.map((comment) => {
                const replies = repliesMap[comment.id] || [];
                return (
                  <div key={comment.id} className="space-y-3">
                    {renderCommentItem(comment)}
                    {replies.map((reply) => renderCommentItem(reply, true))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
