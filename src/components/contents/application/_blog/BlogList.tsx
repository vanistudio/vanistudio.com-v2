import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { usePageTitle } from '@/hooks/use-page-title';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
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
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link to={`/blog/${post.slug}`} className="flex flex-col gap-2 cursor-pointer group w-full p-3">
      <div className="p-[4px] rounded-[10px] border border-border">
        <div className="relative w-full bg-muted-background rounded-[6px] border border-border h-[180px] overflow-hidden select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {post.thumbnail ? (
            <img alt={post.title} loading="lazy" className="w-full h-full object-cover" src={post.thumbnail} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/30">
              <Icon icon="solar:document-text-bold-duotone" className="text-4xl text-muted-foreground/30" />
            </div>
          )}
          {post.isFeatured && (
            <div className="absolute top-2 left-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-primary/30 bg-primary/15 text-primary">
                Nổi bật
              </span>
            </div>
          )}
          {post.category && (
            <div className="absolute top-2 right-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border bg-background/80 text-muted-foreground">
                {post.category}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="px-1 flex flex-col gap-1">
        <h3 className="text-sm font-bold text-title truncate">{post.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{post.excerpt}</p>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-2">
            {post.authorAvatar ? (
              <img src={post.authorAvatar} alt="" className="size-4 rounded-full object-cover" />
            ) : (
              <div className="size-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon icon="solar:user-bold-duotone" className="text-[8px] text-primary" />
              </div>
            )}
            <span className="text-[10px] text-muted-foreground">{post.authorName || 'Vani Studio'}</span>
            <span className="text-[10px] text-muted-foreground/50">·</span>
            <span className="text-[10px] text-muted-foreground">{formatDate(post.publishedAt || post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            {post.readingTime && post.readingTime > 0 && (
              <span className="text-[10px] text-muted-foreground">{post.readingTime} phút đọc</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BlogList() {
  usePageTitle("Blog");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPosts = (searchQuery?: string) => {
    setLoading(true);
    const queryParams: Record<string, string> = { limit: '50' };
    if (searchQuery) queryParams.search = searchQuery;

    (api.api.app.blog as any).get({ query: queryParams })
      .then(({ data }: any) => {
        if (data?.success) setPosts(data.posts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(search);
  };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-5">
        <div className="flex flex-col items-center gap-1.5">
          <div className="p-3 rounded-xl bg-primary/10 mb-1">
            <Icon icon="solar:document-text-bold-duotone" className="text-3xl text-primary" />
          </div>
          <h1 className="text-xl font-bold text-title">Blog</h1>
          <p className="text-sm text-muted-foreground text-center max-w-lg">
            Chia sẻ kiến thức, kinh nghiệm và xu hướng công nghệ
          </p>
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-3">
        <form onSubmit={handleSearch} className="flex items-center justify-center">
          <div className="relative w-full max-w-md">
            <Icon icon="solar:magnifer-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" />
            <Input
              className="text-sm pl-9 h-9"
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
      </AppDashed>
      <AppDashed noTopBorder padding="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Icon icon="solar:document-text-bold-duotone" className="text-5xl text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">
              {search ? "Không tìm thấy bài viết" : "Chưa có bài viết nào"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </AppDashed>
    </div>
  );
}
