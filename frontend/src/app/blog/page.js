'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Head from 'next/head'

// SEO metadata
const SEO_DATA = {
  title: "PC Building Blog - Expert PC Build Guides & Reviews | PC Builder AI",
  description: "Comprehensive PC building guides, component reviews, and expert build recommendations. Learn how to build the perfect PC for gaming, streaming, and productivity.",
  keywords: "PC building, computer builds, gaming PC, PC components, CPU, GPU, motherboard, RAM, PC build guide, computer hardware reviews",
  canonical: "https://pcbuilderai.com/blog",
  og: {
    title: "PC Building Blog - Expert PC Build Guides & Reviews",
    description: "Comprehensive PC building guides, component reviews, and expert build recommendations. Learn how to build the perfect PC for gaming, streaming, and productivity.",
    type: "website",
    url: "https://pcbuilderai.com/blog",
    image: "https://pcbuilderai.com/og-blog.jpg",
  },
  twitter: {
    card: "summary_large_image",
    title: "PC Building Blog - Expert PC Build Guides & Reviews",
    description: "Comprehensive PC building guides, component reviews, and expert build recommendations.",
    image: "https://pcbuilderai.com/twitter-blog.jpg",
  },
  structuredData: {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "PC Builder AI Blog",
    "description": "Expert PC building guides, component reviews, and build recommendations",
    "url": "https://pcbuilderai.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "PC Builder AI",
      "url": "https://pcbuilderai.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://pcbuilderai.com/blog"
    }
  }
}

export default function Blog() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedPost, setSelectedPost] = useState(null)
  const [generatedContent, setGeneratedContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const blogPosts = [
    {
      id: 1,
      title: "Best Gaming PC Builds Under $1000 in 2025",
      excerpt: "Discover the most powerful gaming PC builds you can get for under $1000, optimized for 1080p gaming.",
      date: "2025-01-15",
      category: "Gaming",
      slug: "gaming-pc-under-1000",
      type: "build",
      budget: 1000,
      use_case: "gaming"
    },
    {
      id: 2,
      title: "DDR4 vs DDR5: Which RAM Should You Choose?",
      excerpt: "Complete comparison of DDR4 and DDR5 memory, including performance, pricing, and compatibility.",
      date: "2025-01-12",
      category: "Components",
      slug: "ddr4-vs-ddr5",
      type: "article"
    },
    {
      id: 3,
      title: "RTX 4070 vs RTX 4060 Ti: GPU Comparison",
      excerpt: "In-depth comparison of NVIDIA's mid-range graphics cards for 1440p gaming.",
      date: "2025-01-10",
      category: "GPU",
      slug: "rtx-4070-vs-4060-ti",
      type: "article"
    },
    {
      id: 4,
      title: "Intel 13th Gen vs AMD Ryzen 7000 Series",
      excerpt: "Which CPU platform offers better value for gaming and productivity in 2025?",
      date: "2025-01-08",
      category: "CPU",
      slug: "intel-13th-gen-vs-amd-ryzen-7000",
      type: "article"
    },
    {
      id: 5,
      title: "Complete PC Building Guide for Beginners",
      excerpt: "Step-by-step guide to building your first PC, from component selection to assembly.",
      date: "2025-01-05",
      category: "Guide",
      slug: "pc-building-guide-beginners",
      type: "article"
    },
    {
      id: 6,
      title: "Best Budget Motherboards for 2025",
      excerpt: "Top motherboard recommendations for different CPU platforms and budgets.",
      date: "2025-01-03",
      category: "Motherboard",
      slug: "best-budget-motherboards-2025",
      type: "article"
    },
    {
      id: 7,
      title: "Best Streaming PC Build Under $1500",
      excerpt: "Perfect PC build for content creators and streamers who need performance and reliability.",
      date: "2025-01-01",
      category: "Gaming",
      slug: "streaming-pc-build-1500",
      type: "build",
      budget: 1500,
      use_case: "streaming"
    },
    {
      id: 8,
      title: "Budget Gaming PC Build Under $800",
      excerpt: "Entry-level gaming PC that can handle modern games at 1080p without breaking the bank.",
      date: "2024-12-28",
      category: "Gaming",
      slug: "budget-gaming-pc-800",
      type: "build",
      budget: 800,
      use_case: "gaming"
    }
  ]

  const categories = ["All", "Gaming", "Components", "GPU", "CPU", "Guide", "Motherboard"]

  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory)

  const generateBlogContent = async (post) => {
    setLoading(true)
    setSelectedPost(post)
    setGeneratedContent("")
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'
      const endpoint = post.type === 'build' ? '/api/generate-build-article' : '/api/generate-blog-post'
      
      const payload = {
        topic: post.title,
        category: post.type === 'build' ? 'build' : 'article',
        ...(post.budget && { budget: post.budget }),
        ...(post.use_case && { use_case: post.use_case })
      }
      
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.content) {
        setGeneratedContent(data.content)
      } else {
        throw new Error('Failed to generate content')
      }
      
    } catch (error) {
      console.error('Error generating blog content:', error)
      setGeneratedContent("Sorry, we couldn't generate the content right now. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email) return
    
    // Simulate subscription (in real app, this would call an API)
    setIsSubscribed(true)
    setEmail("")
    
    setTimeout(() => {
      setIsSubscribed(false)
    }, 3000)
  }

  const closeModal = () => {
    setSelectedPost(null)
    setGeneratedContent("")
  }

  // If a post is selected, show the full article
  if (selectedPost) {
    const postSEO = {
      title: `${selectedPost.title} | PC Builder AI Blog`,
      description: selectedPost.excerpt,
      canonical: `https://pcbuilderai.com/blog/${selectedPost.slug}`,
      og: {
        title: selectedPost.title,
        description: selectedPost.excerpt,
        type: "article",
        url: `https://pcbuilderai.com/blog/${selectedPost.slug}`,
        image: "https://pcbuilderai.com/og-article.jpg",
      },
      structuredData: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": selectedPost.title,
        "description": selectedPost.excerpt,
        "datePublished": selectedPost.date,
        "dateModified": selectedPost.date,
        "author": {
          "@type": "Organization",
          "name": "PC Builder AI"
        },
        "publisher": {
          "@type": "Organization",
          "name": "PC Builder AI",
          "url": "https://pcbuilderai.com"
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://pcbuilderai.com/blog/${selectedPost.slug}`
        }
      }
    }

    return (
      <>
        <Head>
          <title>{postSEO.title}</title>
          <meta name="description" content={postSEO.description} />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={postSEO.canonical} />
          
          {/* Open Graph */}
          <meta property="og:title" content={postSEO.og.title} />
          <meta property="og:description" content={postSEO.og.description} />
          <meta property="og:type" content={postSEO.og.type} />
          <meta property="og:url" content={postSEO.og.url} />
          <meta property="og:image" content={postSEO.og.image} />
          
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={postSEO.og.title} />
          <meta name="twitter:description" content={postSEO.og.description} />
          <meta name="twitter:image" content={postSEO.og.image} />
          
          {/* Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(postSEO.structuredData)
            }}
          />
        </Head>
        
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800 shadow-lg border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <button
                  onClick={closeModal}
                  className="text-blue-400 hover:text-blue-300 mr-4"
                >
                  ← Back to Blog
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

        {/* Article Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
            <div className="h-64 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white text-center px-6">
                {selectedPost.title}
              </h1>
            </div>
            
            <div className="p-8">
              <div className="flex items-center mb-6">
                <span className="bg-blue-900 text-blue-300 text-sm font-medium px-3 py-1 rounded border border-blue-700">
                  {selectedPost.category}
                </span>
                <span className="text-slate-400 ml-4">
                  {new Date(selectedPost.date).toLocaleDateString()}
                </span>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-4 text-slate-300">Generating content with AI...</span>
                </div>
              ) : generatedContent ? (
                <div className="prose prose-invert max-w-none">
                  <div 
                    className="text-slate-300 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: generatedContent
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>')
                        .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold text-white mt-6 mb-3">$1</h2>')
                        .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>')
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">$1</a>')
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <button
                    onClick={() => generateBlogContent(selectedPost)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Generate AI Content
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </>
    )
  }

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
        {/* Build Your Dream PC Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Build Your Dream PC with AI
          </h2>
          <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
            Get personalized PC build recommendations powered by AI. Tell us your budget and use case, and we'll create the perfect build for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Generate PC Build
            </button>
            <button
              onClick={() => router.push('/ask-ai')}
              className="bg-blue-700 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors font-medium border border-blue-500"
            >
              Ask AI Questions
            </button>
          </div>
        </div>

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
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === selectedCategory 
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
          {filteredPosts.map((post) => (
            <article key={post.id} className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow border border-slate-700">
              <div className="h-48 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-white font-semibold text-lg mb-2">{post.category}</div>
                  {post.type === 'build' && (
                    <div className="text-blue-200 text-sm">
                      ${post.budget} {post.use_case} build
                    </div>
                  )}
                </div>
              </div>
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
                <button 
                  onClick={() => generateBlogContent(post)}
                  className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                >
                  Read More →
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-blue-100 mb-6">
            Get the latest PC building tips and component recommendations delivered to your inbox.
          </p>
          {isSubscribed ? (
            <div className="text-green-300 font-medium">
              ✓ Thank you for subscribing!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
              <button 
                type="submit"
                className="bg-blue-700 text-white px-6 py-3 rounded-r-lg hover:bg-blue-800 transition-colors"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}