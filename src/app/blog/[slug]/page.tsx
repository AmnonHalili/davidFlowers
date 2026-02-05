import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock, User, ArrowLeft } from 'lucide-react';

interface BlogPostPageProps {
    params: { slug: string };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const post = await (prisma as any).blogPost.findUnique({
        where: { slug: params.slug }
    });

    if (!post) return {};

    const title = post.metaTitle || `${post.title} | פרחי דוד - בלוג`;
    const description = post.metaDescription || post.excerpt;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: post.image ? [post.image] : [],
        }
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const post = await (prisma as any).blogPost.findUnique({
        where: { slug: params.slug }
    });

    if (!post || !post.isPublished) {
        notFound();
    }

    const otherPosts = await (prisma as any).blogPost.findMany({
        where: {
            slug: { not: params.slug },
            isPublished: true
        },
        take: 3,
        orderBy: { publishedAt: 'desc' }
    });

    const formattedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

    return (
        <article className="min-h-screen pt-32 pb-32 bg-white" dir="rtl">
            <div className="max-w-screen-md mx-auto px-6">

                {/* Breadcrumbs */}
                <Link
                    href="/blog"
                    className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors mb-12 group"
                >
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    <span>חזרה לבלוג</span>
                </Link>

                {/* Article Header */}
                <header className="space-y-8 mb-16 text-center">
                    <div className="flex items-center justify-center gap-6 text-[10px] uppercase tracking-widest text-stone-400">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            <span>{post.author}</span>
                        </div>
                    </div>

                    <h1 className="font-serif text-4xl md:text-6xl text-stone-900 leading-[1.1]">
                        {post.title}
                    </h1>

                    <p className="text-xl text-stone-500 font-light leading-relaxed italic">
                        {post.excerpt}
                    </p>
                </header>

                {/* Main Image */}
                {post.image && (
                    <div className="aspect-[16/9] bg-stone-100 mb-16 overflow-hidden">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-headings:font-normal prose-p:text-stone-600 prose-p:font-light prose-p:leading-loose prose-strong:font-medium xl:prose-xl">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                {/* Footer / Related Items */}
                <div className="mt-32 pt-16 border-t border-stone-100">
                    <h3 className="font-serif text-2xl text-stone-900 mb-12">קראו גם</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {otherPosts.map((other: any) => (
                            <Link key={other.id} href={`/blog/${other.slug}`} className="group space-y-3">
                                <h4 className="font-serif text-xl text-stone-900 group-hover:text-david-green transition-colors">
                                    {other.title}
                                </h4>
                                <p className="text-sm text-stone-500 font-light line-clamp-2">
                                    {other.excerpt}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </article>
    );
}
