import { requireAdmin } from '@/lib/admin-auth';
import { getHeroConfig } from '@/app/actions/hero-actions';
import HeroSettingsManager from '@/components/admin/HeroSettingsManager';

export const metadata = {
    title: 'ניהול מדיה Hero | פרחי דוד אדמין',
};

export default async function AdminHeroPage() {
    await requireAdmin();
    const heroConfig = await getHeroConfig();

    return (
        <div className="max-w-6xl mx-auto py-4">
            <HeroSettingsManager initialConfig={heroConfig} />
        </div>
    );
}
