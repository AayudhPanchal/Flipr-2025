import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/blog';
import User from '@/models/user';

// Get scheduled posts for a user
export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const now = new Date();
        const blogs = await Blog.find({
            userId: user._id,
            isScheduled: true,
            status: 'scheduled',
            scheduledFor: { $gt: now } // Only get future scheduled posts
        }).sort({ scheduledFor: 1 });

        // Format dates and ensure both conditions are met
        const formattedBlogs = blogs
            .filter(blog => blog.isScheduled && blog.status === 'scheduled')
            .map(blog => ({
                ...blog.toObject(),
                scheduledFor: blog.scheduledFor?.toISOString(),
                dateTime: blog.scheduledFor?.toISOString() // Use scheduledFor as dateTime
            }));

        return NextResponse.json({ blogs: formattedBlogs }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
    }
}

// Delete a scheduled post
export async function DELETE(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
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
            return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
        }

        await Blog.deleteOne({ _id: id });
        return NextResponse.json({ message: 'Blog deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
    }
}

// Check and publish scheduled posts
export async function PATCH() {
    try {
        await dbConnect();
        const now = new Date();

        // Find all scheduled posts that should be published
        const scheduledPosts = await Blog.find({
            status: 'scheduled',
            scheduledFor: { $lte: now }
        });

        // Update their status to published
        for (const post of scheduledPosts) {
            post.status = 'published';
            post.dateTime = post.scheduledFor;
            await post.save();
        }

        return NextResponse.json({ 
            message: 'Scheduled posts updated',
            updatedCount: scheduledPosts.length 
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
    }
}

// Publish scheduled posts
export async function POST(request) {
    try {
        await dbConnect();
        const now = new Date();

        // Find and update posts that should be published in one operation
        const result = await Blog.updateMany(
            {
                status: 'scheduled',
                isScheduled: true,
                scheduledFor: { $lte: now }
            },
            {
                $set: {
                    status: 'published',
                    isScheduled: false,
                    dateTime: now
                }
            }
        );

        return NextResponse.json({ 
            message: 'Scheduled posts checked',
            updatedCount: result.modifiedCount
        }, { status: 200 });
    } catch (error) {
        console.error('Schedule check error:', error);
        return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
    }
}
