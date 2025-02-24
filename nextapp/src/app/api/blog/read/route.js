import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/blog';

export async function GET(req) {
    try {
        await dbConnect();
        const id = req.nextUrl.searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ message: 'Blog ID is required' }, { status: 400 });
        }

        const blog = await Blog.findById(id).populate('userId', 'email name');
        
        if (!blog) {
            return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
        }

        return NextResponse.json({ blog }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error fetching blog', error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const id = req.nextUrl.searchParams.get('id');
        const userEmail = req.nextUrl.searchParams.get('email');

        if (!id || !userEmail) {
            return NextResponse.json({ message: 'Blog ID and user email are required' }, { status: 400 });
        }

        const blog = await Blog.findById(id).populate('userId', 'email');
        
        if (!blog) {
            return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
        }

        if (blog.userId.email !== userEmail) {
            return NextResponse.json({ message: 'Unauthorized to delete this blog' }, { status: 403 });
        }

        await Blog.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Blog deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error deleting blog', error: error.message },
            { status: 500 }
        );
    }
}
