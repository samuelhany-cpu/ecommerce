"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

const categories = ["All", "Women", "Men", "Accessories"];

export default function ShopPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [notification, setNotification] = useState(null);
    const { addToCart } = useCart();
    const router = useRouter();

    useEffect(() => {
        async function loadProducts() {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                if (data.success) {
                    setProducts(data.data);
                }
            } catch (e) {
                console.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    const handleAddToCart = (product) => {
        addToCart(product);
        setNotification(`${product.name} added to cart!`);
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredProducts = filter === 'All'
        ? products
        : products.filter(p => p.category === filter);

    return (
        <div className="container mx-auto px-6 py-12 relative min-h-screen">
            {/* Toast Notification */}
            {notification && (
                <div className="fixed top-24 right-6 z-50 animate-bounce-subtle">
                    <div className="bg-primary text-cream px-6 py-3 rounded-lg shadow-2xl border border-secondary/20 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        <span className="font-semibold tracking-wide">{notification}</span>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary dark:text-cream tracking-tight">Shop Collection</h1>

                <div className="flex flex-wrap gap-4">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-8 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${filter === cat
                                ? "bg-primary text-cream shadow-xl scale-105"
                                : "bg-white dark:bg-zinc-800 text-primary/60 dark:text-cream/60 border border-zinc-200 dark:border-zinc-700 hover:border-primary"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center opacity-30 gap-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold tracking-widest uppercase">Curating Collection...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="group relative flex flex-col bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700">
                            <div
                                className="relative aspect-[4/5] overflow-hidden bg-cream cursor-pointer"
                                onClick={() => router.push(`/shop/${product._id}`)}
                            >
                                {product.images?.[0] ? (
                                    <>
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className={`w-full h-full object-cover transition-all duration-1000 ${product.images[1] ? 'group-hover:opacity-0' : 'group-hover:scale-110'}`}
                                        />
                                        {product.images[1] && (
                                            <img
                                                src={product.images[1]}
                                                alt={`${product.name} detail`}
                                                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-1000 scale-105 group-hover:scale-100"
                                            />
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs font-bold tracking-widest uppercase bg-zinc-50">No Image Preview</div>
                                )}

                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                                        {product.category}
                                    </span>
                                </div>

                                {/* Premium Add to Cart Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product);
                                        }}
                                        className="w-full py-4 bg-white text-primary font-bold rounded-xl shadow-2xl flex items-center justify-center gap-3 hover:bg-secondary hover:text-white transition-all transform hover:scale-[1.02] active:scale-95"
                                    >
                                        <span className="text-xl">+</span> Add to Cart
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 grow flex flex-col">
                                <div
                                    className="cursor-pointer group/title"
                                    onClick={() => router.push(`/shop/${product._id}`)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-bold tracking-tight text-primary dark:text-cream leading-tight group-hover/title:text-secondary transition-colors italic font-serif underline decoration-transparent group-hover/title:decoration-secondary decoration-2 underline-offset-4">
                                            {product.name}
                                        </h3>
                                        <div className="flex flex-col items-end">
                                            <span className="text-secondary font-mono font-black text-lg">${product.price}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm opacity-60 leading-relaxed line-clamp-2 mb-6 font-medium">{product.description}</p>
                                </div>

                                <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                            {product.stock > 0 ? `${product.stock} Units Available` : 'Waitlisted'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/shop/${product._id}`)}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors"
                                    >
                                        Details →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
