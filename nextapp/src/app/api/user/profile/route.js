import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/user';

export async function GET(req) {
    try {
        await dbConnect();
        const email = req.nextUrl.searchParams.get('email');
        
        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email }).select('name email');
        
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error fetching user profile', error: error.message },
            { status: 500 }
        );
    }
}
