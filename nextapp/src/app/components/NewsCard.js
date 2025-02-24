import Link from 'next/link';

export default function NewsCard({ article }) {
  const encodedUrl = encodeURIComponent(
    `url=${article.url}&headline=${encodeURIComponent(article.headline)}&source=${encodeURIComponent(article.source)}&timestamp=${encodeURIComponent(article.timestamp)}`
  );
  
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all p-6">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
            {article.source}
          </span>
          <time className="text-gray-500 text-sm">{article.timestamp}</time>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex-grow line-clamp-3">
          {article.headline}
        </h3>

        <Link 
          href={`/news/${encodedUrl}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium group"
        >
          Read Summary 
          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}