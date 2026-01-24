import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
    providers: [],
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.image = token.picture as string | null;
                // @ts-ignore
                session.user.banned = token.banned as boolean;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const user = auth?.user as any;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isOnBanned = nextUrl.pathname.startsWith('/banned');

            const isOnAuth = nextUrl.pathname.startsWith('/login') ||
                nextUrl.pathname.startsWith('/register') ||
                nextUrl.pathname.startsWith('/forgot-password');

            // Handle Banned Users
            if (isLoggedIn && user?.banned) {
                // If on banned page, allow
                if (isOnBanned) return true;
                // Redirect to banned page from anywhere else
                return Response.redirect(new URL('/banned', nextUrl));
            }

            // Prevent non-banned users from seeing banned page
            if (isOnBanned && (!isLoggedIn || !user?.banned)) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            // Redirect logged in users away from auth pages
            if (isLoggedIn && isOnAuth) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            // Protect dashboard and admin routes
            if ((isOnDashboard || isOnAdmin) && !isLoggedIn) {
                return false; // Redirect to login
            }

            // Check admin role for admin routes
            if (isOnAdmin && auth?.user?.role !== 'ADMIN') {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            return true;
        },
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
