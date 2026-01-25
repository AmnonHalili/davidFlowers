import * as React from 'react';
import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Hr,
    Heading,
} from '@react-email/components';

interface OrderConfirmationEmailProps {
    orderNumber: string;
    customerName: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    shippingAddress: string;
    deliveryDate?: string;
    deliveryNotes?: string;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
    orderNumber,
    customerName,
    items,
    totalAmount,
    shippingAddress,
    deliveryDate,
    deliveryNotes,
}) => (
    <Html dir="rtl" lang="he">
        <Head>
            <meta charSet="utf-8" />
        </Head>
        <Body style={main}>
            <Container style={container}>
                {/* Header */}
                <Section style={header}>
                    <Heading style={headerTitle}>דוד פרחים</Heading>
                    <Text style={headerSubtitle}>תודה על הזמנתך!</Text>
                </Section>

                {/* Content */}
                <Section style={content}>
                    <Text style={greeting}>שלום {customerName},</Text>
                    <Text style={paragraph}>
                        הזמנתך התקבלה בהצלחה ואושרה לתשלום. אנחנו מתחילים להכין אותה במיוחד בשבילך! 🌸
                    </Text>

                    {/* Order Number */}
                    <Section style={orderNumberBox}>
                        <Text style={orderNumberLabel}>מספר הזמנה:</Text>
                        <Text style={orderNumberValue}>{orderNumber}</Text>
                    </Section>

                    {/* Order Items */}
                    <Heading style={sectionTitle}>פרטי ההזמנה</Heading>
                    {items.map((item, index) => (
                        <Section key={index} style={itemRow}>
                            <Text style={itemName}>
                                {item.quantity} × {item.name}
                            </Text>
                            <Text style={itemPrice}>₪{(item.price * item.quantity).toFixed(2)}</Text>
                        </Section>
                    ))}
                    <Hr style={divider} />
                    <Section style={totalRow}>
                        <Text style={totalLabel}>סה"כ לתשלום:</Text>
                        <Text style={totalAmount}>₪{totalAmount.toFixed(2)}</Text>
                    </Section>

                    {/* Delivery Info */}
                    <Heading style={sectionTitle}>פרטי משלוח</Heading>
                    <Text style={paragraph}>
                        <strong>כתובת:</strong> {shippingAddress}
                    </Text>
                    {deliveryDate && (
                        <Text style={paragraph}>
                            <strong>מועד משלוח משוער:</strong> {deliveryDate}
                        </Text>
                    )}
                    {deliveryNotes && (
                        <Section style={notesBox}>
                            <Text style={notesLabel}>הערות למשלוח:</Text>
                            <Text style={notesText}>{deliveryNotes}</Text>
                        </Section>
                    )}

                    {/* Contact Info */}
                    <Section style={contactBox}>
                        <Heading style={contactTitle}>צריך עזרה?</Heading>
                        <Text style={contactText}>📞 053-587-9344</Text>
                        <Text style={contactText}>📍 רחבעם זאבי 4, אשקלון</Text>
                    </Section>
                </Section>

                {/* Footer */}
                <Section style={footer}>
                    <Text style={footerText}>© 2025 דוד פרחים - כל הזכויות שמורות</Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

// Styles
const main = {
    backgroundColor: '#f5f1e8',
    fontFamily: 'Arial, sans-serif',
    direction: 'rtl' as const,
};

const container = {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
};

const header = {
    backgroundColor: '#2d5016',
    padding: '40px 20px',
    textAlign: 'center' as const,
};

const headerTitle = {
    color: '#f5f1e8',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0',
    fontFamily: 'serif',
};

const headerSubtitle = {
    color: '#f5f1e8',
    fontSize: '16px',
    margin: '10px 0 0 0',
};

const content = {
    padding: '30px',
};

const greeting = {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    textAlign: 'right' as const,
};

const paragraph = {
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 15px 0',
    textAlign: 'right' as const,
};

const orderNumberBox = {
    backgroundColor: '#f5f1e8',
    padding: '15px',
    borderRadius: '8px',
    margin: '20px 0',
    textAlign: 'right' as const,
};

const orderNumberLabel = {
    fontSize: '14px',
    margin: '0',
    color: '#666',
};

const orderNumberValue = {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '5px 0 0 0',
    color: '#2d5016',
};

const sectionTitle = {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '25px 0 15px 0',
    textAlign: 'right' as const,
};

const itemRow = {
    padding: '10px 0',
    borderBottom: '1px solid #eee',
} as React.CSSProperties;

const itemName = {
    fontSize: '14px',
    margin: '0',
    textAlign: 'right' as const,
};

const itemPrice = {
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0',
    textAlign: 'left' as const,
};

const divider = {
    borderColor: '#2d5016',
    borderWidth: '2px',
    margin: '10px 0',
};

const totalRow = {
    padding: '15px 0',
} as React.CSSProperties;

const totalLabel = {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0',
    textAlign: 'right' as const,
};

const totalAmount = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2d5016',
    margin: '0',
    textAlign: 'left' as const,
};

const notesBox = {
    backgroundColor: '#fff3cd',
    padding: '15px',
    borderRadius: '8px',
    margin: '15px 0',
    border: '1px solid #ffc107',
};

const notesLabel = {
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    textAlign: 'right' as const,
};

const notesText = {
    fontSize: '14px',
    margin: '0',
    textAlign: 'right' as const,
};

const contactBox = {
    backgroundColor: '#e8f5e9',
    padding: '20px',
    borderRadius: '8px',
    margin: '25px 0',
    textAlign: 'center' as const,
};

const contactTitle = {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
};

const contactText = {
    fontSize: '14px',
    margin: '5px 0',
};

const footer = {
    backgroundColor: '#f5f1e8',
    padding: '20px',
    textAlign: 'center' as const,
};

const footerText = {
    fontSize: '12px',
    color: '#666',
    margin: '0',
};

export default OrderConfirmationEmail;
