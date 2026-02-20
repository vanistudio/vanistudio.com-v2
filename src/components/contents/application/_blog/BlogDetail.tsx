import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { usePageTitle } from '@/hooks/use-page-title';
import { api } from '@/lib/api';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  thumbnail: string | null;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  authorName: string | null;
  authorAvatar: string | null;
  viewCount: number;
  readingTime: number | null;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  usePageTitle(post?.title || "Blog");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (api.api.app.blog as any)[slug].get()
      .then(({ data }: any) => {
        if (data?.success) setPost(data.post);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col w-full">
        <AppDashed noTopBorder padding="p-0">
          <div className="flex items-center justify-center py-20">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground" />
          </div>
        </AppDashed>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col w-full">
        <AppDashed noTopBorder padding="p-0">
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Icon icon="solar:document-text-bold-duotone" className="text-5xl text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">Không tìm thấy bài viết</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/blog')}>
              <Icon icon="solar:arrow-left-bold" className="text-sm mr-1.5" />
              Quay lại Blog
            </Button>
          </div>
        </AppDashed>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => navigate('/blog')}>
            <Icon icon="solar:arrow-left-bold" className="text-sm" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-title truncate">{post.title}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                {post.authorAvatar ? (
                  <img src={post.authorAvatar} alt="" className="size-4 rounded-full object-cover" />
                ) : (
                  <div className="size-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon icon="solar:user-bold-duotone" className="text-[8px] text-primary" />
                  </div>
                )}
                <span className="text-xs text-muted-foreground">{post.authorName || 'Vani Studio'}</span>
              </div>
              <span className="text-xs text-muted-foreground/50">·</span>
              <span className="text-xs text-muted-foreground">{formatDate(post.publishedAt || post.createdAt)}</span>
              {post.readingTime && post.readingTime > 0 && (
                <>
                  <span className="text-xs text-muted-foreground/50">·</span>
                  <span className="text-xs text-muted-foreground">{post.readingTime} phút đọc</span>
                </>
              )}
              <span className="text-xs text-muted-foreground/50">·</span>
              <span className="text-xs text-muted-foreground">{post.viewCount} lượt xem</span>
            </div>
          </div>
        </div>
      </AppDashed>
      {(post.coverImage || post.thumbnail) && (
        <AppDashed noTopBorder padding="p-0">
          <div className="w-full h-[300px] overflow-hidden">
            <img
              src={post.coverImage || post.thumbnail || ''}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </AppDashed>
      )}
      {(post.category || (post.tags && post.tags.length > 0)) && (
        <AppDashed noTopBorder padding="p-4">
          <div className="flex items-center flex-wrap gap-2">
            {post.category && (
              <Badge variant="secondary" className="text-xs font-medium">
                {post.category}
              </Badge>
            )}
            {post.tags && post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </AppDashed>
      )}
      <AppDashed noTopBorder padding="p-4">
        <article
          className="prose dark:prose-invert prose-sm max-w-none text-foreground/90"
          dangerouslySetInnerHTML={{ __html: post.content || '<p class="text-muted-foreground">Chưa có nội dung.</p>' }}
        />
      </AppDashed>
      <AppDashed noTopBorder withDotGrid padding="p-6">
        <div className="flex items-center justify-center">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/blog')}>
            <Icon icon="solar:arrow-left-bold" className="text-sm mr-1.5" />
            Quay lại danh sách
          </Button>
        </div>
      </AppDashed>
    </div>
  );
}
