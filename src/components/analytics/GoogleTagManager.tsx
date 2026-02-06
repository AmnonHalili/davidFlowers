"use client";

import Script from "next/script";

interface GoogleTagManagerProps {
    gtmId: string;
}

export default function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
    // Guard Clauses:
    // 1. If no ID is provided, don't render anything.
    // 2. If analytics is NOT enabled, don't render anything (unless you want to allow it in dev for testing explicitly).
    const isAnalyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

    if (!gtmId || !isAnalyticsEnabled) {
        if (process.env.NODE_ENV === 'development' && !isAnalyticsEnabled) {
            console.debug('Analytics disabled in development. Set NEXT_PUBLIC_ENABLE_ANALYTICS=true to enable.');
        }
        return null;
    }

    return (
        <>
            <noscript>
                <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                    height="0"
                    width="0"
                    style={{ display: "none", visibility: "hidden" }}
                />
            </noscript>
            <Script
                id="gtm-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
                }}
            />
        </>
    );
}
