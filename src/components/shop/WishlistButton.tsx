'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleWishlist } from '@/app/actions/wishlist-actions';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

interface WishlistButtonProps {
    productId: string;
    initialIsFavorited?: boolean;
    className?: string; // Allow custom positioning/styling
}

export default function WishlistButton({ productId, initialIsFavorited = false, className = '' }: WishlistButtonProps) {
    const { isSignedIn } = useUser();
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [isPending, startTransition] = useTransition();

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if inside a Link
        e.stopPropagation();

        if (!isSignedIn) {
            toast.error('התחברו כדי לשמור מועדפים');
            return;
        }

        // Optimistic Update
        const previousState = isFavorited;
        setIsFavorited(!isFavorited);

        startTransition(async () => {
            const res = await toggleWishlist(productId);
            if (!res.success) {
                // Revert if failed
                setIsFavorited(previousState);
                toast.error('שגיאה בעדכון המועדפים');
            } else {
                if (res.isFavorited) {
                    toast.success('נוסף למועדפים! ❤️');
                } else {
                    toast('הוסר מהמועדפים');
                }
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            className={`
                group rounded-full transition-all duration-300
                hover:bg-white/90 hover:shadow-sm
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center
                ${className}
            `}
            disabled={isPending}
            aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                className={`
                    w-5 h-5 transition-all duration-300
                    ${isFavorited
                        ? 'fill-red-500 text-red-500 scale-110'
                        : 'text-stone-600 fill-transparent group-hover:scale-110 group-hover:text-red-400'
                    }
                `}
                strokeWidth={isFavorited ? 0 : 2}
            />
        </button>
    );
}
