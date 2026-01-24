'use client';

import { ShieldAlert, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function BannedPage() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1221] p-4 text-center">
            <div className="max-w-md w-full bg-[#0f172a] border border-red-500/20 rounded-2xl p-8 shadow-2xl shadow-red-500/10">
                <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-8 h-8" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Account Suspended</h1>

                <p className="text-slate-400 mb-8 leading-relaxed">
                    Your account has been suspended due to a violation of our terms of service.
                    You cannot access the platform at this time.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition flex items-center justify-center gap-2 font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>

                    <div className="text-xs text-slate-500 pt-2">
                        If you believe this is a mistake, please contact support.
                    </div>
                </div>
            </div>
        </div>
    );
}
