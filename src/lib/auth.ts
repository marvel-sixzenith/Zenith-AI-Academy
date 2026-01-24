import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './prisma';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt' },
    ...authConfig,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
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
    callbacks: {
        ...authConfig.callbacks,
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
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role;
                token.picture = user.image;
            }

            // Fetch fresh user data to get updated image and banned status
            if (token.id) {
                const freshUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { image: true, role: true, banned: true },
                });
                if (freshUser) {
                    token.picture = freshUser.image;
                    token.role = freshUser.role;
                    // @ts-ignore
                    token.banned = freshUser.banned;
                }
            }

            return token;
        },
        // Re-export session from config or override if needed. 
        // Since config already has session logic (mapping token to session), we can inherit it via ...authConfig.callbacks
        // BUT we need to make sure we don't accidentally lose it if we redefine `callbacks` object.
        // We merged ...authConfig.callbacks above.
    },
});
