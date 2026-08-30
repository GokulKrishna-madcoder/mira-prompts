# Implementation Plan: Redesign Footer (Premium Reference)

## Objective
The current footer is a generic, light-themed standard web footer. We are going to redesign it based on the premium dark reference image provided, substituting the dark background for the brand's vibrant red (`bg-red-500`), and creating a massive, screen-spanning typography centerpiece.

## Design Alignment (Taste Skill)
- **Colors:** Deep Red Background (`bg-red-500` / `#ef4444`) with Pure White Text (`text-white`). 
- **Layout Structure (Top Half):**
  - **Left Side:** We will add a minimalist newsletter subscription input (email field + sleek pill button) and social icons exactly like the reference.
  - **Right Side:** Three clean columns of minimal white text links (`Quick Links`, `Company`, `Legal`).
- **Typography Centerpiece (Bottom Half):**
  - The massive word "mira prompts" spanning the full width of the footer.
  - We will use `text-[15vw]` (viewport width scaling) so it perfectly spans edge-to-edge on any screen size.
  - We'll use a bold, tightly kerned font (`font-black tracking-tighter leading-none`) to simulate the powerful, editorial "mira logo font style".

## Technical Implementation

**[MODIFY] `src/components/layout/Footer.tsx`**

1. **Wrapper & Colors:** 
   Change `<footer className="w-full border-t border-gray-200 bg-white">` to `<footer className="w-full bg-red-500 text-white overflow-hidden">`.

2. **Top Grid (Links & Newsletter):**
   ```tsx
   <div className="max-w-[1400px] mx-auto px-6 pt-20 pb-12">
     <div className="flex flex-col lg:flex-row justify-between gap-16">
       
       {/* Left: Newsletter & Socials */}
       <div className="lg:w-1/3 flex flex-col gap-6">
         <h3 className="font-bold text-lg">Stay Inspired</h3>
         <form className="flex w-full max-w-sm items-center gap-2">
           <input type="email" placeholder="email@gmail.com" className="flex-1 bg-transparent border border-white/30 text-white placeholder:text-white/50 px-4 py-3 rounded-full outline-none focus:border-white transition-colors" />
           <button type="button" className="bg-white text-red-500 px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
             Subscribe
           </button>
         </form>
         <div className="flex gap-4 mt-2">
            {/* Minimal White Social Icons (Instagram, Twitter, Mail) */}
         </div>
       </div>

       {/* Right: Links */}
       <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
         {/* Columns mapped here with white text and white/70 hover states */}
       </div>
       
     </div>
   </div>
   ```

3. **Massive Typography:**
   ```tsx
   <div className="w-full flex justify-center items-end px-4 pb-4">
     <h1 className="text-[14vw] font-black tracking-tighter leading-[0.8] text-white opacity-95 select-none text-center w-full">
       mira prompts
     </h1>
   </div>
   ```

## Execution
Since this is a straightforward visual redesign, I can rebuild the `Footer.tsx` component right now. This will completely transform the bottom of your website into a striking, premium brand statement. Let me know if I should execute this!
