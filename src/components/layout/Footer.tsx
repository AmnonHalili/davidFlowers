export default function Footer() {
    return (
        <footer className="bg-david-green text-david-beige pt-20 pb-10 rtl" dir="rtl">
            <div className="max-w-screen-2xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-david-beige/20 pb-16">

                    {/* Right: Brand Info */}
                    <div className="space-y-6 text-right">
                        <div className="relative w-[180px] h-[60px] md:w-[220px] md:h-[80px]">
                            <h3 className="font-serif text-3xl tracking-widest leading-none">דוד פרחים</h3>
                        </div>
                        <div className="space-y-4 text-sm font-light text-david-beige/80">
                            <p>פרחים טריים, עיצובים ייחודיים ומתנות מרגשות באשקלון והסביבה.</p>
                            <div className="flex flex-col gap-1">
                                <a
                                    href="https://waze.com/ul?ll=31.66926,34.57149&navigate=yes"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors flex items-center gap-2"
                                >
                                    <MapPin className="w-4 h-4" />
                                    <span>רחבעם זאבי 4, אשקלון</span>
                                </a>
                                <a href="tel:0535879344" className="hover:text-white transition-colors flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <span>053-587-9344</span>
                                </a>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center text-david-beige/80 pt-2">
                            {/* Social Icons using Lucide React */}
                            <a href="https://www.instagram.com/davidflower__?igsh=NXNudHU1emMwcWVl" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
                                <InstagramIcon className="w-5 h-5" />
                            </a>
                            <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
                                <FacebookIcon className="w-5 h-5" />
                            </a>

                        </div>
                    </div>

                    {/* Middle: Quick Links */}
                    <div className="flex flex-col md:flex-row gap-12 md:gap-24 justify-center md:justify-start">
                        <div className="space-y-6">
                            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-david-beige/60">ניווט מהיר</h4>
                            <ul className="space-y-4 text-sm font-light">
                                <li><a href="/" className="hover:text-white transition-colors block">דף הבית</a></li>
                                <li><a href="/shop" className="hover:text-white transition-colors block">קטלוג מוצרים</a></li>
                                <li><a href="/about" className="hover:text-white transition-colors block">אודות</a></li>
                                <li><a href="/deliveries" className="hover:text-white transition-colors block">משלוחים</a></li>
                                <li><a href="/contact" className="hover:text-white transition-colors block">יצירת קשר</a></li>
                                <li><a href="/accessibility" className="hover:text-white transition-colors block">הצהרת נגישות</a></li>
                                <li><a href="/regulations-website" className="hover:text-white transition-colors block">תקנון האתר ומשלוחים</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Left: Newsletter */}
                    <div className="space-y-6">
                        <h4 className="text-xl font-serif text-david-beige">הישארו מעודכנים</h4>
                        <p className="text-sm text-david-beige/80 font-light">
                            קבלו עדכונים על מבצעים וזרים חדשים.
                        </p>
                        <form className="flex flex-col gap-4 max-w-sm">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="המייל שלך..."
                                    className="w-full bg-transparent border-b border-david-beige/30 py-2 text-david-beige placeholder:text-david-beige/40 outline-none focus:border-david-beige transition-colors text-right"
                                />
                            </div>
                            <button className="self-end text-sm uppercase tracking-widest font-bold hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">
                                הרשמה
                            </button>
                        </form>
                    </div>

                    {/* Middle: Store Hours */}
                    <div className="space-y-6">
                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-david-beige/60 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            שעות פתיחה
                        </h4>
                        <ul className="space-y-3 text-sm font-light">
                            <li className="flex justify-between">
                                <span>ראשון</span>
                                <span className="text-david-beige/80">10:00 - 19:30</span>
                            </li>
                            <li className="flex justify-between">
                                <span>שני - חמישי</span>
                                <span className="text-david-beige/80">09:00 - 19:30</span>
                            </li>
                            <li className="flex justify-between">
                                <span>שישי</span>
                                <span className="text-david-beige/80">08:00 - 14:30</span>
                            </li>
                            <li className="flex justify-between text-david-beige/60">
                                <span>שבת</span>
                                <span>סגור</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 flex flex-col md:flex-row justify-center items-center gap-6 text-[10px] uppercase tracking-wider text-david-beige/60">
                    <p>כל הזכויות שמורות © 2025 David Flowers</p>
                </div>
            </div>
        </footer>
    );
}

// Simple Icon wrappers to avoid importing everything if not needed, 
// strictly standard Lucide icons: Instagram, Facebook, Phone (for WhatsApp usually used or MessageCircle)
// I will import them from lucide-react at top
import { Instagram, Facebook, Phone, MapPin, Clock } from 'lucide-react';

function InstagramIcon(props: any) { return <Instagram {...props} strokeWidth={1.5} />; }
function FacebookIcon(props: any) { return <Facebook {...props} strokeWidth={1.5} />; }
function PhoneIcon(props: any) { return <Phone {...props} strokeWidth={1.5} />; }
