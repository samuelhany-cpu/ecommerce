"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');
    const router = useRouter();

    useEffect(() => {
        checkAuthAndLoadData();
    }, []);

    const checkAuthAndLoadData = async () => {
        try {
            // Check authentication
            const authRes = await fetch('/api/auth/verify');
            const authData = await authRes.json();

            if (!authData.authenticated) {
                router.push('/login');
                return;
            }

            setUser(authData.user);

            // Load user's orders
            const ordersRes = await fetch('/api/orders/my-orders');
            const ordersData = await ordersRes.json();
            if (ordersData.success) {
                setOrders(ordersData.data || []);
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-charcoal">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-cream dark:bg-charcoal min-h-screen py-12 px-6">
            <div className="container mx-auto max-w-6xl">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-primary dark:text-cream mb-2">
                            My Account
                        </h1>
                        <p className="text-sm opacity-60">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
                    >
                        Logout
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8 border-b border-primary/10 dark:border-zinc-700">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 font-bold transition-all ${activeTab === 'orders'
                            ? 'border-b-2 border-secondary text-secondary'
                            : 'text-primary/40 dark:text-cream/40 hover:text-primary dark:hover:text-cream'
                            }`}
                    >
                        My Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-3 font-bold transition-all ${activeTab === 'settings'
                            ? 'border-b-2 border-secondary text-secondary'
                            : 'text-primary/40 dark:text-cream/40 hover:text-primary dark:hover:text-cream'
                            }`}
                    >
                        Account Settings
                    </button>
                </div>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-serif font-bold text-primary dark:text-cream mb-6">
                            Order History
                        </h2>
                        {orders.length > 0 ? (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-primary/5 dark:border-zinc-800"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-primary dark:text-cream">
                                                    Order #{order.id}
                                                </h3>
                                                <p className="text-sm opacity-60 mt-1">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono font-bold text-secondary text-lg">
                                                    ${order.totalAmount}
                                                </p>
                                                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                                        order.status === 'delivering' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                                            order.status === 'approved' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                                                'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                            <div className="pt-4 border-t border-primary/5 dark:border-zinc-800">
                                                <p className="text-sm opacity-60">
                                                    {Array.isArray(order.items) ? order.items.length : (typeof order.items === 'string' ? (() => {
                                                        try { return JSON.parse(order.items).length; } catch (e) { return 0; }
                                                    })() : (order.orderItems ? order.orderItems.length : 0))} item(s)
                                                </p>
                                            </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-primary/5 dark:border-zinc-800">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-bold text-primary dark:text-cream mb-2">
                                    No Orders Yet
                                </h3>
                                <p className="text-sm opacity-60 mb-6">
                                    Start shopping to see your orders here
                                </p>
                                <Link
                                    href="/shop"
                                    className="inline-block px-8 py-3 bg-primary text-cream rounded-xl font-bold hover:bg-primary-light transition-all"
                                >
                                    Browse Products
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-serif font-bold text-primary dark:text-cream mb-6">
                            Account Settings
                        </h2>
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-primary/5 dark:border-zinc-800">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-primary dark:text-cream">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full px-4 py-3 rounded-xl border border-primary/10 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-primary dark:text-cream opacity-60"
                                    />
                                    <p className="text-xs opacity-60 mt-2">
                                        Email cannot be changed. Contact support if needed.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2 text-primary dark:text-cream">
                                        Account Type
                                    </label>
                                    <div className="px-4 py-3 rounded-xl border border-primary/10 dark:border-zinc-700 bg-cream dark:bg-zinc-800">
                                        <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold uppercase">
                                            {user?.role === 'user' ? 'Customer' : user?.role || 'Customer'}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-primary/5 dark:border-zinc-800">
                                    <h3 className="font-bold text-primary dark:text-cream mb-4">
                                        Danger Zone
                                    </h3>
                                    <button
                                        onClick={handleLogout}
                                        className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
                                    >
                                        Logout from Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
