"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg py-2' : 'bg-transparent py-4'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-primary dark:text-accent">
                    LUXE<span className="text-secondary">LEATHER</span>
                </Link>

                <div className="hidden md:flex space-x-8">
                    <NavLink href="/shop">Shop</NavLink>
                    <NavLink href="/about">Our Story</NavLink>
                    <NavLink href="/admin">Admin</NavLink>
                </div>

                <div className="flex items-center space-x-4">
                    <Link href="/cart" className="relative hover:text-accent transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                    </Link>
                    <Link href="/login" className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-light transition-transform hover:scale-105">
                        Login
                    </Link>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, children }) {
    return (
        <Link href={href} className="text-sm uppercase tracking-widest hover:text-accent transition-colors">
            {children}
        </Link>
    );
}
