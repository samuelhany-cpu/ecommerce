"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initial check and load
    useEffect(() => {
        const initCart = async () => {
            // Check auth
            try {
                const authRes = await fetch('/api/auth/verify');
                const authData = await authRes.json();
                const authenticated = authData.authenticated || false;
                setIsAuthenticated(authenticated);

                if (authenticated) {
                    // Fetch server cart
                    const cartRes = await fetch('/api/cart');
                    const cartData = await cartRes.json();

                    if (cartData.success && cartData.data.length > 0) {
                        // Merge or overwrite? For now, let's favor server
                        // We need full product details, so we might need a sync logic
                        // But wait, our API only returns basic data. 
                        // The frontend usually has the product details from the shop pages.
                        // Ideally the Cart API should join with Products or the client should refetch.
                        // Let's assume the cart state needs full objects.
                    }
                }
            } catch (err) {
                console.error('Cart init error:', err);
            }

            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        };
        initCart();
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = async (product) => {
        const item = { ...product, quantity: 1 };
        setCart((prev) => {
            const existing = prev.find((i) => i._id === product._id);
            if (existing) {
                return prev.map((i) =>
                    i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, item];
        });

        if (isAuthenticated) {
            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product._id, action: 'add' })
            });
        }
        setIsCartOpen(true);
    };

    const removeFromCart = async (productId) => {
        setCart((prev) => prev.filter((item) => item._id !== productId));
        if (isAuthenticated) {
            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, action: 'remove' })
            });
        }
    };

    const updateQuantity = async (productId, delta) => {
        let newQty = 1;
        setCart((prev) => prev.map((item) => {
            if (item._id === productId) {
                newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));

        if (isAuthenticated) {
            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: newQty, action: 'set' })
            });
        }
    };

    const clearCart = async () => {
        setCart([]);
        if (isAuthenticated) {
            await fetch('/api/cart', { method: 'DELETE' });
        }
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            total,
            isCartOpen,
            setIsCartOpen,
            isAuthenticated
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
