'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    Images,
    Film,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Save,
    RotateCcw,
    Eye,
    UploadCloud,
    Link as LinkIcon,
    Sparkles,
    Check,
    Sliders,
    Layers,
    Clock,
    MoveRight,
    MoveLeft,
    CheckCircle2,
    AlertCircle,
    Info,
    Smartphone,
    Monitor
} from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { toast } from 'sonner';
import {
    HeroConfig,
    HeroMediaItem,
    HeroMode,
    TransitionEffect,
    SlideDirection,
    DEFAULT_HERO_CONFIG,
    PRESET_HERO_MEDIA
} from '@/types/hero';
import { updateHeroConfig } from '@/app/actions/hero-actions';
import HeroImageSlider from '@/components/hero/HeroImageSlider';
import SeamlessVideoPlayer from '@/components/hero/SeamlessVideoPlayer';

interface HeroSettingsManagerProps {
    initialConfig: HeroConfig;
    isDemo?: boolean;
}

export default function HeroSettingsManager({ initialConfig, isDemo = false }: HeroSettingsManagerProps) {
    const [config, setConfig] = useState<HeroConfig>(initialConfig);
    const [isPending, startTransition] = useTransition();
    const [urlInput, setUrlInput] = useState('');
    const [urlType, setUrlType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
    const [urlTitle, setUrlTitle] = useState('');
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [showPresets, setShowPresets] = useState(false);

    // Filter items based on active mode
    const currentModeItems = config.items.filter(item =>
        config.mode === 'IMAGE' ? item.type === 'IMAGE' : item.type === 'VIDEO'
    );

    // Update specific config fields
    const updateField = <K extends keyof HeroConfig>(key: K, value: HeroConfig[K]) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    // Add new media item
    const handleAddMediaItem = (item: Omit<HeroMediaItem, 'id'>) => {
        const newItem: HeroMediaItem = {
            ...item,
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        };
        setConfig(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
    };

    // Cloudinary upload handler
    const handleCloudinaryUpload = (result: any) => {
        const url = result?.info?.secure_url;
        const resourceType = result?.info?.resource_type;
        if (!url) return;

        const isVideo = resourceType === 'video' || url.match(/\.(mp4|mov|webm)$/i);
        const type: 'IMAGE' | 'VIDEO' = isVideo ? 'VIDEO' : 'IMAGE';

        handleAddMediaItem({
            url,
            type,
            title: isVideo ? 'סרטון חדש שהועלה' : 'תמונה חדשה שהועלתה',
        });

        toast.success(isVideo ? 'הסרטון נוסף בהצלחה לרשימה!' : 'התמונה נוספה בהצלחה לרשימה!');
    };

    // Add from direct URL
    const handleAddUrl = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = urlInput.trim();
        if (!trimmed) {
            toast.error('נא להזין כתובת URL תקינה');
            return;
        }

        // Auto-detect format if possible
        const isVideoUrl = trimmed.match(/\.(mp4|mov|webm)(\?.*)?$/i);
        const resolvedType = isVideoUrl ? 'VIDEO' : urlType;

        handleAddMediaItem({
            url: trimmed,
            type: resolvedType,
            title: urlTitle.trim() || (resolvedType === 'VIDEO' ? 'סרטון מקישור' : 'תמונה מקישור'),
        });

        setUrlInput('');
        setUrlTitle('');
        toast.success('הפריט נוסף בהצלחה!');
    };

    // Remove media item
    const handleRemoveItem = (id: string) => {
        setConfig(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
        toast.info('הפריט הוסר');
    };

    // Reorder items
    const moveItem = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= config.items.length) return;

        setConfig(prev => {
            const newItems = [...prev.items];
            const temp = newItems[index];
            newItems[index] = newItems[targetIndex];
            newItems[targetIndex] = temp;
            return { ...prev, items: newItems };
        });
    };

    // Add preset item
    const handleAddPreset = (preset: HeroMediaItem) => {
        const alreadyExists = config.items.some(i => i.url === preset.url);
        if (alreadyExists) {
            toast.info('פריט זה כבר קיים ברשימה');
            return;
        }
        handleAddMediaItem({
            url: preset.url,
            type: preset.type,
            title: preset.title,
        });
        toast.success(`נוסף: ${preset.title}`);
    };

    // Save configuration
    const handleSave = () => {
        if (currentModeItems.length === 0) {
            toast.error(
                config.mode === 'IMAGE'
                    ? 'נא להוסיף לפחות תמונה אחת עבור מצגת התמונות'
                    : 'נא להוסיף לפחות סרטון אחד עבור נגן הוידאו'
            );
            return;
        }

        if (isDemo) {
            toast.success('מצב הדגמה: ההגדרות עודכנו בתצוגה המקדימה החיה למטה! (באדמין אמיתי יישמר למסד הנתונים)');
            return;
        }

        startTransition(async () => {
            const res = await updateHeroConfig(config);
            if (res.success) {
                toast.success('הגדרות מסך ה-Hero נשמרו ועודכנו באתר בהצלחה!');
            } else {
                toast.error(res.error || 'שגיאה בשמירת ההגדרות');
            }
        });
    };

    // Reset to defaults
    const handleReset = () => {
        if (!confirm('האם לאפס את כל הגדרות ה-Hero לברירת המחדל המקורית של החנות?')) return;
        setConfig(DEFAULT_HERO_CONFIG);
        toast.info('ההגדרות אופסו לברירת המחדל (לחץ שמור כדי להחיל באתר)');
    };

    return (
        <div className="space-y-8" dir="rtl">
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
                <div>
                    <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2.5">
                        <Sparkles className="w-6 h-6 text-david-green" />
                        ניהול מדיה במסך ה-Hero (דף הבית)
                    </h2>
                    <p className="text-sm text-stone-600 mt-1">
                        שליטה קלה ופשוטה בסרטונים או במצגת התמונות המתחלפת במסך הפתיחה הראשי של החנות.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2.5 border border-stone-300 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-sm font-medium transition-all"
                        title="איפוס הגדרות"
                    >
                        <RotateCcw className="w-4 h-4" />
                        איפוס
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-david-green hover:bg-david-green/90 text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isPending ? 'שומר שינויים...' : 'שמור שינויים באתר'}
                    </button>
                </div>
            </div>

            {/* Mode Selection Cards */}
            <div>
                <label className="block text-sm font-bold text-stone-800 mb-3">
                    1. בחירת אופן תצוגת מסך ה-Hero:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Image Carousel Mode */}
                    <button
                        type="button"
                        onClick={() => updateField('mode', 'IMAGE')}
                        className={`p-6 rounded-2xl border-2 text-right transition-all flex flex-col justify-between relative group ${config.mode === 'IMAGE'
                            ? 'border-david-green bg-emerald-50/40 ring-4 ring-david-green/10 shadow-sm'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                            }`}
                    >
                        <div className="flex items-start justify-between w-full mb-3">
                            <div className={`p-3 rounded-xl ${config.mode === 'IMAGE' ? 'bg-david-green text-white' : 'bg-stone-100 text-stone-600'}`}>
                                <Images className="w-6 h-6" />
                            </div>
                            {config.mode === 'IMAGE' && (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-david-green bg-white px-3 py-1 rounded-full border border-david-green/30 shadow-xs">
                                    <Check className="w-3.5 h-3.5" /> פעיל כרגע
                                </span>
                            )}
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-stone-900 mb-1">
                                מצגת תמונות מקצועית מתחלפת (Image Slider)
                            </h3>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                תמונות איכותיות מתחלפות בגלילה חלקה ימינה או שמאלה, עם תמיכה מלאה בהחלקת אצבע בסמארטפונים, אפקטי מעבר קולנועיים וכפתורי ניווט.
                            </p>
                        </div>
                    </button>

                    {/* Video Mode */}
                    <button
                        type="button"
                        onClick={() => updateField('mode', 'VIDEO')}
                        className={`p-6 rounded-2xl border-2 text-right transition-all flex flex-col justify-between relative group ${config.mode === 'VIDEO'
                            ? 'border-david-green bg-emerald-50/40 ring-4 ring-david-green/10 shadow-sm'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                            }`}
                    >
                        <div className="flex items-start justify-between w-full mb-3">
                            <div className={`p-3 rounded-xl ${config.mode === 'VIDEO' ? 'bg-david-green text-white' : 'bg-stone-100 text-stone-600'}`}>
                                <Film className="w-6 h-6" />
                            </div>
                            {config.mode === 'VIDEO' && (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-david-green bg-white px-3 py-1 rounded-full border border-david-green/30 shadow-xs">
                                    <Check className="w-3.5 h-3.5" /> פעיל כרגע
                                </span>
                            )}
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-stone-900 mb-1">
                                רצף סרטוני וידאו מתחלפים (Video Playlist)
                            </h3>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                סרטון בודד בלופ או רצף סרטונים שמתחלפים אוטומטית ברגע שהסרטון מסתיים במעבר רך (Crossfade), באוטופליי ללא סאונד המתאים לכל הדפדפנים.
                            </p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Media Items List & Upload */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                    <div>
                        <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-david-green" />
                            2. רשימת הפריטים עבור {config.mode === 'IMAGE' ? 'מצגת התמונות' : 'רצף הסרטונים'}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                            ניתן לשנות את סדר התצוגה בעזרת החצים, להסיר פריטים או להעלות חדשים.
                        </p>
                    </div>

                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-700 w-fit">
                        {currentModeItems.length} {config.mode === 'IMAGE' ? 'תמונות ברשימה' : 'סרטונים ברשימה'}
                    </span>
                </div>

                {/* Items Grid / List */}
                {currentModeItems.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <p className="font-medium text-stone-800">אין עדיין פריטים מסוג {config.mode === 'IMAGE' ? 'תמונה' : 'וידאו'}</p>
                        <p className="text-xs text-stone-500 mt-1">השתמש בכפתור ההעלאה למטה או בחר פריט מומלץ מהחנות</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {config.items.map((item, index) => {
                            // Only show items matching active mode, but keep full array indices
                            const isCurrentMode = config.mode === item.type;
                            if (!isCurrentMode) return null;

                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    className="relative flex flex-col justify-between border border-stone-200 bg-stone-50/60 rounded-xl overflow-hidden p-3 group hover:border-david-green/50 transition-all shadow-xs"
                                >
                                    {/* Preview Media */}
                                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-stone-900 mb-2 border border-stone-200">
                                        {item.type === 'IMAGE' ? (
                                            <Image
                                                src={item.url}
                                                alt={item.title || 'פריט Hero'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full relative">
                                                <video
                                                    src={item.url}
                                                    muted
                                                    playsInline
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                    <Film className="w-8 h-8 text-white/80" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Type & Index Badge */}
                                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                                            <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                                                #{index + 1}
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs text-white ${item.type === 'IMAGE' ? 'bg-david-green/90' : 'bg-purple-600/90'}`}>
                                                {item.type === 'IMAGE' ? 'תמונה' : 'וידאו'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Item Title / URL */}
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            value={item.title || ''}
                                            onChange={(e) => {
                                                const newTitle = e.target.value;
                                                setConfig(prev => ({
                                                    ...prev,
                                                    items: prev.items.map(it => it.id === item.id ? { ...it, title: newTitle } : it)
                                                }));
                                            }}
                                            placeholder="כותרת תיאורית לפריט..."
                                            className="w-full text-xs font-semibold text-stone-800 bg-white px-2 py-1.5 border border-stone-200 rounded-lg outline-none focus:border-david-green"
                                        />
                                        <p className="text-[11px] text-stone-400 truncate mt-1 dir-ltr text-left px-1">
                                            {item.url}
                                        </p>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => moveItem(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 disabled:opacity-30 disabled:hover:bg-white transition-colors"
                                                title="הזז קדימה"
                                            >
                                                <ArrowUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveItem(index, 'down')}
                                                disabled={index === config.items.length - 1}
                                                className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 disabled:opacity-30 disabled:hover:bg-white transition-colors"
                                                title="הזז אחורה"
                                            >
                                                <ArrowDown className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                                            title="מחק פריט זה"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Add New Media Controls */}
                <div className="pt-4 border-t border-stone-100 space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                        הוספת תמונות או סרטונים חדשים:
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Cloudinary Widget Uploader (Safeguarded if cloud name is not set locally) */}
                        {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
                            <CldUploadWidget
                                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                onSuccess={handleCloudinaryUpload}
                                options={{
                                    multiple: true,
                                    resourceType: 'auto',
                                    clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp', 'mp4', 'mov', 'webm'],
                                    maxFiles: 15,
                                }}
                            >
                                {({ open }) => (
                                    <button
                                        type="button"
                                        onClick={() => open()}
                                        className="flex items-center gap-2 bg-david-green hover:bg-david-green/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
                                    >
                                        <UploadCloud className="w-4 h-4" />
                                        <span>העלאת קבצים (מחשב / נייד)</span>
                                    </button>
                                )}
                            </CldUploadWidget>
                        ) : (
                            <button
                                type="button"
                                onClick={() => toast.info('להעלאת קבצים בענן נדרש מפתח Cloudinary ב-ENV. ניתן להדביק קישור ישיר או לבחור ממאגר החנות!')}
                                className="flex items-center gap-2 bg-david-green hover:bg-david-green/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
                            >
                                <UploadCloud className="w-4 h-4" />
                                <span>העלאת קבצים (מחשב / נייד)</span>
                            </button>
                        )}

                        {/* Quick Presets Toggle */}
                        <button
                            type="button"
                            onClick={() => setShowPresets(!showPresets)}
                            className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                        >
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <span>{showPresets ? 'סגור מאגר מובנה' : 'בחר ממאגר החנות הקיים'}</span>
                        </button>
                    </div>

                    {/* Presets Tray */}
                    <AnimatePresence>
                        {showPresets && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden border border-stone-200 bg-stone-50 rounded-xl p-4"
                            >
                                <p className="text-xs font-semibold text-stone-700 mb-3">
                                    לחץ להוספת תמונות וסרטונים איכותיים שכבר קיימים בחנות:
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {PRESET_HERO_MEDIA.map((preset) => {
                                        const isAlreadyAdded = config.items.some(i => i.url === preset.url);
                                        return (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => handleAddPreset(preset)}
                                                className={`p-2 rounded-lg text-right border text-xs transition-all flex flex-col justify-between ${isAlreadyAdded
                                                    ? 'border-emerald-300 bg-emerald-50/60 opacity-60'
                                                    : 'border-stone-200 bg-white hover:border-david-green'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1.5 w-full">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${preset.type === 'IMAGE' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>
                                                        {preset.type === 'IMAGE' ? 'תמונה' : 'סרטון'}
                                                    </span>
                                                    {isAlreadyAdded && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                                </div>
                                                <span className="font-medium text-stone-800 truncate block">{preset.title}</span>
                                                <span className="text-[10px] text-stone-400 truncate block dir-ltr">{preset.url}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Direct URL Input Form */}
                    <form onSubmit={handleAddUrl} className="flex flex-col sm:flex-row gap-2 pt-2">
                        <select
                            value={urlType}
                            onChange={(e) => setUrlType(e.target.value as 'IMAGE' | 'VIDEO')}
                            className="bg-stone-50 border border-stone-200 text-stone-700 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-david-green"
                        >
                            <option value="IMAGE">תמונה (URL)</option>
                            <option value="VIDEO">סרטון MP4 (URL)</option>
                        </select>

                        <input
                            type="text"
                            value={urlTitle}
                            onChange={(e) => setUrlTitle(e.target.value)}
                            placeholder="כותרת (אופציונלי)"
                            className="sm:w-1/4 p-2.5 text-xs border border-stone-200 rounded-xl outline-none focus:border-david-green"
                        />

                        <input
                            type="text"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="הדבק כאן קישור ישיר לתמונה או סרטון..."
                            className="flex-1 p-2.5 text-xs border border-stone-200 rounded-xl outline-none focus:border-david-green text-left dir-ltr"
                        />

                        <button
                            type="submit"
                            className="bg-stone-800 hover:bg-stone-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            הוסף מקישור
                        </button>
                    </form>
                </div>
            </div>

            {/* Playback & Visual Settings */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
                    <Sliders className="w-5 h-5 text-david-green" />
                    3. הגדרות מעבר, אנימציה ונראות
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Slide Interval (For Images) */}
                    {config.mode === 'IMAGE' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-david-green" />
                                מהירות החלפת שקופית (שניות):
                            </label>
                            <div className="flex gap-2">
                                {[3, 5, 7, 10].map((sec) => (
                                    <button
                                        key={sec}
                                        type="button"
                                        onClick={() => updateField('slideInterval', sec)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${config.slideInterval === sec
                                            ? 'bg-david-green text-white border-david-green'
                                            : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                                            }`}
                                    >
                                        {sec} שנ׳
                                    </button>
                                ))}
                            </div>
                            <p className="text-[11px] text-stone-500">
                                מומלץ 5 שניות לרושם איכותי ורגוע
                            </p>
                        </div>
                    )}

                    {/* Transition Effect (For Images) */}
                    {config.mode === 'IMAGE' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-700">
                                אפקט מעבר בין תמונות:
                            </label>
                            <select
                                value={config.transitionEffect}
                                onChange={(e) => updateField('transitionEffect', e.target.value as TransitionEffect)}
                                className="w-full p-2.5 text-xs font-medium border border-stone-200 rounded-xl outline-none focus:border-david-green bg-stone-50"
                            >
                                <option value="slide">גלילה אופקית מקצועית (Slide ימינה/שמאלה)</option>
                                <option value="fade">דעיכה ועמעום רך (Fade Crossfade)</option>
                                <option value="zoom">זום קולנועי עדין (Ken Burns Zoom)</option>
                            </select>
                            <p className="text-[11px] text-stone-500">
                                הגלילה האופקית מותאמת במיוחד לתנועה טבעית ימינה ושמאלה
                            </p>
                        </div>
                    )}

                    {/* Slide Direction */}
                    {config.mode === 'IMAGE' && config.transitionEffect === 'slide' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-700">
                                כיוון גלילה אוטומטית:
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateField('slideDirection', 'left')}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${config.slideDirection === 'left'
                                        ? 'bg-david-green text-white border-david-green'
                                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                                        }`}
                                >
                                    <MoveLeft className="w-3.5 h-3.5" />
                                    שמאלה (LTR)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateField('slideDirection', 'right')}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${config.slideDirection === 'right'
                                        ? 'bg-david-green text-white border-david-green'
                                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                                        }`}
                                >
                                    <MoveRight className="w-3.5 h-3.5" />
                                    ימינה (RTL)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Overlay Darkness Slider */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                            <span>רמת כהות שכבת כיסוי:</span>
                            <span className="text-david-green font-mono">{config.overlayOpacity}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="80"
                            step="5"
                            value={config.overlayOpacity}
                            onChange={(e) => updateField('overlayOpacity', Number(e.target.value))}
                            className="w-full accent-david-green cursor-pointer"
                        />
                        <p className="text-[11px] text-stone-500">
                            מבטיח שהכותרות והטקסט בלבן יישארו קריאים וחדים על גבי תמונות בהירות
                        </p>
                    </div>

                    {/* Navigation Buttons Toggles */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-stone-700 block">
                            כפתורי ניווט למבקרים:
                        </label>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                                <input
                                    type="checkbox"
                                    checked={config.showDots}
                                    onChange={(e) => updateField('showDots', e.target.checked)}
                                    className="accent-david-green rounded w-4 h-4 cursor-pointer"
                                />
                                <span>הצג נקודות מעבר בתחתית (Pagination Dots)</span>
                            </label>

                            {config.mode === 'IMAGE' && (
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                                    <input
                                        type="checkbox"
                                        checked={config.showArrows}
                                        onChange={(e) => updateField('showArrows', e.target.checked)}
                                        className="accent-david-green rounded w-4 h-4 cursor-pointer"
                                    />
                                    <span>הצג חיצי גלילה ימינה/שמאלה (Navigation Arrows)</span>
                                </label>
                            )}

                            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                                <input
                                    type="checkbox"
                                    checked={config.enableParallaxPetal}
                                    onChange={(e) => updateField('enableParallaxPetal', e.target.checked)}
                                    className="accent-david-green rounded w-4 h-4 cursor-pointer"
                                />
                                <span>אפקט עלי כותרת מרחפים (Parallax Petals)</span>
                            </label>
                        </div>
                    </div>

                    {/* Subtitle / Badge Text */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-700">
                            כותרת משנה תחת "פרחי דוד":
                        </label>
                        <input
                            type="text"
                            value={config.badgeText || ''}
                            onChange={(e) => updateField('badgeText', e.target.value)}
                            placeholder="אומנות השזירה באשקלון"
                            className="w-full p-2.5 text-xs font-medium border border-stone-200 rounded-xl outline-none focus:border-david-green bg-stone-50"
                        />
                        <p className="text-[11px] text-stone-500">
                            מופיע מתחת ללוגו הראשי במסך הפתיחה
                        </p>
                    </div>
                </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-david-green" />
                        4. תצוגה מקדימה חיה (Live Preview)
                    </h3>

                    {/* Device selector */}
                    <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setPreviewDevice('desktop')}
                            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${previewDevice === 'desktop' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'}`}
                        >
                            <Monitor className="w-3.5 h-3.5" />
                            מחשב
                        </button>
                        <button
                            type="button"
                            onClick={() => setPreviewDevice('mobile')}
                            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${previewDevice === 'mobile' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'}`}
                        >
                            <Smartphone className="w-3.5 h-3.5" />
                            מובייל
                        </button>
                    </div>
                </div>

                <div className="flex justify-center p-4 bg-stone-900 rounded-xl overflow-hidden">
                    <div
                        className={`relative rounded-xl overflow-hidden transition-all duration-300 shadow-2xl border border-stone-800 ${previewDevice === 'mobile' ? 'w-[320px] h-[520px]' : 'w-full max-w-4xl h-[420px]'
                            }`}
                    >
                        {/* Live Hero Simulation */}
                        {config.mode === 'IMAGE' ? (
                            <HeroImageSlider
                                items={currentModeItems.length > 0 ? currentModeItems : [{ id: '1', url: '/hero-bg.jpg', type: 'IMAGE' }]}
                                intervalSeconds={config.slideInterval}
                                transitionEffect={config.transitionEffect}
                                slideDirection={config.slideDirection}
                                showDots={config.showDots}
                                showArrows={config.showArrows}
                                overlayOpacity={config.overlayOpacity}
                            />
                        ) : (
                            <SeamlessVideoPlayer
                                videos={currentModeItems.length > 0 ? currentModeItems.map(i => i.url) : ['/David-Video.mp4']}
                                poster="/hero-bg.jpg"
                                overlayOpacity={config.overlayOpacity}
                                showDots={config.showDots}
                            />
                        )}

                        {/* Simulated Titles Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6 z-20 pointer-events-none">
                            <span className="font-bellefair text-4xl md:text-5xl drop-shadow-glow">פרחי דוד</span>
                            <span className="text-xs md:text-sm font-sans tracking-[0.2em] text-white/90 mt-1">
                                {config.badgeText || 'אומנות השזירה באשקלון'}
                            </span>
                            <p className="font-bellefair text-sm md:text-lg italic mt-3 text-stone-200">
                                "לשמח את מי שאתם אוהבים"
                            </p>
                            <div className="mt-4 px-6 py-2 bg-david-green/90 text-white text-xs font-bold rounded-full">
                                להזמנת משלוח
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex items-center gap-2 text-stone-600 text-xs text-center sm:text-right">
                    <Info className="w-4 h-4 text-david-green shrink-0" />
                    <span>כל שינוי שתשמור יתעדכן באופן מיידי בכל הדפים באתר ללא צורך בריענון.</span>
                </div>

                <div className="flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex-1 sm:flex-initial px-4 py-2.5 border border-stone-300 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-medium"
                    >
                        איפוס
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isPending}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 sm:px-7 py-2.5 bg-david-green hover:bg-david-green/90 text-white rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isPending ? 'שומר שינויים...' : 'שמור שינויים'}
                    </button>
                </div>
            </div>
        </div>
    );
}
