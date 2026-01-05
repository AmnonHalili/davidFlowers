'use client';

import { createDemoOrder } from "@/app/actions/demo-actions";
import { Plus } from "lucide-react";
import { useState } from "react";

export function DemoOrderButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        await createDemoOrder();
        setIsLoading(false);
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors text-sm font-medium"
        >
            <Plus className="w-4 h-4" />
            {isLoading ? 'יוצר...' : 'צור הזמנת דמו'}
        </button>
    );
}
