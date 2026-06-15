"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface BlogCommentsProps {
  blogId: string;
}

export function BlogComments({ blogId }: BlogCommentsProps) {
  const { data: session } = useSession();
  const [commentText, setCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const { data: comments, refetch, isLoading: isCommentsLoading } = trpc.blog.getComments.useQuery(
    { blogId },
    { refetchOnWindowFocus: false }
  );

  const addCommentMutation = trpc.blog.addComment.useMutation({
    onSuccess: () => {
      refetch();
      setCommentText("");
      setReplyToId(null);
      setReplyText("");
      toast.success("Gửi bình luận thành công!");
    },
    onError: (err) => {
      toast.error(err.message || "Lỗi khi gửi bình luận");
    },
  });

  const deleteCommentMutation = trpc.blog.deleteComment.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Đã xóa bình luận thành công!");
    },
    onError: (err) => {
      toast.error(err.message || "Không thể xóa bình luận này");
    },
  });

  const likeCommentMutation = trpc.blog.likeComment.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Không thể thích bình luận này");
    },
  });
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
          let rootAncestorId = currentParentId;
          
          const visited = new Set<string>();
          while (currentParentId && !visited.has(currentParentId)) {
            visited.add(currentParentId);
            const parent = comments.find((p) => p.id === currentParentId);
            if (!parent) break;
            rootAncestorId = parent.id;
            currentParentId = parent.parentId ?? "";
          }

          if (!replies[rootAncestorId]) {
            replies[rootAncestorId] = [];
          }
          replies[rootAncestorId]!.push(c);
        }
      });
    }

    return { rootComments: root, repliesMap: replies };
  }, [comments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      await addCommentMutation.mutateAsync({
        blogId,
        content: commentText,
        parentId: null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim()) return;

    try {
      setSubmitting(true);
      await addCommentMutation.mutateAsync({
        blogId,
        content: replyText,
        parentId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (commentId: string) => {
    setCommentToDelete(commentId);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (commentToDelete) {
      try {
        await deleteCommentMutation.mutateAsync({ commentId: commentToDelete });
      } finally {
        setIsDeleteOpen(false);
        setCommentToDelete(null);
      }
    }
  };

  const handleLikeComment = async (commentId: string) => {
    const hasLiked = localStorage.getItem(`liked_comment_${commentId}`);
    if (hasLiked) {
      toast.info("Bạn đã thích bình luận này rồi");
      return;
    }
    localStorage.setItem(`liked_comment_${commentId}`, "true");
    await likeCommentMutation.mutateAsync({ commentId });
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatTimeAgo = (dateStr: string | Date) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "Vừa xong";
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Vừa xong";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} giờ`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderComment = (comment: any, isReply = false) => {
    const hasReplies = !!(repliesMap[comment.id] && repliesMap[comment.id]!.length > 0);
    const isAuthor = session?.user?.id === comment.userId;
    const isAdmin = (session?.user as any)?.role === "admin";
    const canDelete = isAuthor || isAdmin;
    let replyToUser: string | null = null;
    if (isReply && comment.parentId) {
      const parentComment = comments?.find((c) => c.id === comment.parentId);
      if (parentComment && parentComment.userId !== comment.userId) {
        replyToUser = parentComment.user.name;
      }
    }

    const hasLikedLocal = typeof window !== "undefined" && !!localStorage.getItem(`liked_comment_${comment.id}`);

    return (
      <div key={comment.id} className="flex flex-col gap-2">
        <div className="flex items-start gap-2 text-left">
          <span className={cn("group/avatar relative flex shrink-0 rounded-full select-none border border-border overflow-hidden", isReply ? "size-7" : "size-8")}>
            {comment.user.image ? (
              <img className="aspect-square size-full rounded-full object-cover" src={comment.user.image} alt={comment.user.name} />
            ) : (
              <span className="size-full flex items-center justify-center bg-vanixjnk/15 text-vanixjnk font-bold text-[10px] sm:text-xs select-none">
                {getInitials(comment.user.name)}
              </span>
            )}
          </span>

          <div className="min-w-0 flex-1">
            <div className="w-fit rounded-2xl bg-muted/40 dark:bg-muted/10 border border-border/20 px-3 py-2 shadow-xs max-w-full">
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className="text-[13px] font-bold text-foreground hover:underline cursor-pointer">
                  {comment.user.name || "Thành viên"}
                </span>
                {comment.user.name === "Vani Studio Admin" || (isAdmin && isAuthor) ? (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20 select-none">
                    Admin
                  </span>
                ) : null}
              </div>
              <p className="whitespace-pre-wrap wrap-break-word text-xs sm:text-sm text-foreground/95 leading-normal">
                {replyToUser && (
                  <span className="mr-1.5 font-bold text-vanixjnk select-none hover:underline cursor-pointer">
                    @{replyToUser}
                  </span>
                )}
                {comment.content}
              </p>
            </div>
            <div className="mt-0.5 flex items-center gap-3 px-3 text-[11px] text-muted-foreground select-none">
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={cn(
                  "font-bold transition hover:underline",
                  hasLikedLocal ? "text-rose-500" : "text-muted-foreground hover:text-foreground"
                )}
                type="button"
              >
                {comment.likes > 0 ? `❤️ Yêu thích · ${comment.likes}` : "Thích"}
              </button>

              {session?.user && (
                <button
                  onClick={() => {
                    setReplyToId(replyToId === comment.id ? null : comment.id);
                    setReplyText("");
                  }}
                  className={cn(
                    "font-bold transition hover:underline",
                    replyToId === comment.id ? "text-rose-500 hover:text-rose-600" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {replyToId === comment.id ? "Hủy" : "Trả lời"}
                </button>
              )}

              {canDelete && (
                <button
                  onClick={() => handleOpenDelete(comment.id)}
                  className="font-bold text-muted-foreground hover:text-rose-500 transition hover:underline"
                  title="Xóa bình luận"
                >
                  Xóa
                </button>
              )}
              <span className="text-[10px] opacity-75">{formatTimeAgo(comment.createdAt)}</span>
            </div>
            {replyToId === comment.id && session?.user && (
              <div className="mt-2 flex items-center gap-2 py-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="size-7 rounded-full bg-vanixjnk/15 border border-vanixjnk/25 flex items-center justify-center text-vanixjnk font-bold text-[10px] shrink-0 select-none overflow-hidden">
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name} className="aspect-square size-full rounded-full object-cover" />
                  ) : (
                    <span>{getInitials(session.user.name)}</span>
                  )}
                </div>
                <div className="relative flex-1 flex items-center gap-2">
                  <Input
                    placeholder={`Phản hồi bình luận của ${comment.user.name || "thành viên"}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={submitting}
                    className="h-8 w-full"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitReply(comment.id);
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    variant={"vanixjnk"}
                    disabled={submitting || !replyText.trim()}
                    onClick={() => handleSubmitReply(comment.id)}
                    className="size-7 shrink-0 rounded-full"
                  >
                    {submitting ? (
                      <Icon icon="solar:restart-line-duotone" className="size-3.5 animate-spin" />
                    ) : (
                      <Icon icon="solar:plain-2-line-duotone" className="size-3.5" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px] px-2"
                    onClick={() => setReplyToId(null)}
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            )}
            {hasReplies && !isReply && (
              <div className="ml-8 mt-3 flex flex-col gap-3 border-l border-border/80 pl-3">
                {repliesMap[comment.id]?.map((reply) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full border-t border-border/60 pt-8 mt-10">
      <div className="flex items-center gap-2 mb-6 text-left">
        <Icon icon="solar:chat-line-line-duotone" className="size-5 text-vanixjnk" />
        <h3 className="text-base sm:text-lg font-bold text-foreground">
          Bình luận ({comments?.length ?? 0})
        </h3>
      </div>
      <div className="mb-8">
        {session?.user ? (
          <form onSubmit={handleSubmitComment}>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-vanixjnk/15 border border-vanixjnk/25 flex items-center justify-center text-vanixjnk font-bold text-xs shrink-0 select-none overflow-hidden">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name} className="aspect-square size-full rounded-full object-cover" />
                ) : (
                  <span>{getInitials(session.user.name)}</span>
                )}
              </div>
              <div className="relative flex-1 flex items-center gap-2">
                <Input
                  placeholder="Viết bình luận..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={submitting}
                  className="h-9 w-full"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size={"lg"}
                  variant={"vanixjnk"}
                  disabled={submitting || !commentText.trim()}
                >
                  {submitting ? (
                    <Icon icon="solar:restart-line-duotone" className="size-4 animate-spin" />
                  ) : (
                    <Icon icon="solar:plain-2-line-duotone" className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-6 border border-dashed border-border rounded-xl bg-muted/5 flex flex-col items-center justify-center text-center gap-3">
            <Icon icon="solar:lock-password-line-duotone" className="size-8 text-muted-foreground/60" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">Yêu cầu đăng nhập</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Vui lòng đăng nhập tài khoản của bạn để viết ý kiến và bình luận bài viết này.
              </p>
            </div>
            <Link href="/login" className="inline-flex h-9 items-center justify-center rounded-lg bg-vanixjnk/10 border border-vanixjnk/20 px-4 text-xs font-bold text-vanixjnk hover:bg-vanixjnk/20 transition-colors mt-1">
              Đăng nhập ngay
            </Link>
          </div>
        )}
      </div>
      <div className="space-y-4">
        {isCommentsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 p-4 border border-border/40 rounded-xl bg-card/10">
                <div className="size-9 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : rootComments.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center gap-2">
            <Icon icon="solar:mailbox-line-duotone" className="size-10 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rootComments.map((comment) => renderComment(comment))}
          </div>
        )}
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500 text-left font-bold">
              <Icon icon="solar:danger-triangle-line-duotone" className="text-xl shrink-0" />
              <span>Xác nhận xóa bình luận</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground text-left leading-relaxed">
            Bạn có chắc chắn muốn xóa bình luận này không? Thao tác này không thể hoàn tác và bình luận sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống.
          </div>
          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending && (
                <Icon icon="solar:restart-line-duotone" className="mr-1.5 size-4 animate-spin" />
              )}
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
