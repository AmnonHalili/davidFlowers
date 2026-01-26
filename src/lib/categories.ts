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

export const getCategoryName = (slug: string) => {
    return CATEGORIES.find(c => c.slug === slug)?.name || slug;
};
