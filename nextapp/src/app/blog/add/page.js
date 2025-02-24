"use client"
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import ConfirmModal from '@/app/components/ConfirmModal';

export default function AddBlog() {
    const [heading, setHeading] = useState('');
    const [text, setText] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledFor, setScheduledFor] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [blogId, setBlogId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;

    useEffect(() => {
        const editId = searchParams.get('edit');
        if (editId) {
            setBlogId(editId);
            setIsEditing(true);
            fetchBlogData(editId);
        } else {
            setLoading(false);
        }
    }, [searchParams]);

    const fetchBlogData = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/blog/read?id=${id}`);
            const data = await response.json();
            
            if (response.ok) {
                setHeading(data.blog.heading);
                setText(data.blog.text);
                setIsScheduled(Boolean(data.blog.isScheduled));
                if (data.blog.scheduledFor) {
                    const localDate = new Date(data.blog.scheduledFor);
                    setScheduledFor(localDate.toISOString().slice(0, 16));
                }
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            alert('Error fetching blog: ' + error.message);
            router.push('/blog/all');
        } finally {
            setLoading(false);
        }
    };

    const submitBlog = async () => {
        try {
            const endpoint = isEditing ? `/api/blog/edit?id=${blogId}` : '/api/blog/add';
            const response = await fetch(endpoint, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    heading,
                    text,
                    isScheduled,
                    scheduledFor: isScheduled ? scheduledFor : null
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                router.push(isScheduled ? '/blog/schedule' : '/blog/all');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!email) {
            alert('Please login to continue');
            router.push('/user/login');
            return;
        }

        if (isScheduled && scheduledFor) {
            const scheduledTime = new Date(scheduledFor);
            if (scheduledTime <= new Date()) {
                alert('Scheduled time must be in the future');
                return;
            }
        }

        setShowConfirmModal(true);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="relative py-8 md:py-12">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-100"></div>
                
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-12">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{isEditing ? 'Edit Blog Post' : 'Create a New Blog Post'}</h1>
                        <p className="mt-2 text-gray-600">Share your thoughts and insights with our community</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
                        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                            {/* Title Input with Icon */}
                            <div>
                                <label htmlFor="heading" className="block text-sm font-medium text-gray-700 mb-2">
                                    Blog Title
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="heading"
                                        value={heading}
                                        onChange={(e) => setHeading(e.target.value)}
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder="Enter an engaging title for your blog post"
                                    />
                                </div>
                            </div>

                            {/* Content Textarea with Icon */}
                            <div>
                                <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                                    Blog Content
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="absolute left-3 top-3 pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                        </svg>
                                    </div>
                                    <textarea
                                        id="text"
                                        rows={12}
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder="Write your blog content here..."
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    Use clear paragraphs and headings to make your content easy to read.
                                </p>
                            </div>
                        </div>

                        {/* Add Scheduling Option */}
                        <div className="px-4 md:px-8 py-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="schedule"
                                    checked={isScheduled}
                                    onChange={(e) => setIsScheduled(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                />
                                <label htmlFor="schedule" className="ml-2 text-sm text-gray-700">
                                    Schedule this post for later
                                </label>
                            </div>
                            
                            {isScheduled && (
                                <div className="mt-4">
                                    <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700">
                                        Schedule Date and Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="scheduledFor"
                                        required={isScheduled}
                                        value={scheduledFor}
                                        onChange={(e) => setScheduledFor(e.target.value)}
                                        min={new Date().toISOString().slice(0, 16)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Actions Footer */}
                        <div className="px-4 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <Link
                                href="/blog/all"
                                className="w-full sm:w-auto px-6 py-3 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium transition-colors flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                </svg>
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {isEditing ? 'Update Post' : 'Publish Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => {
                    submitBlog();
                    setShowConfirmModal(false);
                }}
                title={isScheduled ? 'Schedule Blog Post' : 'Publish Blog Post'}
                message={isScheduled 
                    ? 'Are you sure you want to schedule this blog post?' 
                    : 'Are you sure you want to publish this blog post now?'}
                isScheduled={isScheduled}
                scheduledTime={scheduledFor}
            />

            <Footer />
        </main>
    );
}
