# Implementation Plan: Premium 404 Page Design

## Objective
The current Next.js default 404 page is a jarring, unstyled block of text that breaks the immersive, premium feel of Mira Prompts. We need a custom `not-found.tsx` page that perfectly aligns with the website's minimalist, high-end aesthetic (Taste skill).

## Design Philosophy (Taste & Breathing Space)
- **Extreme Minimalism:** No cluttered illustrations or goofy "oops" graphics. We will rely entirely on stunning typography and negative space.
- **Breathing Space:** The content will be perfectly dead-centered in a massive container (`min-h-[80vh]`) allowing the page to breathe freely without feeling cramped.
- **Typography:** A massive, tightly-kerned "404" header (`tracking-tighter`, `font-black`) paired with a sophisticated, low-contrast subtitle (`text-gray-500`).
- **Interaction:** A sleek, pill-shaped "Return to Home" button that uses the site's signature fluid scale animation (`hover:scale-105 transition-transform`).

## Technical Implementation

1. **Create the File:**
   I will create a new root-level file: `src/app/not-found.tsx`. In Next.js App Router, this automatically catches all unhandled routes.

2. **Component Structure:**
   ```tsx
   import Link from 'next/link'
   import { ArrowLeft } from 'lucide-react'

   export default function NotFound() {
     return (
       <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in fade-in zoom-in-95 duration-700">
         
         {/* Massive Minimalist Header */}
         <h1 className="text-[120px] md:text-[180px] font-black text-black leading-none tracking-tighter mb-4">
           404
         </h1>
         
         {/* Subtle Subtitle */}
         <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
           Page not found
         </h2>
         <p className="text-gray-500 max-w-md mx-auto mb-12 leading-relaxed">
           The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
         </p>

         {/* Sleek Call to Action */}
         <Link 
           href="/" 
           className="group flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl"
         >
           <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
           Return to Home
         </Link>
         
       </div>
     )
   }
   ```

3. **Routing:**
   Because this is placed in `src/app/not-found.tsx`, it will automatically inherit the global `TopBar` and `Footer` (if they are in the root layout), framing the 404 message perfectly within the site's chrome.

## Execution
Since this is a straightforward UI addition, I can build and commit this immediately. Let me know if you want me to execute this plan in "caveman ultra" mode!
