'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of a Cart Item
export type CartItem = {
    id: string; // Unique ID for this specific line item (to distinguishing variations)
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    type: 'ONETIME' | 'SUBSCRIPTION';
    // Subscription specifics
    frequency?: 'WEEKLY' | 'BIWEEKLY';
    deliveryDay?: string;
};

type CartContextType = {
    items: CartItem[];
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    cartTotal: number;
    itemsCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('davidFlowersCart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('davidFlowersCart', JSON.stringify(items));
    }, [items]);

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    const addItem = (newItem: CartItem) => {
        setItems((currentItems) => {
            // Check if item already exists (logic can be complex with variants, simplified here)
            const existing = currentItems.find(
                (i) => i.productId === newItem.productId && i.type === newItem.type && i.frequency === newItem.frequency
            );

            if (existing) {
                return currentItems.map((i) =>
                    i.id === existing.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
                );
            }
            return [...currentItems, newItem];
        });
        openCart(); // Auto open cart on add
    };

    const removeItem = (id: string) => {
        setItems((current) => current.filter((i) => i.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        setItems((currentItems) => {
            if (quantity <= 0) {
                return currentItems.filter((i) => i.id !== id);
            }
            return currentItems.map((i) =>
                i.id === id ? { ...i, quantity } : i
            );
        });
    };

    const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const itemsCount = items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                isOpen,
                openCart,
                closeCart,
                addItem,
                removeItem,
                updateQuantity,
                cartTotal,
                itemsCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
