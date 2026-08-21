'use client'

import { Check } from 'lucide-react'

const features = [
  'Unlock exact prompt text',
  'Copy with one click',
  'View AI model & aspect ratio',
  'Save prompts to collections',
  'Priority email support'
]

export default function PricingCards() {
  const handleSubscribe = (tier: string) => {
    alert('Premium plans are launching soon! 🚀\n\nEnjoy all prompts for free during our Beta phase.')
  }

  return (
    <>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Monthly Plan */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col hover:shadow-lg transition-shadow">
          <h3 className="text-2xl font-bold text-black mb-2">Monthly</h3>
          <p className="text-gray-500 text-sm mb-6 h-10">Perfect for trying out Mira Prompts on a short-term basis.</p>
          <div className="mb-6">
            <span className="text-5xl font-black text-black">₹99</span>
            <span className="text-gray-500 font-medium">/mo</span>
          </div>
          <button 
            onClick={() => handleSubscribe('monthly')}
            className="w-full py-4 px-6 rounded-full font-bold text-sm bg-gray-100 text-black hover:bg-gray-200 transition-colors mb-8 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            Subscribe Monthly
          </button>
          <div className="space-y-4 flex-1">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-black shrink-0" />
                <span className="text-sm font-medium text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Yearly Plan (Popular) */}
        <div className="bg-black rounded-3xl p-8 border border-black shadow-xl flex flex-col relative transform md:-translate-y-4">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-sm">
            Most Popular
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Yearly</h3>
          <p className="text-gray-400 text-sm mb-6 h-10">Save ~15% vs monthly. Best value for active creators.</p>
          <div className="mb-6">
            <span className="text-5xl font-black text-white">₹999</span>
            <span className="text-gray-400 font-medium">/yr</span>
          </div>
          <button 
            onClick={() => handleSubscribe('yearly')}
            className="w-full py-4 px-6 rounded-full font-bold text-sm bg-white text-black hover:bg-gray-100 transition-colors mb-8 shadow-sm flex justify-center items-center gap-2"
          >
            Subscribe Yearly
          </button>
          <div className="space-y-4 flex-1">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-white shrink-0" />
                <span className="text-sm font-medium text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lifetime Plan */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col hover:shadow-lg transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200 to-amber-500 opacity-20 rounded-bl-full" />
          <h3 className="text-2xl font-bold text-black mb-2 flex items-center gap-2">
            Lifetime <span className="text-xl">👑</span>
          </h3>
          <p className="text-gray-500 text-sm mb-6 h-10">One-time payment. Never pay again. Perpetual access.</p>
          <div className="mb-6">
            <span className="text-5xl font-black text-black">₹2999</span>
          </div>
          <button 
            onClick={() => handleSubscribe('lifetime')}
            className="w-full py-4 px-6 rounded-full font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 transition-colors mb-8 shadow-sm flex justify-center items-center gap-2"
          >
            Get Lifetime Access
          </button>
          <div className="space-y-4 flex-1">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-black shrink-0" />
                <span className="text-sm font-medium text-gray-700">{feature}</span>
              </div>
            ))}
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-sm font-bold text-amber-600">No recurring billing</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
