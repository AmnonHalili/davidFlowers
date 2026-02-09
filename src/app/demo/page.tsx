import ProductSubscriptionForm from '@/components/ProductSubscriptionForm';

export default function DemoPage() {
    return (
        <main className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4">
            <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white p-12 rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100">
                <div className="space-y-6">
                    <div className="aspect-[4/5] bg-stone-100 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-stone-200 animate-pulse" />
                        <img
                            src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=2000&auto=format&fit=crop"
                            alt="Luxury Bouquet"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>
                    <div className="flex gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-20 h-24 bg-stone-100 border border-stone-100" />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col justify-center">
                    <div className="mb-8">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block">Autumn Collection 24</span>
                        <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-stone-900 mb-4 font-serif">THE NOBLE PEONY</h1>
                        <p className="text-stone-500 font-light leading-relaxed max-w-md">
                            A curated selection of the season's finest peonies, hand-tied with signature silk ribbons. Designed for the minimalist home.
                        </p>
                    </div>

                    <ProductSubscriptionForm product={{
                        id: 'demo-1',
                        name: 'The Noble Peony',
                        price: 350,
                        image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9',
                        stock: 99,
                        allowPreorder: true
                    }} />
                </div>
            </div>
        </main>
    );
}
