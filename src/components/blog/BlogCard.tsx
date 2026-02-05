'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BlogCardProps {
    title: string;
    slug: string;
    excerpt: string;
    image?: string | null;
    publishedAt: Date | string | null;
}

export default function BlogCard({ title, slug, excerpt, image, publishedAt }: BlogCardProps) {
    const formattedDate = publishedAt
        ? new Date(publishedAt).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

    return (
        <Link href={`/blog/${slug}`} className="group block space-y-4">
            <div className="aspect-[16/10] bg-stone-100 overflow-hidden rounded-sm relative">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <span className="font-serif text-4xl">D.F</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-stone-400">
                    <span>{formattedDate}</span>
                    <span className="w-1 h-1 rounded-full bg-stone-300" />
                    <span>מאמר</span>
                </div>

                <h3 className="font-serif text-2xl text-stone-900 group-hover:text-david-green transition-colors leading-tight">
                    {title}
                </h3>

                <p className="text-stone-500 text-sm font-light line-clamp-2 leading-relaxed">
                    {excerpt}
                </p>

                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest pt-2 text-stone-900 group-hover:gap-3 transition-all">
                    <span>קראו עוד</span>
                    <ArrowLeft className="w-4 h-4" />
                </div>
            </div>
        </Link>
    );
}
