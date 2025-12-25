"use client";
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { cart, removeFromCart, total, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [guestEmail, setGuestEmail] = useState('');
    const router = useRouter();

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    total,
                    guestEmail: guestEmail || undefined
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Order placed successfully! Check your email.');
                clearCart();
                router.push('/');
            } else {
                alert('Order failed: ' + data.error);
            }
        } catch (err) {
            alert('Checkout error');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-serif font-bold mb-4">Your Cart is Empty</h1>
                <Link href="/shop" className="text-secondary hover:underline">Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-serif font-bold mb-12">Your Shopping Cart</h1>

            <div className="grid md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-6">
                    {cart.map((item) => (
                        <div key={item._id} className="flex gap-6 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm items-center">
                            <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex-shrink-0 overflow-hidden">
                                {/* Image would go here */}
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between mb-2">
                                    <h3 className="text-xl font-bold">{item.name}</h3>
                                    <span className="font-mono">${item.price * item.quantity}</span>
                                </div>
                                <p className="text-sm opacity-60 mb-2">Qty: {item.quantity}</p>
                                <button onClick={() => removeFromCart(item._id)} className="text-red-500 text-sm hover:underline">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg h-fit">
                    <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                    <div className="flex justify-between mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                        <span>Subtotal</span>
                        <span>${total}</span>
                    </div>
                    <div className="flex justify-between mb-8 text-xl font-bold">
                        <span>Total</span>
                        <span>${total}</span>
                    </div>

                    <form onSubmit={handleCheckout} className="space-y-4">
                        <div>
                            <label className="block text-sm mb-2">Contact Email (for confirmation)</label>
                            <input
                                type="email"
                                required
                                className="w-full p-3 rounded border dark:bg-zinc-800 dark:border-zinc-700"
                                placeholder="you@example.com"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition-all shadow-lg"
                        >
                            {loading ? 'Processing...' : 'Checkout Now'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
