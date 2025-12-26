"use client";
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { cart, removeFromCart, total, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'USA'
    });

    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/verify');
                const data = await res.json();
                setIsAuthenticated(data.authenticated || false);

                if (data.authenticated) {
                    const addrRes = await fetch('/api/user/addresses');
                    const addrData = await addrRes.json();
                    if (addrData.success) {
                        setAddresses(addrData.data);
                        const def = addrData.data.find(a => a.isDefault);
                        if (def) setSelectedAddressId(String(def.id ?? def._id));
                        else if (addrData.data.length > 0) setSelectedAddressId(String(addrData.data[0].id ?? addrData.data[0]._id));
                    }
                }
            } catch (err) {
                setIsAuthenticated(false);
            } finally {
                setCheckingAuth(false);
            }
        };
        checkAuth();
    }, []);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/user/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newAddress, isDefault: addresses.length === 0 })
            });
            const data = await res.json();
            if (data.success) {
                setAddresses([...addresses, data.data]);
                setSelectedAddressId(String(data.data.id ?? data.data._id));
                setShowNewAddressForm(false);
            }
        } catch (err) {
            alert('Failed to add address');
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            alert('Please login to complete your purchase');
            router.push('/login');
            return;
        }

        if (!selectedAddressId) {
            alert('Please select or add a shipping address');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(i => ({ productId: i._id, quantity: i.quantity })),
                    total,
                    addressId: selectedAddressId,
                    paymentMethod: 'cash_on_delivery'
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Order placed successfully! Check your email.');
                clearCart();
                router.push('/');
            } else {
                alert('Order failed: ' + (data.error || data.errors?.join(', ')));
            }
        } catch (err) {
            alert('Checkout error');
        } finally {
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="container mx-auto px-6 py-20 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
        );
    }

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

            {!isAuthenticated && (
                <div className="mb-8 p-6 bg-secondary/10 border border-secondary rounded-2xl">
                    <div className="flex items-center gap-4">
                        <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <div>
                            <h3 className="font-bold text-primary">Login Required</h3>
                            <p className="text-sm opacity-70">Please <Link href="/login" className="text-secondary font-bold hover:underline">sign in</Link> to complete your purchase</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-12">
                    {/* Items Section */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold border-b pb-4">Manifest Artifacts</h2>
                        {cart.map((item) => (
                            <div key={item._id} className="flex gap-6 p-6 bg-white rounded-xl shadow-sm items-center border border-primary/5 text-black">
                                <div className="w-24 h-24 bg-zinc-100 rounded-lg flex-shrink-0 overflow-hidden">
                                    {item.images?.[0] && (
                                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between mb-2">
                                        <h3 className="text-xl font-bold">{item.name}</h3>
                                        <span className="font-mono font-bold">${item.price * item.quantity}</span>
                                    </div>
                                    <p className="text-sm opacity-60 mb-2 font-mono">Qty: {item.quantity}</p>
                                    <button onClick={() => removeFromCart(item._id)} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline">Expunge</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Address Section */}
                    {isAuthenticated && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b pb-4">
                                <h2 className="text-2xl font-bold">Shipping Logistics</h2>
                                <button
                                    onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                                    className="text-[10px] font-black uppercase tracking-widest text-secondary hover:underline"
                                >
                                    {showNewAddressForm ? 'Cancel' : 'Add New Point'}
                                </button>
                            </div>

                            {showNewAddressForm ? (
                                <form onSubmit={handleAddAddress} className="bg-zinc-50 p-8 rounded-2xl grid grid-cols-2 gap-4 border border-primary/5">
                                    <input placeholder="Full Name" className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none focus:ring-2 ring-primary/20 text-primary border border-primary/10 font-bold col-span-2" required onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })} />
                                    <input placeholder="Phone" className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none focus:ring-2 ring-primary/20 text-primary border border-primary/10 font-bold" required onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                                    <input placeholder="Street" className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none focus:ring-2 ring-primary/20 text-primary border border-primary/10 font-bold col-span-2" required onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
                                    <input placeholder="City" className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none focus:ring-2 ring-primary/20 text-primary border border-primary/10 font-bold" required onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                                    <input placeholder="State" className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none focus:ring-2 ring-primary/20 text-primary border border-primary/10 font-bold" required onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                                    <input placeholder="Zip Code" className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none focus:ring-2 ring-primary/20 text-primary border border-primary/10 font-bold" required onChange={e => setNewAddress({ ...newAddress, zipCode: e.target.value })} />
                                    <button type="submit" className="col-span-2 bg-primary text-white font-black p-4 rounded-2xl uppercase tracking-widest text-xs">Verify & Save Point</button>
                                </form>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {addresses.map(addr => {
                                        const aid = addr.id ?? addr._id;
                                        return (
                                            <div
                                                key={aid}
                                                onClick={() => setSelectedAddressId(String(aid))}
                                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === String(aid) ? 'border-primary bg-primary/5 shadow-md' : 'border-primary/5 bg-white hover:shadow-sm'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="font-black text-xs uppercase tracking-widest">{addr.street === 'Legacy Migration Address' ? 'Legacy Safehouse' : 'Designated Point'}</p>
                                                    {addr.isDefault && <span className="bg-secondary text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">Primary</span>}
                                                </div>
                                                <p className="font-bold text-lg">{addr.fullName}</p>
                                                <p className="text-sm opacity-70">{addr.street}</p>
                                                <p className="text-sm opacity-70">{addr.city}, {addr.state} {addr.zipCode}</p>
                                            </div>
                                        )
                                    })}
                                    {addresses.length === 0 && (
                                        <div className="col-span-2 p-6 bg-white border border-primary/5 rounded-2xl shadow-sm">
                                            <div className="flex items-start gap-4">
                                                <span className="text-2xl text-red-500 mt-1">⚠️</span>
                                                <div>
                                                    <p className="text-sm text-red-600 font-bold">No shipping points registered.</p>
                                                    <p className="text-xs text-primary/60">Add a shipping point to enable checkout.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="bg-white p-8 rounded-xl shadow-lg h-fit border border-primary/10 sticky top-24 text-black">
                    <h2 className="text-2xl font-bold mb-6">Remittance Summary</h2>
                    <div className="flex justify-between mb-4 pb-4 border-b border-zinc-200">
                        <span className="text-sm uppercase tracking-widest font-bold opacity-60">Subtotal</span>
                        <span className="font-mono font-bold">${total}</span>
                    </div>
                    <div className="flex justify-between mb-8 text-2xl font-black text-secondary">
                        <span>Total</span>
                        <span className="font-mono">${total}</span>
                    </div>

                    <form onSubmit={handleCheckout} className="space-y-4">
                        {!isAuthenticated ? (
                            <Link
                                href="/login"
                                className="block w-full py-5 bg-secondary text-white font-black rounded-xl hover:bg-secondary/90 transition-all shadow-lg text-center uppercase tracking-[0.2em] text-xs"
                            >
                                Authenticate to Proceed
                            </Link>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading || !selectedAddressId}
                                className="w-full py-5 bg-primary text-white font-black rounded-xl hover:bg-primary-light transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-xs"
                            >
                                {loading ? 'Authorizing...' : 'Finalize Dispatch'}
                            </button>
                        )}
                    </form>
                    <p className="text-[10px] text-center mt-6 text-primary/40 font-black uppercase tracking-widest">Secure RSA-2048 Transaction Protocol</p>
                </div>
            </div>
        </div>
    );
}
