import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import PricingCards from '@/components/pricing/PricingCards'

export const metadata = {
  title: 'Pricing - Mira Prompts',
  description: 'Unlock the exact prompt used to generate thousands of AI images.',
}

export default function PricingPage() {
  return (
    <>
    <main className="w-full max-w-7xl mx-auto px-6 py-20 min-h-screen">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-black tracking-tight mb-6">
          Unlock the world&apos;s best AI prompts
        </h1>
        <p className="text-lg md:text-xl text-gray-500 font-medium">
          Stop guessing how perfect AI art is made. Get the exact formulas behind thousands of stunning images and master prompt engineering today.
        </p>
      </div>

      <PricingCards />

      <div className="mt-20 text-center text-gray-500 text-sm max-w-2xl mx-auto">
        <p>Payments are securely processed by Razorpay. By subscribing, you agree to our <Link href="/terms" className="underline hover:text-black">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-black">Privacy Policy</Link>.</p>
      </div>
    </main>
    <Footer />
    </>
  )
}
