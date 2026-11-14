export type HeroMode = 'IMAGE' | 'VIDEO';
export type TransitionEffect = 'slide' | 'fade' | 'zoom';
export type SlideDirection = 'left' | 'right';

export interface HeroMediaItem {
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
    title?: string;
    alt?: string;
}

export interface HeroConfig {
    mode: HeroMode;
    items: HeroMediaItem[];
    slideInterval: number; // in seconds (for image carousel)
    transitionEffect: TransitionEffect;
    slideDirection: SlideDirection;
    showDots: boolean;
    showArrows: boolean;
    overlayOpacity: number; // 0 to 100 percent
    enableParallaxPetal: boolean;
    badgeText?: string;
}

export const DEFAULT_HERO_CONFIG: HeroConfig = {
    mode: 'VIDEO',
    items: [
        {
            id: 'default-vid-1',
            url: '/David-Video.mp4',
            type: 'VIDEO',
            title: 'סרטון ראשי - פרחי דוד',
            alt: 'סרטון רקע ראשי'
        },
        {
            id: 'default-vid-2',
            url: '/David-Video2.mp4',
            type: 'VIDEO',
            title: 'סרטון שזירה אמנותית',
            alt: 'שזירת פרחים מקצועית'
        },
        {
            id: 'default-vid-3',
            url: '/kling_20260116_Text_to_Video_Close_up_s_5012_0.mp4',
            type: 'VIDEO',
            title: 'סרטון תקריב זרי בוטיק',
            alt: 'תקריב זרי פרחים'
        }
    ],
    slideInterval: 5,
    transitionEffect: 'slide',
    slideDirection: 'left',
    showDots: true,
    showArrows: true,
    overlayOpacity: 35,
    enableParallaxPetal: true,
    badgeText: 'אומנות השזירה באשקלון'
};

// Preset recommendations store owners can quickly choose from
export const PRESET_HERO_MEDIA: HeroMediaItem[] = [
    {
        id: 'preset-vid-1',
        url: '/David-Video.mp4',
        type: 'VIDEO',
        title: 'סרטון חנות 1 (MP4)'
    },
    {
        id: 'preset-vid-2',
        url: '/David-Video2.mp4',
        type: 'VIDEO',
        title: 'סרטון חנות 2 (MP4)'
    },
    {
        id: 'preset-vid-3',
        url: '/kling_20260116_Text_to_Video_Close_up_s_5012_0.mp4',
        type: 'VIDEO',
        title: 'סרטון תקריב פרחים (MP4)'
    },
    {
        id: 'preset-img-1',
        url: '/hero-bg.jpg',
        type: 'IMAGE',
        title: 'תמונת רקע קלאסית'
    },
    {
        id: 'preset-img-2',
        url: '/AVIRA-T-55.jpg',
        type: 'IMAGE',
        title: 'תמונת אווירה יוקרתית'
    },
    {
        id: 'preset-img-3',
        url: '/images/instagram/ig-1-final.png',
        type: 'IMAGE',
        title: 'סידור פרחים מובחר 1'
    },
    {
        id: 'preset-img-4',
        url: '/images/instagram/ig-2.png',
        type: 'IMAGE',
        title: 'סידור פרחים מובחר 2'
    },
    {
        id: 'preset-img-5',
        url: '/images/instagram/ig-4.png',
        type: 'IMAGE',
        title: 'זר פרחים חגיגי'
    }
];
