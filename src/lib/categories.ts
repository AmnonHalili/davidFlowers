export const CATEGORIES = [
    { slug: 'bouquets', name: 'זרי פרחים' },
    { slug: 'plants', name: 'עציצים' },
    { slug: 'gifts', name: 'מתנות ומתוקים' },
    { slug: 'chocolates', name: 'שוקולדים' },
    { slug: 'balloons', name: 'בלונים' },
    { slug: 'wedding', name: 'חתן וכלה' },
    { slug: 'vases', name: 'כלים ואגרטלים' },
    { slug: 'add-ons', name: 'תוספות (Upsells)' },
];

export const CATEGORY_ORDER = [
    'bouquets',   // זרי פרחים
    'plants',     // עציצים
    'wedding',    // חתן וכלה
    'gifts',      // מתנות ומתוקים
    'chocolates', // שוקולדים
    'balloons',   // בלונים
    'vases',      // כלים ואגרטלים
];

export const getCategoryName = (slug: string) => {
    return CATEGORIES.find(c => c.slug === slug)?.name || slug;
};
