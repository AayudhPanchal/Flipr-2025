"use client";

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import TypeWriter from '@/app/components/TypeWriter';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi';

export default function NewsArticle({ params }) {
  const unwrappedParams = React.use(params);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [originalUrl, setOriginalUrl] = useState('');
  const [headline, setHeadline] = useState('');
  const [source, setSource] = useState('');
  const [image, setImage] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [decodedImage, setDecodedImage] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [imageError, setImageError] = useState('');

  // Add new state variables
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState('');
  const [wordpressUrl, setWordpressUrl] = useState('');

  const generateImage = async (prompt) => {
    try {
      setGeneratingImage(true);
      setImageError('');
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
    } catch (err) {
      setImageError(err.message);
    } finally {
      setGeneratingImage(false);
    }
  };

  useEffect(() => {
    let eventSource = null;
    
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const decodedUrl = decodeURIComponent(unwrappedParams.id);
        
        // Parse URL parameters
        const urlParams = new URLSearchParams(decodedUrl);
        const articleUrl = urlParams.get('url');
        const imageUrl = urlParams.get('image');
        setHeadline(urlParams.get('headline') || '');
        setSource(urlParams.get('source') || '');
        setOriginalUrl(articleUrl);
        setImage(imageUrl || '');
        setTimestamp(urlParams.get('timestamp') || '');
        
        console.log('Fetching article summary for:', articleUrl);
        
        // Include image URL in the EventSource URL
        eventSource = new EventSource(
          `http://localhost:5000/article?url=${encodeURIComponent(articleUrl)}&image=${encodeURIComponent(imageUrl)}`
        );

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Raw event data:', event.data);
            console.log('Parsed data structure:', JSON.stringify(data, null, 2));
            
            if (data.error) {
              console.error('Stream error:', data.error);
              setError(data.error);
              eventSource.close();
              setIsLoading(false);
              return;
            }
            
            if (data.summary) {
              console.log('Summary sections:', data.summary.sections);
              console.log('Setting summary data:', data.summary);
              setSummary(data.summary);
              // Set decoded image URL if available
              if (data.decodedImage) {
                setDecodedImage(data.decodedImage);
              }
              
              if (data.isLast) {
                console.log('Summary completed');
                setIsLoading(false);
                eventSource.close();
              }

              // Automatically generate image when summary is received
              if (data.summary.sections?.[3]?.content) {
                generateImage(data.summary.sections[3].content);
              }
            }
          } catch (parseError) {
            console.error('Error parsing event data:', parseError);
          }
        };

        eventSource.onerror = (error) => {
          console.error('EventSource failed:', error);
          if (eventSource) {
            eventSource.close();
          }
          if (!summary) { // Only set error if we haven't received any summary
            setError('Failed to load article summary');
          }
          setIsLoading(false);
        };

      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    if (unwrappedParams.id) {
      fetchArticle();
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [unwrappedParams.id]);

  // Add new function to handle WordPress posting
  const handleWordPressPost = async () => {
    try {
      setIsPosting(true);
      setPostError('');

      const response = await fetch('/api/wordpress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: headline,
          content: `<p>Original article: <a href="${originalUrl}" target="_blank">${source}</a></p>`,
          summary: summary,
          imageUrl: decodedImage || image || generatedImage,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to post to WordPress');
      }

      setPostSuccess(true);
      setWordpressUrl(data.postUrl);
    } catch (error) {
      setPostError(error.message);
    } finally {
      setIsPosting(false);
    }
  };

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">Error: {error}</p>
            <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
              ← Back to home
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>{headline ? `${headline} | Flipr News` : 'News Article | Flipr News'}</title>
        <meta 
          name="description" 
          content={
            summary && typeof summary === 'object' && summary.sections 
              ? summary.sections[0]?.content?.slice(0, 155) + '...' 
              : 'Read the full news article on Flipr News'
          } 
        />
        <meta property="og:title" content={headline} />
        <meta 
          property="og:description" 
          content={
            summary && typeof summary === 'object' && summary.sections 
              ? summary.sections[0]?.content?.slice(0, 155) + '...' 
              : 'Read the full news article'
          }
        />
        <meta property="og:type" content="article" />
        {image && <meta property="og:image" content={image} />}
        <meta property="article:published_time" content={timestamp} />
        <meta property="article:publisher" content={source} />
        <link rel="canonical" href={`/news/${unwrappedParams.id}`} />
      </Head>

      <main className="min-h-screen bg-gray-100" role="main">
        <header role="banner">
          <Navbar />
        </header>
        
        <article itemScope itemType="http://schema.org/NewsArticle">
          <meta itemProp="datePublished" content={timestamp} />
          <meta itemProp="publisher" content={source} />
          
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Link 
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 group transition-all text-sm font-medium"
            >
              <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to articles
            </Link>

            <article className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Image Section with improved gradient overlay */}
              {(decodedImage || image) && (
                <div className="w-full h-72 md:h-[500px] relative">
                  <img 
                    src={decodedImage || image} 
                    alt={headline} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                </div>
              )}

              {/* Improved Header Section */}
              <div className={`${
                image ? 'bg-transparent -mt-48 md:-mt-56 relative z-10' : 'bg-gradient-to-r from-blue-600 to-blue-700'
              } p-6 md:p-8`}>
                {/* Source and Timestamp */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`
                    inline-flex items-center px-3 py-1 rounded-full 
                    ${image ? 'bg-white/90 text-blue-900' : 'bg-blue-500/50 text-white'}
                    text-sm font-medium tracking-wide
                  `}>
                    {source}
                  </span>
                  {timestamp && (
                    <span className={`
                      text-sm font-medium
                      ${image ? 'text-white/90' : 'text-blue-100'}
                    `}>
                      {timestamp}
                    </span>
                  )}
                </div>

                {/* Headline */}
                <h1 className={`
                  text-2xl md:text-4xl font-bold mb-4 leading-tight
                  ${image ? 'text-white drop-shadow-lg' : 'text-white'}
                `}>
                  {headline}
                </h1>
              </div>

              {/* Progress Bar with improved styling */}
              {isLoading && (
                <div className="px-8 py-4 bg-blue-50/80 backdrop-blur-sm">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute -right-1 -top-1 h-3 w-3 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-blue-600 mt-2 font-medium">
                    Generating summary...
                  </p>
                </div>
              )}

              {/* Content Section with improved spacing */}
              <div className="p-6 md:p-8">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="animate-pulse space-y-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-lg max-w-none prose-headings:text-blue-900 prose-p:text-gray-700">
                    <TypeWriter 
                      text={summary} 
                      onProgress={(progress) => setProgress(progress)}
                    />
                  </div>
                )}
              </div>

              {/* Add generated image section */}
              {(generatingImage || generatedImage || imageError) && (
                <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">AI Generated Image</h2>
                    
                    {generatingImage && (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    
                    {imageError && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4">
                        <p className="text-red-700">{imageError}</p>
                      </div>
                    )}
                    
                    {generatedImage && (
                      <div className="space-y-4">
                        <img
                          src={generatedImage}
                          alt="AI Generated visualization"
                          className="w-full rounded-lg shadow-md"
                        />
                        <a
                          href={generatedImage}
                          download="generated-image.png"
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Download Image
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer with improved styling */}
              <div className="border-t bg-gray-50/80 backdrop-blur-sm p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <Link 
                    href="/"
                    className="text-blue-600 hover:text-blue-800 flex items-center group font-medium text-sm"
                  >
                    <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to news feed
                  </Link>
                  <a 
                    href={originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium group"
                  >
                    Read full article
                    <FiExternalLink className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </article>
          </div>

          {/* Add before the Footer component */}
          {/* <div className="max-w-4xl mx-auto px-4 mb-8">
            {!postSuccess ? (
              <button
                onClick={handleWordPressPost}
                disabled={isPosting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPosting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Posting to WordPress...
                  </>
                ) : (
                  'Post to WordPress'
                )}
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center">
                <div className="text-green-600 mb-2">✓ Successfully posted to WordPress!</div>
                <a
                  href={wordpressUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View post on WordPress
                </a>
              </div>
            )}
            
            {postError && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-700">Error: {postError}</p>
              </div>
            )}
          </div> */}

          <Footer />
        </article>
      </main>
    </>
  );
}