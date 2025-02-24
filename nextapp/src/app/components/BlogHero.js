'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BlogHero() {
  const router = useRouter();

  const handleWriteBlog = () => {
    const isLoggedIn = localStorage.getItem('userEmail');
    if (!isLoggedIn) {
      router.push('/user/login?returnUrl=/blog/add');
      return;
    }
    router.push('/blog/add');
  };

  const handleScheduledPosts = () => {
    const isLoggedIn = localStorage.getItem('userEmail');
    if (!isLoggedIn) {
      router.push('/user/login?returnUrl=/blog/schedule');
      return;
    }
    router.push('/blog/schedule');
  };

  return (
    <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center mb-12">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
          alt="Blog Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-black/70"></div>
      </div>
      <div className="relative container mx-auto px-4 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Community Blog
        </h2>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          Read and share insights from our community
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleWriteBlog}
            className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg text-blue-900 bg-white hover:bg-blue-50 transition-colors"
          >
            Write a Blog Post
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <button
            onClick={handleScheduledPosts}
            className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Scheduled Posts
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
