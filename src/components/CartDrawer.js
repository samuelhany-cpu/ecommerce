"use client";
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartDrawer() {
    const { cart, total, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();

    if (!isCartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity animate-fade-in"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-cream z-[70] shadow-2xl flex flex-col animate-slide-in-right">
                <div className="p-8 flex justify-between items-center border-b border-primary/5 bg-white">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-primary">Your Collection</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary mt-1">
                            {cart.length} items curated
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-12 h-12 rounded-full border border-primary/5 flex items-center justify-center hover:bg-primary/5 transition-colors group"
                    >
                        <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                    {cart.length > 0 ? (
                        cart.map((item) => (
                            <div key={item._id} className="flex gap-4 group">
                                <div className="w-24 aspect-[4/5] rounded-2xl overflow-hidden bg-white shadow-sm shrink-0 border border-primary/5">
                                    <img src={item.images?.[0]} className="w-full h-full object-cover" alt={item.name} />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <h3 className="font-bold text-primary leading-tight mb-1">{item.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30">{item.category}</p>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-primary/5">
                                            <button onClick={() => updateQuantity(item._id, -1)} className="text-primary/40 hover:text-primary transition-colors">-</button>
                                            <span className="text-xs font-mono font-bold w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item._id, 1)} className="text-primary/40 hover:text-primary transition-colors">+</button>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-mono font-black text-secondary">${item.price * item.quantity}</span>
                                            <button
                                                onClick={() => removeFromCart(item._id)}
                                                className="text-[10px] font-bold text-red-400 hover:text-red-500 transition-colors mt-2"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-6">
                            <div className="text-6xl">👜</div>
                            <div>
                                <p className="font-serif font-bold text-xl mb-2">Your collection is empty</p>
                                <p className="text-xs uppercase tracking-widest">Masterpieces are waiting for you</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-primary/10 bg-white">
                    {/* Personlization Section */}
                    <div className="mb-6 p-4 bg-cream rounded-2xl border border-primary/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Premium Personalization</span>
                            <span className="text-[10px] font-bold text-secondary">Optional</span>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-primary/10 text-secondary focus:ring-secondary cursor-pointer" />
                            <span className="text-xs font-medium text-primary/70 group-hover:text-primary transition-colors">Add Embossed Monogramming ($25)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-primary/10 text-secondary focus:ring-secondary cursor-pointer" />
                            <span className="text-xs font-medium text-primary/70 group-hover:text-primary transition-colors">Artisan Gift Wrapping ($10)</span>
                        </label>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-sm opacity-60">
                            <span>Subtotal</span>
                            <span className="font-mono">$${total}</span>
                        </div>
                        <div className="flex justify-between text-sm opacity-60">
                            <span>Shipping</span>
                            <span className="text-secondary font-bold uppercase tracking-widest text-[10px]">Complimentary</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-primary pt-4 border-t border-primary/5">
                            <span>Total</span>
                            <span className="font-mono text-secondary">${total}</span>
                        </div>
                    </div>

                    <Link
                        href="/cart"
                        onClick={() => setIsCartOpen(false)}
                        className="block w-full py-5 bg-primary text-cream text-center font-bold rounded-2xl shadow-xl hover:bg-primary-light transition-all transform hover:-translate-y-1 active:scale-95 mb-4"
                    >
                        Review Collection
                    </Link>
                    <p className="text-[10px] text-center opacity-40 uppercase font-black tracking-[0.2em]">
                        Sustainable Packaging Included
                    </p>
                </div>
            </div>

            <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
        </>
    );
}
