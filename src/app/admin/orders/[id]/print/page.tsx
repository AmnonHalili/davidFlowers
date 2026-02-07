import { getOrder } from "@/app/actions/order-actions";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { notFound } from "next/navigation";
import Image from "next/image";
import PrintButton from "./PrintButton";

export default async function OrderPrintPage({ params }: { params: { id: string } }) {
    const order = await getOrder(params.id);

    if (!order) {
        notFound();
    }

    return (
        <div className="bg-white min-h-screen text-black p-8 md:p-12 print:p-0">
            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 0.5cm; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>

            <div className="max-w-3xl mx-auto border border-stone-200 print:border-none p-8 print:p-0 shadow-lg print:shadow-none bg-white">

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-stone-900 pb-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">David Flowers</h1>
                        <p className="text-sm text-stone-600">משלוחי פרחים ועיצוב אירועים</p>
                        <p className="text-sm text-stone-600 font-mono mt-1 dir-ltr text-right">050-1234567 | www.davidflowers.co.il</p>
                    </div>
                    <div className="text-left">
                        <div className="text-sm text-stone-500 uppercase tracking-widest mb-1">תעודת משלוח</div>
                        <div className="text-2xl font-mono font-bold">#{order.id.slice(-8)}</div>
                        <div className="text-sm text-stone-500 mt-1">
                            {format(new Date(order.createdAt), "dd/MM/yyyy", { locale: he })}
                        </div>
                    </div>
                </div>

                {/* Delivery Info - High Priority */}
                <div className="bg-stone-50 border-2 border-stone-900 p-6 mb-8 print:bg-transparent print:border-2">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-4 border-b border-stone-300 pb-2">לכבוד</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="text-xs text-stone-500 mb-1">מקבל/ת המשלוח</div>
                            <div className="text-2xl font-bold text-stone-900 mb-2">{order.recipientName}</div>
                            <div className="text-lg text-stone-800 leading-relaxed mb-4">{order.shippingAddress}</div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold bg-stone-900 text-white px-2 py-0.5 rounded">TEL</span>
                                <span className="text-xl font-mono font-bold tracking-wider dir-ltr">{order.recipientPhone}</span>
                            </div>
                        </div>

                        {order.deliveryNotes && (
                            <div className="bg-white p-4 border border-stone-300 relative print:border-stone-900">
                                <div className="text-xs font-bold text-amber-600 uppercase mb-2 print:text-stone-900">הערות לשליח:</div>
                                <div className="text-lg font-medium text-stone-900">{order.deliveryNotes}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Greeting Card Section - To be cut out or focused on */}
                {order.cardMessage && (
                    <div className="mb-8 relative border-2 border-dashed border-stone-300 p-8 text-center rounded-xl bg-gradient-to-br from-stone-50 to-white print:bg-none print:border-stone-400">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-stone-400 text-xs tracking-widest uppercase">
                            כרטיס ברכה
                        </div>
                        <p className="font-serif text-2xl md:text-3xl italic text-stone-800 leading-relaxed px-8">
                            "{order.cardMessage}"
                        </p>
                    </div>
                )}

                {/* Order Contents (Packer View) */}
                <div className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-4 border-b border-stone-200 pb-2">פירוט הזמנה</h2>
                    <table className="w-full text-right">
                        <thead>
                            <tr className="text-xs text-stone-500 border-b border-stone-100">
                                <th className="pb-2 font-medium">פריט</th>
                                <th className="pb-2 font-medium w-32">גודל/סוג</th>
                                <th className="pb-2 font-medium w-16 text-center">כמות</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {order.items.map((item) => (
                                <tr key={item.id} className="text-sm">
                                    <td className="py-3 font-bold text-stone-900">{item.product.name}</td>
                                    <td className="py-3 text-stone-600">{item.selectedSize || "-"}</td>
                                    <td className="py-3 text-center font-mono">{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sender Info (Small Footer) */}
                <div className="border-t border-stone-200 pt-6 flex justify-between items-end text-sm text-stone-500">
                    <div>
                        <div className="mb-1">הוזמן על ידי: <span className="font-medium text-stone-900">{order.user?.name || order.ordererName}</span></div>
                        <div>טלפון מזמין: <span className="font-mono dir-ltr">{order.ordererPhone || order.user?.phone || "-"}</span></div>
                    </div>
                    <div className="text-xs">
                        {format(new Date(), "dd/MM/yyyy HH:mm", { locale: he })}
                    </div>
                </div>

            </div>

            {/* Helper for screen view */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 print:hidden z-50">
                <PrintButton />
            </div>
        </div>
    );
}

// Set layout to empty to avoid header/footer
// We might need a separate layout file or route group if the main layout adds headers.
// For now assuming we might need to override layout.
