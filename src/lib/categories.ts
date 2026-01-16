export const CATEGORIES = [
    { slug: 'bouquets', name: 'זרי פרחים' },
    { slug: 'plants', name: 'עציצים' },
    { slug: 'gifts', name: 'מתנות ומתוקים' },
    { slug: 'chocolates', name: 'שוקולדים' },
    { slug: 'wedding', name: 'חתן וכלה' },
    { slug: 'vases', name: 'כלים ואגרטלים' },
];

export const getCategoryName = (slug: string) => {
    return CATEGORIES.find(c => c.slug === slug)?.name || slug;
};
