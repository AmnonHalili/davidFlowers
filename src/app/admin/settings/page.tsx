import { requireAdmin } from '@/lib/admin-auth';
import { getSiteConfig } from '@/app/actions/site-config-actions';
import { getHeroConfig } from '@/app/actions/hero-actions';
import AdminSettingsTabs from '@/components/admin/AdminSettingsTabs';

export const metadata = {
    title: 'הגדרות אתר | פרחי דוד אדמין',
};

export default async function SettingsPage() {
    await requireAdmin();

    const [announcementConfig, heroConfig] = await Promise.all([
        getSiteConfig('announcement_bar'),
        getHeroConfig(),
    ]);

    const initialAnnouncement = announcementConfig || {
        isActive: false,
        text: '',
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-stone-800">הגדרות אתר</h1>
                <p className="text-stone-600 mt-1">ניהול מסך ה-Hero הראשי, הודעות מערכת, מבצעים והגדרות כלליות.</p>
            </div>

            <AdminSettingsTabs
                heroConfig={heroConfig}
                announcementConfig={initialAnnouncement}
            />
        </div>
    );
}
