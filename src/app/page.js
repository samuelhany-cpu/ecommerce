import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center bg-cream dark:bg-charcoal overflow-hidden">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight text-primary dark:text-cream">
              Timeless Elegance, <br />
              <span className="text-secondary italic">Naturally.</span>
            </h1>
            <p className="text-lg md:text-xl opacity-80 max-w-lg">
              Handcrafted organic leather goods designed for the modern connoisseur.
              Sustainable luxury that ages beautifully with you.
            </p>
            <div className="flex gap-4 pt-4">
              <Link href="/shop" className="px-8 py-4 bg-primary text-white rounded-full hover:bg-primary-light transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                Shop Collection
              </Link>
              <Link href="/about" className="px-8 py-4 border border-primary dark:border-cream rounded-full hover:bg-primary hover:text-white dark:hover:bg-cream dark:hover:text-primary transition-all">
                Our Story
              </Link>
            </div>
          </div>
          <div className="relative h-full min-h-[400px] md:min-h-[600px] rounded-2xl overflow-hidden shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-700 ease-out">
            <Image
              src="/images/hero-bag.png"
              alt="Organic Leather Handbag"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-secondary/10 to-transparent pointer-events-none"></div>
      </section>

      {/* Featured Collection */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16 space-y-4">
          <span className="text-secondary uppercase tracking-widest text-sm font-semibold">Curated Quality</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary dark:text-cream">Featured Collections</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Collection 1: Women's Bags */}
          <div className="group relative h-[500px] rounded-xl overflow-hidden shadow-xl cursor-pointer">
            <Image
              src="/images/hero-bag.png"
              alt="Women's Collection"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8 text-white transition-opacity duration-300">
              <h3 className="text-3xl font-serif mb-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">Women's Handbags</h3>
              <p className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">Elegant. Durable. Sustainable.</p>
              <span className="mt-4 text-sm uppercase tracking-wide border-b border-white/50 w-max pb-1 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-200">Explore &rarr;</span>
            </div>
          </div>

          {/* Collection 2: Men's Accessories */}
          <div className="group relative h-[500px] rounded-xl overflow-hidden shadow-xl cursor-pointer">
            <Image
              src="/images/hero-cardholder.png"
              alt="Men's Collection"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8 text-white">
              <h3 className="text-3xl font-serif mb-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">Men's Essentials</h3>
              <p className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">Refined textures for the modern man.</p>
              <span className="mt-4 text-sm uppercase tracking-wide border-b border-white/50 w-max pb-1 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-200">Explore &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-primary text-cream py-20 mt-10">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-cream/10 rounded-full flex items-center justify-center mx-auto text-2xl">🌱</div>
            <h3 className="text-xl font-bold">100% Organic Leather</h3>
            <p className="opacity-80">Sourced ethically, treated naturally without harsh chemicals.</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-cream/10 rounded-full flex items-center justify-center mx-auto text-2xl">🤝</div>
            <h3 className="text-xl font-bold">Fair Trade</h3>
            <p className="opacity-80">Supporting artisan communities with fair wages and safe conditions.</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-cream/10 rounded-full flex items-center justify-center mx-auto text-2xl">✨</div>
            <h3 className="text-xl font-bold">Lifetime Quality</h3>
            <p className="opacity-80">Crafted to last a lifetime, gaining character with every use.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
