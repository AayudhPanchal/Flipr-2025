import dbConnect from '@/lib/db';
import Blog from '@/models/blog';
import User from '@/models/user';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await dbConnect();
        const { email, heading, text, isScheduled, scheduledFor } = await req.json();

        if (!email || !heading || !text) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Parse scheduledFor as a proper Date object
        const scheduledDate = isScheduled && scheduledFor ? new Date(scheduledFor) : null;
        const now = new Date();

        // Validate scheduling time
        if (isScheduled && scheduledDate) {
            if (scheduledDate <= now) {
                return NextResponse.json({ 
                    message: 'Scheduled time must be in the future' 
                }, { status: 400 });
            }
        }

        const newBlog = new Blog({
            userId: user._id,
            heading,
            text,
            isScheduled: Boolean(isScheduled),
            scheduledFor: scheduledDate,
            status: isScheduled ? 'scheduled' : 'published',
            dateTime: isScheduled ? scheduledDate : now // Set dateTime to scheduledFor for scheduled posts
        });

        await newBlog.save();
        
        // Format dates before sending response
        const blogResponse = {
            ...newBlog.toObject(),
            scheduledFor: newBlog.scheduledFor ? newBlog.scheduledFor.toISOString() : null,
            dateTime: newBlog.dateTime ? newBlog.dateTime.toISOString() : null
        };

        return NextResponse.json({ 
            message: isScheduled ? 'Blog scheduled successfully' : 'Blog created successfully', 
            blog: blogResponse 
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
