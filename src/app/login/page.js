"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.success) {
                if (data.user.role === 'admin') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
                router.refresh();
            } else {
                setError(data.error);
                if (data.needsVerification) {
                    // Option to redirect to register page with state or just show error
                    setError(data.error + " Redirecting you to verify...");
                    setTimeout(() => router.push('/register'), 2000);
                }
            }
        } catch (err) {
            setError('Something went wrong');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-charcoal px-6">
            <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
                <h1 className="text-3xl font-serif font-bold text-center mb-2 text-primary dark:text-cream">Welcome Back</h1>
                <p className="text-center text-sm opacity-60 mb-8">Sign in to access your account</p>

                {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="samuelhany500@gmail.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        Sign In
                    </button>
                </form>

                <p className="mt-6 text-center text-sm opacity-60">
                    Don't have an account? <Link href="/register" className="text-secondary font-bold hover:underline">Create Account</Link>
                </p>
            </div>
        </div>
    );
}
