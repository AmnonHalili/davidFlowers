import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { calculateProductPrice } from '@/lib/price-utils';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        // Note: Removed mandatory auth check for Guest Checkout support

        const body = await req.json();
        const {
            items,
            shippingMethod,
            shippingAddress,
            recipientName,
            recipientPhone,
            ordererName, // New
            ordererPhone,
            ordererEmail, // New
            desiredDeliveryDate,
            deliveryNotes,
            couponId,
            selectedCity,
            shippingCost: clientShippingCost = 0,
            newsletterConsent // Added
        } = body;

        const SHIPPING_COSTS: Record<string, number> = {
            'אשקלון': 25,
            'באר גנים': 45,
            'ניצנים': 45,
            'ניצן': 45,
            'הודיה': 45,
            'ברכיה': 45,
            'ניר ישראל': 45,
            'בית שקמה': 45,
            'בת הדר': 45,
            'כפר סילבר': 45
        };

        // Validation
        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Validate all required contact info
        if (!recipientName || !recipientPhone || !ordererPhone || !ordererName || !ordererEmail) {
            return NextResponse.json({ error: 'Missing required contact details' }, { status: 400 });
        }

        if (shippingMethod === 'delivery' && !shippingAddress) {
            return NextResponse.json({ error: 'Delivery address required' }, { status: 400 });
        }

        // 1. Fetch products to get real prices
        const productIds = items.map((item: any) => item.productId);
        const dbProducts = await prisma.product.findMany({
            where: { id: { in: productIds } }
        });

        // 2. Validate and Calculate Totals
        let calculatedSubtotal = 0;
        let latestAvailableFrom: Date | null = null;

        const validItems = items.map((item: any) => {
            const product = dbProducts.find(p => p.id === item.productId) as any;
            if (!product) throw new Error(`Product not found: ${item.productId}`);

            // Track latest availability date
            if (product.availableFrom) {
                const availDate = new Date(product.availableFrom);
                if (!latestAvailableFrom || availDate > latestAvailableFrom) {
                    latestAvailableFrom = availDate;
                }
            }

            // Calculate effective price (Sale vs Regular)
            const { price: effectivePrice } = calculateProductPrice({
                price: Number(product.price),
                salePrice: product.salePrice ? Number(product.salePrice) : null,
                saleStartDate: product.saleStartDate,
                saleEndDate: product.saleEndDate
            });

            calculatedSubtotal += effectivePrice * item.quantity;

            return {
                ...item,
                price: effectivePrice // Override client price with server price
            };
        });

        // 2.5 VALIDATE DELIVERY DATE against availability & PAST DATES
        if (desiredDeliveryDate) {
            const deliveryDate = new Date(desiredDeliveryDate);

            // Check against Launch Date
            if (latestAvailableFrom) {
                const launchDate = latestAvailableFrom as Date;
                if (deliveryDate < launchDate) {
                    return NextResponse.json({
                        error: `Delivery date must be at or after ${launchDate.toLocaleDateString('he-IL')}`
                    }, { status: 400 });
                }
            }

            // Check against TODAY (Global Past Date check)
            // Use Israel Timezone for "Today" start
            const now = new Date();
            const todayIL = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
            todayIL.setHours(0, 0, 0, 0); // Start of today

            // Normalize delivery date to start of day for fair comparison
            const deliveryCheck = new Date(deliveryDate);
            deliveryCheck.setHours(0, 0, 0, 0);

            if (deliveryCheck < todayIL) {
                return NextResponse.json({
                    error: 'Cannot select a date in the past'
                }, { status: 400 });
            }
        }

        // Calculate total
        const FREE_SHIPPING_THRESHOLD = 350;
        let finalShippingCost = 0;
        if (shippingMethod === 'delivery') {
            if (calculatedSubtotal >= FREE_SHIPPING_THRESHOLD) {
                finalShippingCost = 0;
            } else {
                finalShippingCost = selectedCity ? (SHIPPING_COSTS[selectedCity] || 45) : 45;
            }
        }

        const totalAmount = calculatedSubtotal + finalShippingCost; // Using calculated subtotal

        // 3. CREATE ORDER IN DATABASE (PENDING STATUS)
        const order = await prisma.order.create({
            data: {
                // Connect user only if logged in
                ...(userId && { user: { connect: { clerkId: userId } } }),
                totalAmount,
                status: 'PENDING',
                paymentMethod: 'CREDIT_CARD',
                recipientName,
                shippingAddress: shippingMethod === 'delivery' ? `${shippingAddress}, ${selectedCity}` : 'Self Pickup',
                recipientPhone,
                ordererName,
                ordererPhone,
                ordererEmail,
                desiredDeliveryDate: desiredDeliveryDate ? new Date(desiredDeliveryDate) : null,
                deliveryNotes: shippingMethod === 'delivery' ? deliveryNotes : null,
                ...(couponId && { coupon: { connect: { id: couponId } } }),
                newsletterConsent: newsletterConsent || false, // Added newsletterConsent
                items: {
                    create: validItems.map((item: any) => ({
                        product: { connect: { id: item.productId } },
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        });

        console.log(`✅ Order created: ${order.id}`);

        // 2. UPDATE USER PROFILE (If logged in)
        if (userId) {
            await prisma.user.update({
                where: { clerkId: userId },
                data: {
                    phone: ordererPhone,
                    // Don't override name with recipient name anymore, maybe ordererName?
                    // Let's keep existing logic or maybe update name if empty?
                    // User might be ordering for someone else, so changing their profile name to recipient name is bad specificially in this new flow.
                    // But maybe update address if delivery?
                    ...(shippingMethod === 'delivery' && shippingAddress ? { address: `${shippingAddress}, ${selectedCity}` } : {}),
                }
            }).catch(err => console.error('Error updating user profile:', err));
        }

        // 3. CREATE PAY PLUS PAYMENT
        const paymentUrl = await createPayPlusPayment({
            orderId: order.id,
            amount: Number(totalAmount),
            customerName: ordererName, // Use Orderer Name for billing
            customerPhone: ordererPhone,
            customerEmail: ordererEmail // Use input email
        });

        return NextResponse.json({
            url: paymentUrl,
            orderId: order.id
        });

    } catch (error) {
        console.error('[CHECKOUT_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// Pay Plus Integration with Mock Fallback
async function createPayPlusPayment(data: {
    orderId: string;
    amount: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
}): Promise<string> {
    const { orderId, amount, customerName, customerPhone, customerEmail } = data;

    // Check if Pay Plus is configured
    const payPlusApiKey = process.env.PAYPLUS_API_KEY;
    const payPlusSecretKey = process.env.PAYPLUS_SECRET_KEY;
    const payPlusTerminalId = process.env.PAYPLUS_TERMINAL_ID;

    // MOCK MODE - Development without API keys
    if (!payPlusApiKey || !payPlusSecretKey || !payPlusTerminalId) {
        console.warn('⚠️  Pay Plus not configured - using MOCK mode');
        return `${process.env.NEXT_PUBLIC_APP_URL}/success?orderId=${orderId}&mock=true`;
    }

    // REAL PAY PLUS MODE
    try {
        const payPlusPaymentPageUid = process.env.PAYPLUS_PAYMENT_PAGE_UID;

        console.log(`[PAY_PLUS] Attempting to create payment page for order ${orderId}`);

        // Correct endpoint according to latest documentation
        const response = await fetch('https://restapi.payplus.co.il/api/v1.0/PaymentPages/generateLink', {
            method: 'POST',
            headers: {
                'Authorization': JSON.stringify({
                    'api_key': payPlusApiKey,
                    'secret_key': payPlusSecretKey
                }),
                'api-key': payPlusApiKey, // Fallback separate header
                'secret-key': payPlusSecretKey, // Fallback separate header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                payment_page_uid: payPlusPaymentPageUid,
                terminal_uid: payPlusTerminalId,
                amount: amount,
                currency_code: 'ILS',
                customer: {
                    customer_name: customerName,
                    phone: customerPhone,
                    email: customerEmail || ''
                },
                more_info: orderId,
                refURL_success: `${process.env.NEXT_PUBLIC_APP_URL}/success?orderId=${orderId}`,
                refURL_failure: `${process.env.NEXT_PUBLIC_APP_URL}/cancel?orderId=${orderId}`,
                sendEmailApproval: false,
                sendEmailFailure: false,
                charge_method: 1 // Regular Charge
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error(`[PAY_PLUS_ERROR] Status: ${response.status}`, result);
            throw new Error(`Pay Plus API error: ${result.message || result.status_text || response.status}`);
        }

        if (result.status === 'error' || !result.data?.payment_page_link) {
            console.error('[PAY_PLUS_ERROR] API returned error state:', result);
            throw new Error(result.message || 'No payment link returned from Pay Plus');
        }

        console.log(`✅ Pay Plus payment page created for order ${orderId}`);
        return result.data.payment_page_link;

    } catch (error: any) {
        console.error('[PAY_PLUS_ERROR] Process failed:', error);
        // Throw the error instead of falling back to mock success in production
        throw new Error(`PayPlus failed: ${error.message}`);
    }
}
