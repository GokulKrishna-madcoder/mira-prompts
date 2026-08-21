# Premium Prompts & Razorpay Subscription Architecture Plan

This document outlines the end-to-end architecture for introducing "Premium Prompts" and a "Prime" membership to Mira Prompts. Built for the Indian market and global scaling, the stack utilizes **Next.js App Router**, **Supabase** (Auth & Database), and **Razorpay** (Payment Gateway).

As a Security Advisor and Full Stack Architect, this plan prioritizes data scrubbing, webhook authenticity, and secure secret management.

## System Architecture Overview

To successfully monetize the platform while keeping the application secure, premium prompt data must *never* leak to the client unless the user has a cryptographically verified, active subscription via Razorpay.

---

### Phase 1: Database Schema & Supabase Updates

We need to track which prompts are premium and which users have active subscriptions securely.

1. **Update `prompts` Table:**
   - Add column: `is_premium` (Boolean, default: `false`).
2. **Update/Create `users` (or `profiles`) Table:**
   - Add column: `razorpay_customer_id` (String, unique).
   - Add column: `razorpay_subscription_id` (String, unique).
   - Add column: `subscription_status` (String: `active`, `halted`, `cancelled`, `none`, default: `none`).

> **Data Security (Row Level Security)**
> Since we want free users to *see* the premium prompt images and titles (for upselling), we cannot simply block the entire row using Supabase RLS. Instead, we will protect the actual `prompt_text` at the server level using Next.js Server Components.

---

### Phase 2: Secure Razorpay Integration

Razorpay requires a strict server-to-client-to-server handshake to prevent tampering.

1. **Plan Setup:**
   - Create a recurring "Mira Prime" Plan in the Razorpay Dashboard to get a `plan_id`.
2. **Secure Subscription Creation (Backend):**
   - Create a Next.js Server Action (`createRazorpaySubscription`).
   - Using the `RAZORPAY_KEY_SECRET` (never exposed to the frontend), the server creates a Subscription via the Razorpay API and returns the `subscription_id` to the client.
3. **Checkout Flow (Frontend):**
   - The frontend initializes the Razorpay Checkout modal using the returned `subscription_id` and the public `RAZORPAY_KEY_ID`.
   - The user enters payment details directly into Razorpay's secure iframe.
4. **Webhook Listener & Signature Verification (Critical Security Step):**
   - Create a secure API route at `/api/webhooks/razorpay`.
   - **Verification:** The backend *must* verify the `x-razorpay-signature` header using `crypto.createHmac('sha256', WEBHOOK_SECRET)` to ensure the payload actually came from Razorpay and wasn't spoofed by an attacker.
   - Listen for events: `subscription.charged`, `subscription.halted`, and `subscription.cancelled`.
   - Upon verified success, use the Supabase Admin SDK (bypassing RLS) to update the user's `subscription_status`.

---

### Phase 3: Backend Data Protection

We must strictly protect the payload. If a prompt is premium, a free user should never see the hidden prompt text in the network tab.

1. **Secure Fetching (`/prompts/[id]/page.tsx`):**
   - Fetch the prompt data and the current user's profile on the server.
   - **Logic Check:**
     ```javascript
     const isLocked = prompt.is_premium && userProfile.subscription_status !== 'active';
     
     // Scrub the data before sending to the Client UI. 
     // This guarantees the text never leaves the server for unauthorized users.
     const safePromptText = isLocked ? null : prompt.prompt_text;
     ```

---

### Phase 4: Frontend & UI Implementation

1. **Admin Panel (`/admin/prompts/new` & `edit`):**
   - Add a Toggle Switch: `[ ] Premium Prompt`.
   - When toggled, the inserted/updated prompt gets `is_premium: true`.
2. **Explore & Home Grids (`MasonryGrid`):**
   - If `prompt.is_premium` is true, render a sleek "👑 Prime" badge overlay on the top right of the image card.
3. **Prompt Detail Page (The Paywall):**
   - **For Subscribed Users:** Display the prompt text normally.
   - **For Free Users:** 
     - Show the beautiful AI image and the title.
     - Replace the `prompt_text` block with a blurred overlay.
     - Display a Call-to-Action box over the blur: *"Unlock this prompt and thousands more with Mira Prime."* -> `[ Subscribe with Razorpay ]` button.

---

### Phase 5: Security Audits & Rollout

1. **Environment Variables:** Ensure `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` are strictly locked down in Vercel/production environments.
2. **Webhook Idempotency:** Implement checks in the webhook handler to prevent double-crediting if Razorpay sends the same event twice (which happens occasionally in distributed systems).
3. **Test Mode:** Run the entire flow using Razorpay's test mode to simulate successful payments, failed cards, and subscription cancellations.
