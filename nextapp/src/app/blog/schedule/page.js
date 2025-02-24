"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeleteConfirmModal from '@/app/components/DeleteConfirmModal';

const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString();
};

export default function ScheduledBlogs() {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        if (!email) {
            router.push('/user/login');
            return;
        }
        setUserEmail(email);
        fetchScheduledBlogs();
    }, []);

    const fetchScheduledBlogs = async () => {
        try {
            const email = localStorage.getItem('userEmail');
            const response = await fetch(`/api/blog/schedule?email=${email}`);
            const data = await response.json();
            if (response.ok) {
                setBlogs(data.blogs);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (blogId) => {
        setSelectedBlog(blogId);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`/api/blog/schedule?id=${selectedBlog}&email=${userEmail}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Scheduled blog deleted successfully');
                fetchScheduledBlogs();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
        setIsDeleteModalOpen(false);
    };

    const handleEdit = (blogId) => {
        router.push(`/blog/add?edit=${blogId}`);
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Scheduled Blog Posts</h1>
                
                {isLoading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No scheduled blog posts found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {blogs.map((blog) => (
                            <div key={blog._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold">{blog.heading}</h2>
                                        <p className="text-gray-600 mt-2">{blog.text.substring(0, 150)}...</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(blog._id)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(blog._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Scheduled for: {formatDateTime(blog.scheduledFor)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Scheduled Blog"
            />
            <ToastContainer />
            <Footer />
        </main>
    );
}
