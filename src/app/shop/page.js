"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export default function ShopPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const [filter, setFilter] = useState('All');

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

    const filteredProducts = filter === 'All' ? products : products.filter(p => p.category === filter);

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                <h1 className="text-4xl font-serif font-bold text-primary dark:text-cream">Shop Collection</h1>

                <div className="flex gap-4 mt-6 md:mt-0">
                    {['All', 'Women', 'Men', 'Accessories'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-full text-sm uppercase tracking-wide transition-all ${filter === cat ? 'bg-primary text-white shadow-md' : 'text-primary dark:text-cream hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center opacity-50">Loading collection...</div>
            ) : (
                <div className="grid md:grid-cols-3 gap-8">
                    {filteredProducts.map(product => (
                        <div key={product._id} className="group bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="relative h-[300px] w-full bg-zinc-100 dark:bg-zinc-800">
                                {/* Placeholder for product image if not present */}
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>No Image</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="absolute bottom-4 right-4 bg-white dark:bg-charcoal text-primary dark:text-cream p-3 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-serif font-bold">{product.name}</h3>
                                    <span className="font-mono text-lg text-secondary">${product.price}</span>
                                </div>
                                <p className="text-sm opacity-60 line-clamp-2 mb-4">{product.description}</p>
                                <span className="text-xs uppercase tracking-widest opacity-40">{product.category}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
