"use client";

import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus, Trash } from 'lucide-react';

interface ImageUploadProps {
    value: string[];
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
}

export default function ImageUpload({
    value,
    onChange,
    onRemove
}: ImageUploadProps) {
    const onUpload = (result: any) => {
        onChange(result.info.secure_url);
    };

    return (
        <div>
            <div className="mb-4 flex items-center gap-4">
                {value.map((url) => (
                    <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
                        <div className="z-10 absolute top-2 right-2">
                            <button
                                type="button"
                                onClick={() => onRemove(url)}
                                className="bg-rose-500 text-white p-1 rounded-full shadow-sm hover:bg-rose-600 transition-colors"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                        <img
                            className="object-cover w-full h-full"
                            alt="Image"
                            src={url}
                        />
                    </div>
                ))}
            </div>

            <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onUpload={onUpload} // Note: onUpload is deprecated in newer versions for onSuccess, but let's try standard first or check docs if failed. Actually simpler is onSuccess for v6
                onSuccess={onUpload}
            >
                {({ open }) => {
                    const onClick = () => {
                        open();
                    }

                    return (
                        <button
                            type="button"
                            onClick={onClick}
                            className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-2 rounded-lg transition-colors border border-stone-200"
                        >
                            <ImagePlus className="w-4 h-4" />
                            <span>העלה תמונה</span>
                        </button>
                    )
                }}
            </CldUploadWidget>
        </div>
    );
}
