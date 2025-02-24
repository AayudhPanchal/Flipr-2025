export default function Hero({ categories, category, setCategory, setSubCategory }) {
  return (
    <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
          alt="News Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-black/70"></div>
      </div>
      <div className="relative container mx-auto px-4 text-center text-white">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Discover What Matters
        </h2>
        <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto">
          Your window to the world's stories, updated every moment
        </p>
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                setSubCategory('all');
              }}
              className={`
                px-8 py-3 rounded-full backdrop-blur-sm transition-all transform
                ${category === cat.id 
                  ? 'bg-white text-blue-900 scale-105 shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/30'
                }
                text-lg font-medium
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
