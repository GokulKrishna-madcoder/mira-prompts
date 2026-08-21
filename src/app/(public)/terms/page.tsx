import Link from 'next/link'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Terms of Service - Mira Prompts',
  description: 'Read the Terms of Service for using Mira Prompts.',
}

const sections = [
  { id: 'acceptance', title: '1. Acceptance of terms' },
  { id: 'use-service', title: '2. Use of the service' },
  { id: 'accounts', title: '3. User accounts' },
  { id: 'content', title: '4. Content & prompts' },
  { id: 'intellectual-property', title: '5. Intellectual property' },
  { id: 'prohibited', title: '6. Prohibited conduct' },
  { id: 'termination', title: '7. Termination' },
  { id: 'disclaimers', title: '8. Disclaimers' },
  { id: 'limitation', title: '9. Limitation of liability' },
  { id: 'changes', title: '10. Changes to terms' },
  { id: 'contact', title: '11. Contact us' },
]

export default function TermsPage() {
  return (
    <>
    <main className="w-full max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight">Terms of Service</h1>
        <p className="mt-3 text-gray-400 text-sm font-medium">Last updated: August 2026</p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 md:gap-20">
        {/* Sticky Sidebar */}
        <nav className="md:w-64 shrink-0">
          <div className="md:sticky md:top-8 flex flex-col gap-1">
            {sections.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
              >
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Content */}
        <article className="flex-1 max-w-3xl space-y-16 text-gray-700 text-lg leading-relaxed">
          <section id="acceptance">
            <h2 className="text-2xl font-bold text-black mb-4">1. Acceptance of terms</h2>
            <p>By accessing or using Mira Prompts, you agree to be bound by these Terms of Service and our <Link href="/privacy" className="text-black font-semibold underline underline-offset-4 hover:text-gray-600 transition-colors">Privacy Policy</Link>. If you do not agree to these terms, please do not use our service.</p>
          </section>

          <section id="use-service">
            <h2 className="text-2xl font-bold text-black mb-4">2. Use of the service</h2>
            <p>Mira Prompts provides a curated library of AI image generation prompts. You may browse, save, and copy prompts for your personal and commercial creative projects. The service is provided &quot;as is&quot; and we reserve the right to modify or discontinue any feature at any time.</p>
          </section>

          <section id="accounts">
            <h2 className="text-2xl font-bold text-black mb-4">3. User accounts</h2>
            <p>To access certain features (saving prompts, personalized experience), you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
            <p className="mt-4">You agree to provide accurate information during registration and to keep your account information up to date.</p>
          </section>

          <section id="content">
            <h2 className="text-2xl font-bold text-black mb-4">4. Content & prompts</h2>
            <p>Prompts displayed on Mira Prompts are curated by our team. The AI-generated images shown alongside prompts are for illustrative purposes and were created using the displayed prompt text. You are free to use copied prompts in any AI image generation tool of your choice.</p>
            <p className="mt-4">We do not guarantee that any prompt will produce identical results across different AI models or versions.</p>
          </section>

          <section id="intellectual-property">
            <h2 className="text-2xl font-bold text-black mb-4">5. Intellectual property</h2>
            <p>The Mira Prompts name, logo, website design, and overall curation are the intellectual property of Mira Prompts. Individual prompt texts are provided for your free use. The AI-generated images displayed on our platform are used for demonstration purposes only.</p>
          </section>

          <section id="prohibited">
            <h2 className="text-2xl font-bold text-black mb-4">6. Prohibited conduct</h2>
            <p>You agree not to:</p>
            <ul className="mt-4 space-y-2 list-disc list-inside text-gray-600">
              <li>Use automated tools to scrape or bulk-download content</li>
              <li>Attempt to reverse engineer or compromise the platform</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Use the service to generate illegal, harmful, or deceptive content</li>
              <li>Redistribute our curated collections as a competing service</li>
            </ul>
          </section>

          <section id="termination">
            <h2 className="text-2xl font-bold text-black mb-4">7. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at our sole discretion if you violate these terms. You may delete your account at any time through your account settings.</p>
          </section>

          <section id="disclaimers">
            <h2 className="text-2xl font-bold text-black mb-4">8. Disclaimers</h2>
            <p>Mira Prompts is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, secure, or error-free.</p>
          </section>

          <section id="limitation">
            <h2 className="text-2xl font-bold text-black mb-4">9. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, Mira Prompts shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
          </section>

          <section id="changes">
            <h2 className="text-2xl font-bold text-black mb-4">10. Changes to terms</h2>
            <p>We may update these Terms of Service from time to time. When we do, we will revise the &quot;Last updated&quot; date at the top. Continued use of the service after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section id="contact">
            <h2 className="text-2xl font-bold text-black mb-4">11. Contact us</h2>
            <p>If you have any questions about these Terms, please reach out to us via our <Link href="https://www.instagram.com/mira.promptz" className="text-black font-semibold underline underline-offset-4 hover:text-gray-600 transition-colors" target="_blank">Instagram page</Link>.</p>
          </section>
        </article>
      </div>
    </main>
    <Footer />
    </>
  )
}
