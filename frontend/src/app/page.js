'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [budget, setBudget] = useState('')
  const [useCase, setUseCase] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [additionalRequirements, setAdditionalRequirements] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const useCaseOptions = [
    { value: 'gaming', label: 'Gaming' },
    { value: 'streaming', label: 'Streaming' },
    { value: 'editing', label: 'Video Editing' },
    { value: 'office', label: 'Office Work' },
    { value: 'programming', label: 'Programming' },
    { value: 'ai-ml', label: 'AI/ML Development' },
    { value: 'content-creation', label: 'Content Creation' },
    { value: 'general', label: 'General Use' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!budget || !useCase) {
      alert('Please fill in budget and use case')
      return
    }

    setIsLoading(true)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout for PC builds
      
      console.log('Starting PC build generation...')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate-build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget: parseInt(budget),
          use_case: useCase,
          currency: currency,
          additional_requirements: additionalRequirements || null,
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log('Response received:', response.status)
      
      if (!response.ok) {
        console.error('Response not ok:', response.status)
        throw new Error('Failed to generate build')
      }
      
      const data = await response.json()
      
      // Add timestamp to build data
      const buildWithTimestamp = {
        ...data,
        timestamp: Date.now()
      }
      
      // Store the result in sessionStorage for immediate use
      sessionStorage.setItem('pcBuildResult', JSON.stringify(buildWithTimestamp))
      
      // Also save to localStorage for previous builds
      const previousBuilds = JSON.parse(localStorage.getItem('previousBuilds') || '[]')
      previousBuilds.push(buildWithTimestamp)
      // Keep only last 10 builds
      if (previousBuilds.length > 10) {
        previousBuilds.shift()
      }
      localStorage.setItem('previousBuilds', JSON.stringify(previousBuilds))
      
      console.log('Data stored in sessionStorage and localStorage')
      router.push('/build-result')
      console.log('Navigating to results page')
      
    } catch (error) {
      console.error('Error:', error)
      if (error.name === 'AbortError') {
        alert('Request timed out. Please try again.')
      } else {
        alert('Failed to generate PC build. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">PC Builder AI</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-slate-300 hover:text-white">Home</a>
              <a href="/ask-ai" className="text-slate-300 hover:text-white">Ask AI</a>
              <a href="/blog" className="text-slate-300 hover:text-white">Blog</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Build Your Perfect PC with{' '}
            <span className="text-blue-400">AI</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Get personalized PC build recommendations based on your budget and use case. 
            Our AI analyzes compatibility, performance, and value to suggest the best components.
          </p>
        </div>

        {/* Build Form */}
        <div className="max-w-2xl mx-auto bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-slate-200 mb-2">
                Budget ({currency})
              </label>
              <div className="flex space-x-4">
                <input
                  type="number"
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Enter your budget"
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400"
                  required
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="USD">USD</option>
                  <option value="SGD">SGD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="useCase" className="block text-sm font-medium text-slate-200 mb-2">
                What will you use this PC for?
              </label>
              <select
                id="useCase"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                required
              >
                <option value="">Select your use case</option>
                {useCaseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="additional" className="block text-sm font-medium text-slate-200 mb-2">
                Additional Requirements (Optional)
              </label>
              <textarea
                id="additional"
                value={additionalRequirements}
                onChange={(e) => setAdditionalRequirements(e.target.value)}
                placeholder="Any specific requirements, preferences, or constraints..."
                rows="3"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-300 font-medium text-lg transform hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Generating Your Build...
                </div>
              ) : (
                'Generate PC Build'
              )}
            </button>
          </form>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-900 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Recommendations</h3>
            <p className="text-slate-300">Advanced AI analyzes your needs and suggests optimal components</p>
          </div>

          <div className="text-center">
            <div className="bg-green-900 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Compatibility Guaranteed</h3>
            <p className="text-slate-300">All components are checked for compatibility and performance</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-900 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Best Value</h3>
            <p className="text-slate-300">Optimized for performance per dollar within your budget</p>
          </div>
        </div>
      </main>
    </div>
  )
}