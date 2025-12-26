"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const { cart, setIsCartOpen } = useCart();
    const pathname = usePathname();

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/verify');
                const data = await res.json();
                if (data.authenticated) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error('Auth check failed');
                setUser(null);
            }
        };

        checkAuth();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg py-2' : 'bg-transparent py-4'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-primary dark:text-accent">
                    LUXE<span className="text-secondary">LEATHER</span>
                </Link>

                <div className="hidden md:flex space-x-8">
                    <NavLink href="/shop">Shop</NavLink>
                    <NavLink href="/about">Our Story</NavLink>
                    {user?.role === 'admin' && <NavLink href="/admin">Admin</NavLink>}
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 hover:text-accent transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                                {cartCount}
                            </span>
                        )}
                    </button>
                    {user ? (
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-white hover:bg-secondary/90 transition-all font-bold text-sm shadow-sm"
                        >
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            My Account
                        </Link>
                    ) : (
                        <Link href="/login" className="px-6 py-2 rounded-full bg-primary text-white hover:bg-primary-light transition-transform hover:scale-105 font-bold text-sm">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, children }) {
    return (
        <Link href={href} className="text-xs font-black uppercase tracking-[0.2em] text-primary hover:text-accent transition-colors">
            {children}
        </Link>
    );
}
