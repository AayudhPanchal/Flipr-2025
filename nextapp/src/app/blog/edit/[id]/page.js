"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { use } from 'react';

export default function EditBlog({ params }) {
    const resolvedParams = use(params);
    const [blog, setBlog] = useState(null);
    const [heading, setHeading] = useState('');
    const [text, setText] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledFor, setScheduledFor] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        if (!email) {
            router.push('/user/login');
            return;
        }
        fetchBlogData(resolvedParams.id, email);
    }, [resolvedParams.id]);

    const fetchBlogData = async (blogId, email) => {
        try {
            const response = await fetch(`/api/blog/edit?id=${blogId}&email=${email}`);
            const data = await response.json();
            
            if (response.ok) {
                setBlog(data.blog);
                setHeading(data.blog.heading);
                setText(data.blog.text);
                setIsScheduled(data.blog.isScheduled);
                if (data.blog.scheduledFor) {
                    const localDate = new Date(data.blog.scheduledFor);
                    setScheduledFor(localDate.toISOString().slice(0, 16));
                }
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error('Error fetching blog: ' + error.message);
            router.push('/blog/all');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = localStorage.getItem('userEmail');
        
        try {
            const response = await fetch(`/api/blog/edit?id=${resolvedParams.id}`, {
                method: 'PUT',
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
                toast.success(isScheduled ? 'Blog scheduled successfully' : 'Blog updated successfully');
                router.push(isScheduled ? '/blog/schedule' : '/blog/all');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
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
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Edit Blog Post</h1>
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                    <div>
                        <label htmlFor="heading" className="block text-sm font-medium text-gray-700 mb-2">
                            Blog Title
                        </label>
                        <input
                            type="text"
                            id="heading"
                            value={heading}
                            onChange={(e) => setHeading(e.target.value)}
                            required
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                            Blog Content
                        </label>
                        <textarea
                            id="text"
                            rows={12}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            required
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="schedule"
                                checked={isScheduled}
                                onChange={(e) => setIsScheduled(e.target.checked)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300"
                            />
                            <label htmlFor="schedule" className="ml-2 text-gray-700">
                                Schedule this post for later
                            </label>
                        </div>
                        
                        {isScheduled && (
                            <div>
                                <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700 mb-2">
                                    Schedule Date and Time
                                </label>
                                <input
                                    type="datetime-local"
                                    id="scheduledFor"
                                    required={isScheduled}
                                    value={scheduledFor}
                                    onChange={(e) => setScheduledFor(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            {isScheduled ? 'Schedule Update' : 'Update Post'}
                        </button>
                    </div>
                </form>
            </div>
            <ToastContainer />
            <Footer />
        </main>
    );
}
