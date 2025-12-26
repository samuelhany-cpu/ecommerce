"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [step, setStep] = useState('register'); // 'register' or 'verify'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (data.success) {
                setStep('verify');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    code: otp
                })
            });

            const data = await res.json();

            if (data.success) {
                alert('Verification successful! You can now login.');
                router.push('/login');
            } else {
                setError(data.error || 'Verification failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-charcoal py-12 px-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-serif font-bold text-primary dark:text-cream mb-2">
                        {step === 'register' ? 'Create Account' : 'Confirm Email'}
                    </h1>
                    <p className="text-sm opacity-60">
                        {step === 'register' ? 'Join the LuxeLeather community' : `We've sent a code to ${formData.email}`}
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-primary/5 dark:border-zinc-800">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm italic font-medium">
                            {error}
                        </div>
                    )}

                    {step === 'register' ? (
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-primary dark:text-cream/60">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-4 rounded-xl border border-primary/10 dark:border-zinc-700 bg-cream dark:bg-zinc-800 text-primary dark:text-cream outline-none focus:border-secondary transition-all font-medium"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-primary dark:text-cream/60">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-4 rounded-xl border border-primary/10 dark:border-zinc-700 bg-cream dark:bg-zinc-800 text-primary dark:text-cream outline-none focus:border-secondary transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-primary dark:text-cream/60">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-4 rounded-xl border border-primary/10 dark:border-zinc-700 bg-cream dark:bg-zinc-800 text-primary dark:text-cream outline-none focus:border-secondary transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-primary text-cream font-black uppercase tracking-widest text-xs rounded-xl hover:bg-primary-light transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Create Account'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6 text-center">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-primary dark:text-cream/60">
                                    Enter 6-Digit Code
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full px-4 py-6 rounded-2xl border border-primary/10 dark:border-zinc-700 bg-cream dark:bg-zinc-800 text-primary dark:text-cream outline-none focus:border-secondary tracking-[1em] text-3xl font-bold text-center transition-all"
                                    placeholder="000000"
                                />
                                <p className="mt-4 text-xs opacity-60 font-medium italic">
                                    Didn't receive the code? {" "}
                                    <button
                                        type="button"
                                        onClick={handleRegister}
                                        className="text-secondary font-bold hover:underline"
                                    >
                                        Resend
                                    </button>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full py-5 bg-secondary text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-secondary/90 transition-all shadow-lg disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('register')}
                                className="text-sm opacity-60 hover:opacity-100 transition-opacity"
                            >
                                Back to registration
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center text-xs font-bold uppercase tracking-widest opacity-40">
                        <span>Already have an account? </span>
                        <Link href="/login" className="text-secondary hover:underline">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
