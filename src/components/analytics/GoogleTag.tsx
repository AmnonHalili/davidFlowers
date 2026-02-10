"use client";

import Script from "next/script";

interface GoogleTagProps {
    tagId: string;
}

export default function GoogleTag({ tagId }: GoogleTagProps) {
    const isAnalyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

    if (!tagId || !isAnalyticsEnabled) {
        return null;
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`}
                strategy="afterInteractive"
            />
            <Script
                id="google-tag-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${tagId}');
                    `,
                }}
            />
        </>
    );
}
