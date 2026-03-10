"use client";

import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus, Trash, Video, Star, StarOff, Plus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export interface MediaItem {
    url: string;
    type: 'IMAGE' | 'VIDEO';
    isMain: boolean;
}

interface ImageUploadProps {
    value: MediaItem[];
    onChange: (value: MediaItem[]) => void;
}

export default function ImageUpload({
    value,
    onChange
}: ImageUploadProps) {
    const [videoUrl, setVideoUrl] = useState('');

    const onUpload = (result: any) => {
        const newItem: MediaItem = {
            url: result.info.secure_url,
            type: result.info.resource_type === 'video' ? 'VIDEO' : 'IMAGE',
            isMain: value.length === 0 // Default first as main
        };
        onChange([...value, newItem]);
    };

    const onRemove = (url: string) => {
        onChange(value.filter((item) => item.url !== url));
    };

    const onToggleMain = (url: string) => {
        onChange(value.map((item) => ({
            ...item,
            isMain: item.url === url
        })));
    };

    const addVideoUrl = () => {
        if (!videoUrl) return;
        const newItem: MediaItem = {
            url: videoUrl,
            type: 'VIDEO',
            isMain: value.length === 0
        };
        onChange([...value, newItem]);
        setVideoUrl('');
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {value.map((item) => (
                    <div key={item.url} className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${item.isMain ? 'border-david-green ring-2 ring-david-green/20' : 'border-stone-100 hover:border-stone-200'}`}>
                        <div className="z-20 absolute top-2 right-2 flex gap-1">
                            <button
                                type="button"
                                onClick={() => onToggleMain(item.url)}
                                title={item.isMain ? "תמונה ראשית" : "הפוך לראשית"}
                                className={`p-1.5 rounded-full shadow-sm transition-colors ${item.isMain ? 'bg-david-green text-white' : 'bg-white/90 text-stone-400 hover:text-david-green'}`}
                            >
                                {item.isMain ? <Star className="w-3.5 h-3.5 fill-current" /> : <StarOff className="w-3.5 h-3.5" />}
                            </button>
                            <button
                                type="button"
                                onClick={() => onRemove(item.url)}
                                className="bg-rose-500/90 text-white p-1.5 rounded-full shadow-sm hover:bg-rose-600 transition-colors"
                            >
                                <Trash className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {item.type === 'IMAGE' ? (
                            <Image
                                className="object-cover"
                                alt="Product"
                                src={item.url}
                                fill
                            />
                        ) : (
                            <div className="w-full h-full bg-stone-900 flex items-center justify-center relative">
                                <Video className="text-white w-8 h-8 opacity-50" />
                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                                    VIDEO
                                </div>
                            </div>
                        )}

                        {item.isMain && (
                            <div className="absolute bottom-0 inset-x-0 bg-david-green text-white text-[10px] font-bold py-1 text-center uppercase tracking-tighter">
                                MAIN IMAGE
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-2">
                <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    onSuccess={onUpload}
                >
                    {({ open }) => (
                        <button
                            type="button"
                            onClick={() => open()}
                            className="flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-700 px-6 py-3 rounded-xl transition-all border border-stone-200 shadow-sm font-medium"
                        >
                            <ImagePlus className="w-5 h-5" />
                            <span>העלה תמונה/סרטון</span>
                        </button>
                    )}
                </CldUploadWidget>

                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        placeholder="או הדבק קישור לסרטון (YouTube/Vimeo/Direct)"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="flex-1 text-right p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                    />
                    <button
                        type="button"
                        onClick={addVideoUrl}
                        disabled={!videoUrl}
                        className="bg-stone-900 text-white p-3 rounded-xl hover:bg-stone-800 transition-all disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
