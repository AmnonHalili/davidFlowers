import { getSiteConfig } from '@/app/actions/site-config-actions';
import AnnouncementSettingsForm from '@/components/admin/AnnouncementSettingsForm';

export default async function SettingsPage() {
    const config = await getSiteConfig('announcement_bar');

    const initialConfig = config || {
        isActive: false,
        text: ''
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-stone-800">הגדרות אתר</h1>
            <p className="text-stone-600">ניהול הודעות מערכת, מבצעים והגדרות כלליות.</p>

            <div className="border-t border-stone-200 pt-6">
                <AnnouncementSettingsForm initialConfig={initialConfig} />
            </div>
        </div>
    );
}
