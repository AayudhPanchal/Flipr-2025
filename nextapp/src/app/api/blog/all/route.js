import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/blog';

export async function GET() {
    try {
        await dbConnect();
        const blogs = await Blog.find({ status: 'published' })
            .populate('userId', 'email name')
            .sort({ dateTime: -1 });

        return NextResponse.json({ blogs }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error fetching blogs', error: error.message },
            { status: 500 }
        );
    }
}
