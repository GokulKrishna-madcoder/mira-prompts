import Link from 'next/link'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Privacy Policy - Mira Prompts',
  description: 'Learn how Mira Prompts collects, uses, and protects your personal information.',
}

const sections = [
  { id: 'info-collect', title: '1. Information we collect' },
  { id: 'how-use', title: '2. How we use your information' },
  { id: 'sharing', title: '3. Sharing your information' },
  { id: 'cookies', title: '4. Cookies & tracking' },
  { id: 'data-retention', title: '5. Data retention' },
  { id: 'your-rights', title: '6. Your rights' },
  { id: 'children', title: '7. Children\'s privacy' },
  { id: 'changes', title: '8. Changes to this policy' },
  { id: 'contact', title: '9. Contact us' },
]

export default function PrivacyPage() {
  return (
    <>
    <main className="w-full max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight">Privacy Policy</h1>
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
          <section id="info-collect">
            <h2 className="text-2xl font-bold text-black mb-4">1. Information we collect</h2>
            <p>When you create an account on Mira Prompts, we collect your email address and display name through our authentication provider (Supabase Auth). When you use our service, we automatically collect usage data such as which prompts you view, copy, and save.</p>
            <p className="mt-4">We do not collect sensitive personal data, payment information, or location data beyond what is standard in HTTP request headers.</p>
          </section>

          <section id="how-use">
            <h2 className="text-2xl font-bold text-black mb-4">2. How we use your information</h2>
            <p>We use the information we collect to:</p>
            <ul className="mt-4 space-y-2 list-disc list-inside text-gray-600">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your experience (e.g., saved prompts)</li>
              <li>Track anonymous usage metrics like view and copy counts</li>
              <li>Communicate with you about service updates</li>
            </ul>
          </section>

          <section id="sharing">
            <h2 className="text-2xl font-bold text-black mb-4">3. Sharing your information</h2>
            <p>We do not sell, rent, or share your personal information with third parties for their marketing purposes. We may share data with service providers (e.g., Supabase for hosting and authentication) strictly to operate our platform.</p>
          </section>

          <section id="cookies">
            <h2 className="text-2xl font-bold text-black mb-4">4. Cookies & tracking</h2>
            <p>We use essential cookies to maintain your authentication session. We do not use third-party advertising trackers. Anonymous usage analytics may be collected to understand how our service is used and to improve the experience.</p>
          </section>

          <section id="data-retention">
            <h2 className="text-2xl font-bold text-black mb-4">5. Data retention</h2>
            <p>We retain your account data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days. Anonymous, aggregated usage data (e.g., prompt view counts) may be retained indefinitely.</p>
          </section>

          <section id="your-rights">
            <h2 className="text-2xl font-bold text-black mb-4">6. Your rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. You can do this through your account settings or by contacting us directly. If you are in the EU/EEA, you also have the right to data portability and to lodge a complaint with a supervisory authority.</p>
          </section>

          <section id="children">
            <h2 className="text-2xl font-bold text-black mb-4">7. Children&apos;s privacy</h2>
            <p>Mira Prompts is not intended for children under the age of 13. We do not knowingly collect personal information from children. If we learn that we have collected data from a child, we will promptly delete that information.</p>
          </section>

          <section id="changes">
            <h2 className="text-2xl font-bold text-black mb-4">8. Changes to this policy</h2>
            <p>We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. We encourage you to review this page periodically.</p>
          </section>

          <section id="contact">
            <h2 className="text-2xl font-bold text-black mb-4">9. Contact us</h2>
            <p>If you have any questions about this Privacy Policy, please reach out to us via our <Link href="https://www.instagram.com/mira.promptz" className="text-black font-semibold underline underline-offset-4 hover:text-gray-600 transition-colors" target="_blank">Instagram page</Link>.</p>
          </section>
        </article>
      </div>
    </main>
    <Footer />
    </>
  )
}
