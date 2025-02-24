import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/blog';

export async function POST(req) {
    try {
        await dbConnect();
        const { blogId, metricType } = await req.json();

        if (!blogId || !metricType) {
            return NextResponse.json({ message: 'Blog ID and metric type are required' }, { status: 400 });
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
        }

        await blog.updateMetrics(metricType);
        return NextResponse.json({ message: 'Metrics updated successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error updating metrics', error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    try {
        await dbConnect();
        const blogId = req.nextUrl.searchParams.get('blogId');

        if (!blogId) {
            return NextResponse.json({ message: 'Blog ID is required' }, { status: 400 });
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
        }

        return NextResponse.json({ metrics: blog.metrics }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error fetching metrics', error: error.message },
            { status: 500 }
        );
    }
}
