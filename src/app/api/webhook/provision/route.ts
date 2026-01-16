import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { api_key, user, access_level } = body;

        // Validate API key
        const webhookKey = await prisma.webhookKey.findUnique({
            where: { key: api_key },
        });

        if (!webhookKey || !webhookKey.isActive) {
            return NextResponse.json(
                { error: 'Invalid API key' },
                { status: 401 }
            );
        }

        // Validate required fields
        if (!user?.email || !user?.name) {
            return NextResponse.json(
                { error: 'User email and name are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    message: 'User already exists',
                    user: {
                        id: existingUser.id,
                        email: existingUser.email,
                    }
                },
                { status: 200 }
            );
        }

        // Generate a random password for webhook-provisioned users
        const tempPassword = await bcrypt.hash(Math.random().toString(36), 12);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                email: user.email,
                name: user.name,
                phone: user.phone || null,
                password: tempPassword,
            },
        });

        // Log for debugging (in production, store access_level if needed)
        console.log(`User provisioned via webhook: ${newUser.email}, access_level: ${access_level}`);

        return NextResponse.json(
            {
                message: 'User provisioned successfully',
                user: {
                    id: newUser.id,
                    email: newUser.email,
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Webhook provision error:', error);
        return NextResponse.json(
            { error: 'An error occurred during provisioning' },
            { status: 500 }
        );
    }
}
