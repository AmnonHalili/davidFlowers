"use client";

import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus, Trash, Video, Star, StarOff, Plus } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

export interface MediaItem {
    url: string;
    type: 'IMAGE' | 'VIDEO';
    isMain: boolean;
}

interface ImageUploadProps {
    value: MediaItem[];
    onChange: (value: MediaItem[]) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
    const [videoUrl, setVideoUrl] = useState('');

    // ✅ Core fix: The Cloudinary widget creates the onSuccess callback once and never
    // recreates it — so `value` inside it is always the stale initial empty array.
    // A ref always points to the latest value, solving the stale-closure bug
    // where uploading 2+ files would only save the last one.
    const valueRef = useRef<MediaItem[]>(value);
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const onUpload = (result: any) => {
        const current = valueRef.current;
        const newItem: MediaItem = {
            url: result.info.secure_url,
            type: result.info.resource_type === 'video' ? 'VIDEO' : 'IMAGE',
            isMain: current.length === 0, // first item auto-becomes main
        };
        onChange([...current, newItem]);
    };

    const onRemove = (url: string) => {
        const newList = value.filter((item) => item.url !== url);
        // If we removed the main item, promote the next one
        if (value.find((m) => m.url === url)?.isMain && newList.length > 0) {
            newList[0] = { ...newList[0], isMain: true };
        }
        onChange(newList);
    };

    const onToggleMain = (url: string) => {
        onChange(value.map((item) => ({ ...item, isMain: item.url === url })));
    };

    const addVideoUrl = () => {
        if (!videoUrl.trim()) return;
        const current = valueRef.current;
        const newItem: MediaItem = {
            url: videoUrl.trim(),
            type: 'VIDEO',
            isMain: current.length === 0,
        };
        onChange([...current, newItem]);
        setVideoUrl('');
    };

    return (
        <div className="space-y-4">
            {/* Uploaded media grid */}
            {value.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {value.map((item) => (
                        <div
                            key={item.url}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${item.isMain
                                    ? 'border-david-green ring-2 ring-david-green/20'
                                    : 'border-stone-100 hover:border-stone-200'
                                }`}
                        >
                            {/* Action buttons */}
                            <div className="z-20 absolute top-2 right-2 flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => onToggleMain(item.url)}
                                    title={item.isMain ? 'תמונה ראשית' : 'הפוך לראשית'}
                                    className={`p-1.5 rounded-full shadow-sm transition-colors ${item.isMain
                                            ? 'bg-david-green text-white'
                                            : 'bg-white/90 text-stone-400 hover:text-david-green'
                                        }`}
                                >
                                    {item.isMain ? (
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                    ) : (
                                        <StarOff className="w-3.5 h-3.5" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onRemove(item.url)}
                                    className="bg-rose-500/90 text-white p-1.5 rounded-full shadow-sm hover:bg-rose-600 transition-colors"
                                >
                                    <Trash className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Preview */}
                            {item.type === 'IMAGE' ? (
                                <Image className="object-cover" alt="Product" src={item.url} fill />
                            ) : (
                                <div className="w-full h-full bg-stone-900 flex items-center justify-center relative">
                                    <Video className="text-white w-8 h-8 opacity-50" />
                                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                                        VIDEO
                                    </div>
                                </div>
                            )}

                            {/* Main badge */}
                            {item.isMain && (
                                <div className="absolute bottom-0 inset-x-0 bg-david-green text-white text-[10px] font-bold py-1 text-center uppercase tracking-tighter">
                                    ראשית
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload controls */}
            <div className="flex flex-col md:flex-row gap-4 pt-2">
                <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    onSuccess={onUpload}
                    options={{
                        multiple: true,
                        resourceType: 'auto',
                        clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp', 'gif', 'mp4', 'mov', 'webm'],
                        maxFiles: 20,
                    }}
                >
                    {({ open }) => (
                        <button
                            type="button"
                            onClick={() => open()}
                            className="flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-700 px-6 py-3 rounded-xl transition-all border border-stone-200 shadow-sm font-medium whitespace-nowrap"
                        >
                            <ImagePlus className="w-5 h-5 shrink-0" />
                            <span>העלה תמונות / סרטונים</span>
                            {value.length > 0 && (
                                <span className="bg-david-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {value.length}
                                </span>
                            )}
                        </button>
                    )}
                </CldUploadWidget>

                {/* Video URL paste input */}
                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        placeholder="או הדבק קישור לסרטון (MP4 ישיר)"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addVideoUrl();
                            }
                        }}
                        className="flex-1 text-right p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                    />
                    <button
                        type="button"
                        onClick={addVideoUrl}
                        disabled={!videoUrl.trim()}
                        className="bg-stone-900 text-white p-3 rounded-xl hover:bg-stone-800 transition-all disabled:opacity-40"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {value.length === 0 && (
                <p className="text-xs text-stone-400 text-center">
                    ניתן לבחור מספר תמונות וסרטונים בו-זמנית
                </p>
            )}
        </div>
    );
}
