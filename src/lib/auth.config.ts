import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

import Google from 'next-auth/providers/google';

export const authConfig: NextAuthConfig = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true, // Allow linking if email exists
        }),
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (!isPasswordValid) {
                    return null;
                }

                // Update last active
                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastActiveAt: new Date() },
                });

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                };
            },
        }),
    ],
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async signIn({ user, account }) {
            // Allow OAuth without email verification
            if (account?.provider === 'google') {
                if (!user.email) return false;

                // Check intent
                const { cookies } = await import('next/headers');
                const cookieStore = await cookies();
                const intent = cookieStore.get('auth_intent')?.value;

                if (intent === 'login') {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email },
                    });
                    if (!existingUser) {
                        return `/register?error=AccountNotRegistered&email=${encodeURIComponent(user.email || '')}&name=${encodeURIComponent(user.name || '')}`;
                    }
                }

                return true;
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role;
                token.picture = user.image;
            }

            // Fetch fresh user data to get updated image
            if (token.id) {
                const freshUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { image: true, role: true },
                });
                if (freshUser) {
                    token.picture = freshUser.image;
                    token.role = freshUser.role;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.image = token.picture as string | null;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isOnAuth = nextUrl.pathname.startsWith('/login') ||
                nextUrl.pathname.startsWith('/register') ||
                nextUrl.pathname.startsWith('/forgot-password');

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
