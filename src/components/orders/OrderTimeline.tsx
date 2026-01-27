'use client';

import { CheckCircle2, Package, Truck, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderTimelineProps {
    status: string;
}

export default function OrderTimeline({ status }: OrderTimelineProps) {
    const steps = [
        { id: 'PENDING', label: 'נקלטה', icon: CheckCircle2 },
        { id: 'PAID', label: 'בטיפול', icon: Package },
        { id: 'SHIPPED', label: 'במשלוח', icon: Truck },
        { id: 'DELIVERED', label: 'נמסר', icon: Home },
    ];

    // Status Mapping and Current Step Index
    const statusMap: Record<string, number> = {
        'PENDING': 0,
        'PAID': 1,
        'SHIPPED': 2,
        'DELIVERED': 3,
        'CANCELLED': -1 // Special case
    };

    const currentStepIndex = statusMap[status] ?? 0;
    const isCancelled = status === 'CANCELLED';

    if (isCancelled) {
        return (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg text-center border border-red-100">
                <p className="font-bold text-lg">הזמנה זו בוטלה</p>
                <p className="text-sm opacity-80">לפרטים נוספים אנא צרו עמנו קשר.</p>
            </div>
        );
    }

    return (
        <div className="relative w-full py-8" dir="rtl">
            {/* Progress Bar Background */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-200 -translate-y-1/2 z-0 hidden md:block" />

            {/* Progress Bar Active (Animated) */}
            <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-1/2 right-0 h-1 bg-david-green -translate-y-1/2 z-0 hidden md:block origin-right"
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-2 w-full md:w-auto relative">
                            {/* Mobile Vertical Line */}
                            {index < steps.length - 1 && (
                                <div className={`absolute top-10 right-5 bottom-[-24px] w-0.5 md:hidden ${index < currentStepIndex ? 'bg-david-green' : 'bg-stone-200'}`} />
                            )}

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.2 }}
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500
                                    ${isCompleted ? 'bg-david-green border-david-green text-white shadow-md' : 'bg-white border-stone-200 text-stone-300'}
                                    ${isCurrent ? 'ring-4 ring-david-green/20' : ''}
                                `}
                            >
                                <Icon className="w-5 h-5" strokeWidth={isCompleted ? 2 : 1.5} />
                            </motion.div>

                            <div className="md:text-center">
                                <span className={`block text-sm font-bold ${isCompleted ? 'text-stone-900' : 'text-stone-400'}`}>
                                    {step.label}
                                </span>
                                {isCurrent && (
                                    <span className="text-[10px] text-david-green font-medium animate-pulse hidden md:block">
                                        סטטוס נוכחי
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
