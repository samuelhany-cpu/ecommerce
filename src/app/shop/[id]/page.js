"use client";
import { useState, useEffect, use as useReact } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function ProductDetailPage({ params }) {
    const resolvedParams = useReact(params);
    const { id } = resolvedParams;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [notification, setNotification] = useState(null);

    // Review Form State
    const [reviewForm, setReviewForm] = useState({ user: '', rating: 5, comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { addToCart } = useCart();
    const router = useRouter();

    useEffect(() => {
        fetch(`/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProduct(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleAddToCart = () => {
        addToCart(product);
        setNotification(`${product.name} added to cart!`);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/products/${id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewForm)
            });
            const data = await res.json();
            if (data.success) {
                setProduct({ ...product, reviews: data.data });
                setReviewForm({ user: '', rating: 5, comment: '' });
                setNotification('Review posted! Thank you.');
                setTimeout(() => setNotification(null), 3000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-cream">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-4">
            <h2 className="text-2xl font-serif font-bold text-primary">Product Not Found</h2>
            <Link href="/shop" className="text-secondary hover:underline">Back to Shop</Link>
        </div>
    );

    const avgRating = product.reviews?.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
        : 5;

    return (
        <div className="bg-cream dark:bg-charcoal min-h-screen pt-28 pb-16">
            {/* Toast Notification */}
            {notification && (
                <div className="fixed top-24 right-6 z-50 animate-bounce-subtle">
                    <div className="bg-primary text-cream px-6 py-3 rounded-lg shadow-2xl border border-secondary/20 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        <span className="font-semibold tracking-wide">{notification}</span>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-6">
                <nav className="mb-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-40 dark:opacity-30">
                    <Link href="/" className="hover:text-primary dark:hover:text-accent transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/shop" className="hover:text-primary dark:hover:text-accent transition-colors">Shop</Link>
                    <span>/</span>
                    <span className="text-primary dark:text-accent opacity-100">{product.name}</span>
                </nav>

                <div className="grid lg:grid-cols-2 gap-20 items-start animate-fade-in">
                    {/* Image Gallery Section */}
                    <div className="space-y-6">
                        <div className="aspect-[4/5] bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative group">
                            <img
                                src={product.images[activeImage]}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative w-24 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-secondary scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col h-full">
                        <div className="mb-8">
                            <span className="inline-block px-3 py-1 bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                {product.category} Collection
                            </span>
                            <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary dark:text-cream mb-4 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-3xl font-mono font-black text-secondary">${product.price}</span>
                                <div className="flex items-center gap-1 text-accent">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-current' : 'fill-zinc-300'}`} viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                    <span className="text-xs font-bold text-primary/40 ml-2">({product.reviews?.length || 0} Reviews)</span>
                                </div>
                            </div>
                            <p className="text-lg text-primary/70 leading-relaxed mb-8 font-medium italic">
                                {product.description}
                            </p>
                        </div>

                        {/* Features List */}
                        <div className="grid grid-cols-2 gap-6 mb-10">
                            <div className="p-4 bg-white/50 dark:bg-zinc-800/50 rounded-2xl border border-primary/5 dark:border-zinc-700">
                                <div className="text-secondary mb-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-widest mb-1">Material</h4>
                                <p className="text-sm opacity-60">Full-Grain Organic Leather</p>
                            </div>
                            <div className="p-4 bg-white/50 dark:bg-zinc-800/50 rounded-2xl border border-primary/5 dark:border-zinc-700">
                                <div className="text-secondary mb-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-widest mb-1">Process</h4>
                                <p className="text-sm opacity-60">Hand-Stitched Mastery</p>
                            </div>
                        </div>

                        {/* What Fits - Interactive Visualizer */}
                        <div className="mb-10 p-6 bg-primary/5 dark:bg-zinc-800/30 rounded-[2rem] border border-primary/5 dark:border-zinc-700">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-primary/40">Capacity Visualizer</h4>
                            <div className="flex gap-6 opacity-60">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">💻</div>
                                    <span className="text-[10px] font-bold">15" Laptop</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">📱</div>
                                    <span className="text-[10px] font-bold">Smartphone</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">📔</div>
                                    <span className="text-[10px] font-bold">A5 Journal</span>
                                </div>
                            </div>
                        </div>

                        {/* Add to Cart Actions */}
                        <div className="flex gap-4 mt-auto">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                                className="flex-1 py-5 bg-primary text-cream font-bold rounded-2xl shadow-2xl hover:bg-primary-light transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5 border-2 border-cream/20 rounded-full p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                {product.stock > 0 ? 'Add to Collection' : 'Waitlisted'}
                            </button>
                        </div>

                        <div className="mt-6 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                                {product.stock > 0 ? `Limited Availability: Only ${product.stock} pieces remaining` : 'Temporarily Out of Stock'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Lower Content Sections */}
                <div className="grid lg:grid-cols-3 gap-16 mt-32 animate-fade-in">
                    {/* Reviews List */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="flex justify-between items-end border-b border-primary/10 dark:border-zinc-700 pb-6">
                            <h3 className="text-3xl font-serif font-bold text-primary dark:text-cream">Patron Reviews</h3>
                            <span className="text-sm font-bold opacity-40 italic">{product.reviews?.length || 0} Stories Told</span>
                        </div>

                        {product.reviews?.length > 0 ? (
                            <div className="space-y-8">
                                {product.reviews.map((review, idx) => (
                                    <div key={idx} className="bg-white dark:bg-zinc-800 p-8 rounded-[2rem] shadow-sm border border-primary/5 dark:border-zinc-700 animate-fade-in">
                                        <div className="flex justify-between mb-4">
                                            <div>
                                                <p className="font-bold text-primary dark:text-cream">{review.user}</p>
                                                <div className="flex gap-0.5 text-accent mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'fill-zinc-200'}`} viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-primary/70 leading-relaxed italic">"{review.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center opacity-30 italic">
                                No reviews yet. Be the first to share your journey with this piece.
                            </div>
                        )}
                    </div>

                    {/* Write a Review Section */}
                    <div className="bg-white dark:bg-zinc-800 p-10 rounded-[2.5rem] shadow-xl border border-primary/5 dark:border-zinc-700 h-fit sticky top-32 animate-slide-up">
                        <h4 className="text-xl font-serif font-bold text-primary dark:text-cream mb-6">Write a Review</h4>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-2">Display Name</label>
                                <input
                                    required
                                    value={reviewForm.user}
                                    onChange={e => setReviewForm({ ...reviewForm, user: e.target.value })}
                                    className="w-full bg-cream dark:bg-zinc-900 px-4 py-3 rounded-xl border border-primary/5 dark:border-zinc-700 outline-none focus:border-secondary transition-colors text-primary dark:text-cream"
                                    placeholder="e.g. Alexander W."
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setReviewForm({ ...reviewForm, rating: num })}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${reviewForm.rating >= num ? 'bg-secondary text-white shadow-lg' : 'bg-cream text-primary/40'}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-2">Your Experience</label>
                                <textarea
                                    required
                                    value={reviewForm.comment}
                                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    rows="4"
                                    className="w-full bg-cream dark:bg-zinc-900 px-4 py-3 rounded-xl border border-primary/5 dark:border-zinc-700 outline-none focus:border-secondary transition-colors resize-none text-primary dark:text-cream"
                                    placeholder="Describe the patina, the feel, and the craftsmanship..."
                                />
                            </div>
                            <button
                                disabled={isSubmitting}
                                className="w-full py-4 bg-secondary text-white font-bold rounded-xl shadow-lg hover:bg-secondary/90 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Posting...' : 'Post Story'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Global Values / Sustainability Section */}
                <div className="grid md:grid-cols-3 gap-12 mt-32 border-t border-primary/5 dark:border-zinc-700 pt-16 animate-fade-in">
                    <div className="p-8 bg-zinc-900 rounded-[2.5rem] text-cream">
                        <h3 className="text-xl font-serif font-bold mb-6">Care & Maintenance</h3>
                        <ul className="space-y-4 opacity-70 text-sm list-disc pl-4">
                            <li>Wipe clean with a damp, soft cloth</li>
                            <li>Apply organic leather balm once a quarter</li>
                            <li>Avoid direct sunlight for extended periods</li>
                            <li>Store in provided dust bag when not in use</li>
                        </ul>
                    </div>

                    <div className="p-8 bg-white dark:bg-zinc-800 rounded-[2.5rem] md:col-span-2 shadow-sm border border-primary/5 dark:border-zinc-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-serif font-bold text-primary dark:text-cream">Sustainability Commitment</h3>
                            <span className="text-secondary font-black text-[10px] tracking-widest uppercase">100% Traceable</span>
                        </div>
                        <p className="text-primary/70 leading-relaxed mb-6 font-medium">
                            This piece is crafted from premium hides sourced from regenerative farms. Our tanning process uses certified organic vegetable extracts, reducing water usage by 40% and eliminating toxic heavy metals completely.
                        </p>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {['Eco-Friendly', 'Fair Trade', 'CO2 Neutral'].map(tag => (
                                <span key={tag} className="whitespace-nowrap px-4 py-2 bg-cream text-[10px] font-black uppercase tracking-widest text-primary/40 rounded-full border border-primary/5">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
