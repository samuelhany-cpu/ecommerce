"use client";
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="bg-cream dark:bg-charcoal min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1524294071325-34722369617c?auto=format&fit=crop&q=80&w=2000"
                        alt="Leather Crafting"
                        className="w-full h-full object-cover opacity-60 dark:opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cream dark:to-charcoal" />
                </div>

                <div className="relative z-10 text-center px-6 max-w-4xl animate-slide-up">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary mb-4 block">Our Heritage</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary dark:text-cream mb-6">
                        Crafted for the <br /> <span className="text-secondary italic">Conscious Soul</span>
                    </h1>
                </div>
            </section>

            {/* Narrative Section */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl font-serif font-bold text-primary dark:text-cream">The LuxeLeather Philosophy</h2>
                            <p className="text-lg text-primary/70 dark:text-cream/70 leading-relaxed">
                                Born from a desire to bridge the gap between luxury and longevity, LuxeLeather represents a commitment to the art of slow living. We believe that what you carry should tell a story—not just of wealth, but of character, craftsmanship, and care for the world we inhabit.
                            </p>
                            <p className="text-lg text-primary/70 dark:text-cream/70 leading-relaxed">
                                Every piece is handcrafted using organic, vegetable-tanned leather, ensuring that your accessory ages as gracefully as you do, developing a unique patina that reflects your journey.
                            </p>
                            <div className="pt-6">
                                <Link href="/shop" className="px-10 py-4 bg-primary text-cream rounded-full font-bold hover:bg-primary-light transition-all shadow-xl hover:-translate-y-1">
                                    Explore the Collection
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1523199455310-87b16c093f2d?auto=format&fit=crop&q=80&w=1000"
                                alt="Studio Process"
                                className="rounded-[3rem] shadow-2xl"
                            />
                            <div className="absolute -bottom-10 -left-10 bg-secondary p-8 rounded-3xl text-white shadow-2xl hidden lg:block">
                                <p className="text-3xl font-serif font-bold italic">"Quality over everything."</p>
                                <p className="text-xs uppercase tracking-widest mt-2 opacity-80">— Chief Artisan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-primary text-cream">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-serif font-bold mb-4">Our Three Pillars</h2>
                        <div className="w-20 h-1 bg-secondary mx-auto"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                title: "Organic Materials",
                                desc: "We use only vegetable-tanned leathers, free from toxic chemicals, preserving both the environment and the natural beauty of the hide."
                            },
                            {
                                title: "Ethical Artistry",
                                desc: "Our craftsmen are paid fair living wages and work in safe, inspiring environments that honor their multi-generational skills."
                            },
                            {
                                title: "Lifetime Promise",
                                desc: "LuxeLeather pieces are designed to last a lifetime. Should your item ever fail in its construction, we'll repair it for free."
                            }
                        ].map((pillar, idx) => (
                            <div key={idx} className="p-10 rounded-3xl bg-cream/5 border border-cream/10 hover:bg-cream/10 transition-all text-center group">
                                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">✨</div>
                                <h3 className="text-xl font-bold mb-4 text-secondary uppercase tracking-widest">{pillar.title}</h3>
                                <p className="opacity-70 leading-relaxed">{pillar.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
