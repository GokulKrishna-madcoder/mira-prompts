import Link from 'next/link'
import { ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in fade-in zoom-in-95 duration-700">
      
      {/* Massive Minimalist Header */}
      <h1 className="text-[120px] md:text-[180px] font-black text-black leading-none tracking-tighter mb-4 select-none">
        404
      </h1>
      
      {/* Subtle Subtitle */}
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
        Page not found
      </h2>
      <p className="text-gray-500 max-w-md mx-auto mb-12 leading-relaxed">
        The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
      </p>

      {/* Sleek Call to Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link 
          href="/" 
          className="group flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Return Home
        </Link>
        <Link 
          href="/explore" 
          className="group flex items-center justify-center gap-2 bg-white text-black border border-gray-200 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all shadow-sm w-full sm:w-auto"
        >
          <Compass className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Explore Prompts
        </Link>
      </div>
      
    </div>
  )
}
