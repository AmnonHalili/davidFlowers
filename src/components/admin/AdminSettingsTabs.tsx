'use client';

import { useState } from 'react';
import { Sparkles, Megaphone, Sliders } from 'lucide-react';
import HeroSettingsManager from '@/components/admin/HeroSettingsManager';
import AnnouncementSettingsForm from '@/components/admin/AnnouncementSettingsForm';
import { HeroConfig } from '@/types/hero';

interface AdminSettingsTabsProps {
    heroConfig: HeroConfig;
    announcementConfig: {
        isActive: boolean;
        text: string;
    };
}

export default function AdminSettingsTabs({ heroConfig, announcementConfig }: AdminSettingsTabsProps) {
    const [activeTab, setActiveTab] = useState<'hero' | 'announcement'>('hero');

    return (
        <div className="space-y-6" dir="rtl">
            {/* Tabs Header */}
            <div className="flex border-b border-stone-200 gap-2">
                <button
                    type="button"
                    onClick={() => setActiveTab('hero')}
                    className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${activeTab === 'hero'
                        ? 'border-david-green text-david-green bg-emerald-50/30'
                        : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
                        }`}
                >
                    <Sparkles className="w-4 h-4" />
                    <span>מסך פתיחה (Hero) - תמונות וסרטונים</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('announcement')}
                    className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${activeTab === 'announcement'
                        ? 'border-david-green text-david-green bg-emerald-50/30'
                        : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
                        }`}
                >
                    <Megaphone className="w-4 h-4" />
                    <span>פס הודעות עליון ומבצעים</span>
                </button>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'hero' ? (
                    <HeroSettingsManager initialConfig={heroConfig} />
                ) : (
                    <div className="max-w-3xl">
                        <AnnouncementSettingsForm initialConfig={announcementConfig} />
                    </div>
                )}
            </div>
        </div>
    );
}
