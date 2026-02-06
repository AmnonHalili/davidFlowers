type GTMEvent = {
    event: string;
    [key: string]: any;
};

export const sendGTMEvent = (data: GTMEvent) => {
    if (typeof window === "undefined") {
        return;
    }

    if (!window.dataLayer) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('GTM dataLayer not found. Event dropped:', data);
        }
        return;
    }

    window.dataLayer.push(data);
};

// Type declaration for the window object to include dataLayer
declare global {
    interface Window {
        dataLayer: any[];
    }
}
