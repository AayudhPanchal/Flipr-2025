import dbConnect from '@/lib/db';
import Blog from '@/models/blog';
import User from '@/models/user';
import { NextResponse } from 'next/server';

export async function PUT(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const { email, heading, text, isScheduled, scheduledFor } = await req.json();

        if (!id || !email || !heading || !text) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const existingBlog = await Blog.findOne({ _id: id, userId: user._id });
        if (!existingBlog) {
            return NextResponse.json({ message: 'Blog not found or unauthorized' }, { status: 404 });
        }

        // Update blog properties
        existingBlog.heading = heading;
        existingBlog.text = text;
        existingBlog.isScheduled = Boolean(isScheduled);
        
        if (isScheduled && scheduledFor) {
            const scheduledDate = new Date(scheduledFor);
            if (scheduledDate <= new Date()) {
                return NextResponse.json({ message: 'Scheduled time must be in the future' }, { status: 400 });
            }
            existingBlog.scheduledFor = scheduledDate;
            existingBlog.status = 'scheduled';
            existingBlog.dateTime = null;
        } else {
            existingBlog.scheduledFor = null;
            existingBlog.status = 'published';
            existingBlog.dateTime = existingBlog.dateTime || new Date();
        }

        await existingBlog.save();

        return NextResponse.json({ 
            message: isScheduled ? 'Blog scheduled successfully' : 'Blog updated successfully',
            blog: existingBlog 
        }, { status: 200 });
    } catch (error) {
        console.error('Edit blog error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

// Get blog details for editing
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const email = searchParams.get('email');

        if (!id || !email) {
            return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const blog = await Blog.findOne({ _id: id, userId: user._id });
        if (!blog) {
            return NextResponse.json({ message: 'Blog not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ blog }, { status: 200 });
    } catch (error) {
        console.error('Get blog error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
