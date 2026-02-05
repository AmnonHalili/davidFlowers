import prisma from '@/lib/prisma';
import BlogCard from '@/components/blog/BlogCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'בלוג ועולם התוכן | פרחי דוד - משלוחי פרחים באשקלון',
    description: 'מדריכים, טיפים וכתבות על עולם הפרחים, העציצים והמתנות. למדו איך לשמור על הזר שלכם ואיך לבחור את המתנה המושלמת באשקלון.',
    keywords: 'בלוג פרחים, טיפים לפרחים, פרחים באשקלון, מדריך עציצים, מתנות באשקלון',
};

export default async function BlogPage() {
    const posts = await (prisma as any).blogPost.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' }
    });

    return (
        <main className="min-h-screen pt-32 pb-20 bg-white" dir="rtl">
            <div className="max-w-screen-xl mx-auto px-6">

                {/* Header */}
                <div className="text-center space-y-4 mb-20">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400">עולם התוכן שלנו</span>
                    <h1 className="font-serif text-5xl md:text-6xl text-stone-900">הבלוג של פרחי דוד</h1>
                    <p className="font-light text-stone-500 max-w-2xl mx-auto text-lg leading-relaxed">
                        גלו עולם של השראה, טיפים מקצועיים וסיפורים מאחורי הקלעים של חנות הפרחים האיכותית ביותר באשקלון.
                    </p>
                </div>

                {/* Grid */}
                {posts.length === 0 ? (
                    <div className="bg-stone-50 border border-stone-100 rounded-sm p-20 text-center">
                        <p className="text-stone-400 font-light italic">
                            המאמרים הראשונים שלנו בדרך... הישארו מעודכנים!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                        {posts.map((post: any) => (
                            <BlogCard
                                key={post.id}
                                title={post.title}
                                slug={post.slug}
                                excerpt={post.excerpt}
                                image={post.image}
                                publishedAt={post.publishedAt}
                            />
                        ))}
                    </div>
                )}

                {/* SEO Content Section */}
                <div className="mt-32 pt-20 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="font-serif text-3xl text-stone-900">למה כדאי לקרוא את הבלוג שלנו?</h2>
                        <div className="space-y-4 text-stone-600 font-light leading-relaxed">
                            <p>
                                אנחנו בפרחי דוד מאמינים שפרחים הם לא רק מוצר, אלא חוויה רגשית. בבלוג שלנו אנחנו משתפים את הידע המקצועי שצברנו לאורך השנים כחנות המובילה למשלוחי <strong>פרחים באשקלון</strong>.
                            </p>
                            <p>
                                תוכלו למצוא כאן מדריכים מפורטים על טיפול ב<strong>עציצים באשקלון</strong>, רעיונות לבחירת <strong>מתנות באשקלון</strong> לאירועים מיוחדים, וטיפים לשזירה נכונה שתנצח כל תחרות.
                            </p>
                        </div>
                    </div>
                    <div className="bg-david-green/5 p-12 rounded-sm space-y-4 text-center">
                        <p className="font-serif text-xl text-david-green italic">"פרחים הם מוזיקה של האדמה, שנשמעת ללא קול."</p>
                        <p className="text-[10px] uppercase tracking-widest text-stone-400">— אנונימי</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
