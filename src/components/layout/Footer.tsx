export default function Footer() {
    return (
        <footer className="bg-stone-900 text-white/80 pt-20 pb-10">
            <div className="max-w-screen-2xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-16 text-right">

                    {/* Brand Column (Rightmost in RTL source order if grid, checking visual alignment) */}
                    <div className="space-y-6">
                        <h3 className="font-serif text-2xl tracking-widest text-white">דוד פרחים</h3>
                        <p className="text-sm font-light leading-relaxed max-w-xs text-stone-400">
                            פרחים טריים בסטייל מודרני.
                            מגיעים ישירות מהמגדלים המובילים בארץ, ארוזים בקפידה ונשלחים באהבה.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-white">חנות</h4>
                        <ul className="space-y-4 text-sm font-light">
                            <li><a href="#" className="hover:text-white transition-colors">כל הזרים</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">מנויים</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">כרטיסי מתנה</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">לקוחות עסקיים</a></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-white">החברה</h4>
                        <ul className="space-y-4 text-sm font-light">
                            <li><a href="#" className="hover:text-white transition-colors">קצת עלינו</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">המגזין</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">קיימות</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">קריירה</a></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-white">ניוזלטר</h4>
                        <div className="flex border-b border-white/20 pb-2 flex-row-reverse">
                            <button className="text-xs uppercase tracking-widest hover:text-white mr-4">הרשמה</button>
                            <input
                                type="email"
                                placeholder="הכנס אימייל"
                                className="bg-transparent w-full outline-none text-sm placeholder:text-stone-500 text-right"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-wider text-stone-500">
                    <p>© 2026 דוד פרחים. כל הזכויות שמורות.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">מדיניות פרטיות</a>
                        <a href="#" className="hover:text-white transition-colors">תנאי שימוש</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
