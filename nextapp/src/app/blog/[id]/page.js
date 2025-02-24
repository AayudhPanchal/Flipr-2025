'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeleteModal from '@/app/components/DeleteModal';
import Link from 'next/link';
import ShareModal from '@/app/components/ShareModal';

export default function BlogPost({ params }) {
    // Unwrap params using React.use()
    const id = use(params).id;
    const [blog, setBlog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const router = useRouter();
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await fetch(`/api/blog/read?id=${id}`);
                const data = await response.json();
                
                if (!response.ok) throw new Error(data.message);
                setBlog(data.blog);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlog();
    }, [id]);

    useEffect(() => {
        const trackView = async () => {
            try {
                await fetch('/api/blog/metrics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ blogId: id, metricType: 'view' })
                });
            } catch (err) {
                console.error('Error tracking view:', err);
            }
        };

        if (blog) {
            trackView();
        }
    }, [blog, id]);

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/blog/read?id=${id}&email=${userEmail}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message);
            
            toast.success('Blog deleted successfully');
            setTimeout(() => router.push('/blog/all'), 2000);
        } catch (err) {
            toast.error(err.message);
        }
        setIsDeleteModalOpen(false);
    };

    const handleShare = async () => {
        try {
            await fetch('/api/blog/metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blogId: id, metricType: 'share' })
            });
            
            // Update local blog state
            setBlog(prev => ({
                ...prev,
                metrics: {
                    ...prev.metrics,
                    shares: prev.metrics.shares + 1
                }
            }));
            
            toast.success('Blog shared successfully!');
        } catch (err) {
            console.error('Error sharing:', err);
            toast.error('Failed to share blog');
        }
    };

    if (isLoading) return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            
            <article className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 animate-pulse">
                    {/* Header skeleton */}
                    <div className="mb-6">
                        {/* Title skeleton */}
                        <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
                        
                        {/* Author and date skeleton */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                                </div>
                                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Content skeleton */}
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-[95%]"></div>
                        <div className="h-4 bg-gray-200 rounded w-[98%]"></div>
                        <div className="h-4 bg-gray-200 rounded w-[85%]"></div>
                        <div className="h-4 bg-gray-200 rounded w-[90%]"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-[92%]"></div>
                        <div className="h-4 bg-gray-200 rounded w-[88%]"></div>
                        <div className="h-4 bg-gray-200 rounded w-[95%]"></div>
                        <div className="h-4 bg-gray-200 rounded w-[78%]"></div>
                    </div>

                    {/* Additional content blocks */}
                    <div className="mt-8 space-y-6">
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-[97%]"></div>
                            <div className="h-4 bg-gray-200 rounded w-[94%]"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-[96%]"></div>
                            <div className="h-4 bg-gray-200 rounded w-[92%]"></div>
                            <div className="h-4 bg-gray-200 rounded w-[98%]"></div>
                        </div>
                    </div>
                </div>
            </article>

            <Footer />
        </main>
    );

    if (error) return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-8 h-8 text-red-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-lg font-medium text-red-800">Error Loading Blog</h3>
                            <p className="mt-1 text-red-700">{error}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 flex items-center text-red-600 hover:text-red-800 font-medium"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Try again
                    </button>
                </div>
            </div>
            <Footer />
        </main>
    );

    if (!blog) return <div>Blog not found</div>;

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            
            <article className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.heading}</h1>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                                        {blog.userId.name ? blog.userId.name[0].toUpperCase() : '?'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{blog.userId.name || 'Anonymous'}</p>
                                        <time className="text-sm text-gray-500">
                                            {new Date(blog.dateTime).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </time>
                                    </div>
                                </div>
                            </div>
                            {userEmail === blog.userId.email && (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href={`/blog/edit/${blog._id}`}
                                        className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="inline-flex items-center px-4 py-2 border border-red-600 rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm font-medium"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex items-center space-x-6 text-gray-500">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>{blog.metrics.views} views</span>
                            </div>
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="flex items-center hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                <span>{blog.metrics.shares} shares</span>
                            </button>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <span>Rank #{blog.metrics.searchRank || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="prose max-w-none text-gray-700 leading-relaxed">
                        {blog.text.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-4">{paragraph}</p>
                        ))}
                    </div>
                </div>
            </article>

            <DeleteModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Blog Post"
            />
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                onShare={handleShare}
            />
            <ToastContainer />
            <Footer />
        </main>
    );
}
