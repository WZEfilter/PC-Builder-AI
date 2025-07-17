'use client'

import { useRouter } from 'next/navigation'

export default function Blog() {
  const router = useRouter()

  const blogPosts = [
    {
      id: 1,
      title: "Best Gaming PC Builds Under $1000 in 2025",
      excerpt: "Discover the most powerful gaming PC builds you can get for under $1000, optimized for 1080p gaming.",
      date: "2025-01-15",
      category: "Gaming",
      slug: "gaming-pc-under-1000"
    },
    {
      id: 2,
      title: "DDR4 vs DDR5: Which RAM Should You Choose?",
      excerpt: "Complete comparison of DDR4 and DDR5 memory, including performance, pricing, and compatibility.",
      date: "2025-01-12",
      category: "Components",
      slug: "ddr4-vs-ddr5"
    },
    {
      id: 3,
      title: "RTX 4070 vs RTX 4060 Ti: GPU Comparison",
      excerpt: "In-depth comparison of NVIDIA's mid-range graphics cards for 1440p gaming.",
      date: "2025-01-10",
      category: "GPU",
      slug: "rtx-4070-vs-4060-ti"
    },
    {
      id: 4,
      title: "Intel 13th Gen vs AMD Ryzen 7000 Series",
      excerpt: "Which CPU platform offers better value for gaming and productivity in 2025?",
      date: "2025-01-08",
      category: "CPU",
      slug: "intel-13th-gen-vs-amd-ryzen-7000"
    },
    {
      id: 5,
      title: "Complete PC Building Guide for Beginners",
      excerpt: "Step-by-step guide to building your first PC, from component selection to assembly.",
      date: "2025-01-05",
      category: "Guide",
      slug: "pc-building-guide-beginners"
    },
    {
      id: 6,
      title: "Best Budget Motherboards for 2025",
      excerpt: "Top motherboard recommendations for different CPU platforms and budgets.",
      date: "2025-01-03",
      category: "Motherboard",
      slug: "best-budget-motherboards-2025"
    }
  ]

  const categories = ["All", "Gaming", "Components", "GPU", "CPU", "Guide", "Motherboard"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-blue-400 hover:text-blue-300 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-white">PC Builder AI</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-slate-300 hover:text-white">Home</a>
              <a href="/ask-ai" className="text-slate-300 hover:text-white">Ask AI</a>
              <a href="/blog" className="text-blue-400 font-medium">Blog</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            PC Building Blog
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Expert insights, component reviews, and building guides to help you make the best PC decisions.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === "All" 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow border border-slate-700">
              <div className="h-48 bg-gradient-to-br from-blue-600 to-purple-600"></div>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-blue-900 text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-700">
                    {post.category}
                  </span>
                  <span className="text-slate-400 text-sm ml-auto">
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mb-3 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-slate-300 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <button className="text-blue-400 hover:text-blue-300 font-medium text-sm">
                  Read More →
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Load More Articles
          </button>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-blue-100 mb-6">
            Get the latest PC building tips and component recommendations delivered to your inbox.
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="bg-blue-700 text-white px-6 py-3 rounded-r-lg hover:bg-blue-800 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}