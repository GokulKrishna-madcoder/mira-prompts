# Implementation Plan: Admin Full Submission Details

## Goal
Admins currently only see the main image, title, and a truncated prompt text in the `admin/submissions` queue. We need to expose all submitted details (variants, tags, category, AI tool, aspect ratio, style, and the full prompt) so the admin can review the entire submission before approving or rejecting it.

## Proposed Changes

### 1. Update the Data Fetching Query
In `src/app/admin/submissions/page.tsx`, expand the `.select()` query to pull all relevant fields.
**[MODIFY] `src/app/admin/submissions/page.tsx`**
```typescript
.select(`
  id, title, slug, image_url, prompt, status, created_at, created_by, variant_type, variants,
  model, aspect_ratio, style, source_name, source_url,
  profiles:created_by(display_name, username),
  category:category_id(name),
  tags:prompt_tags(tag:tags(name))
`)
```

### 2. UI: Native Expandable Details (Ponytail Approach)
Instead of building a heavy React modal with state, we will leverage the native HTML `<details>` and `<summary>` elements to create a sleek, zero-JS accordion for each submission card.

**[MODIFY] `src/app/admin/submissions/page.tsx`**
Inside the submission card `div`, we will add:
1. **Full Prompt Text**: Displayed in full within the expanded view.
2. **Metadata Grid**: A small grid showing Category, AI Tool, Model, Style, Aspect Ratio, and Tags.
3. **Variants Grid**: If `p.has_variants` or `p.variants` exists, we will map over `p.variants` and display a grid of the variant images and their specific prompt texts (e.g., Male/Female variants or Creative Ads).
4. **Summary Toggle**: A `<summary>` tag styled as a "View full details" button.

### 3. Layout Restructuring
- The initial view remains the same: Image, Title, truncated prompt, and Approve/Reject buttons.
- Below the initial info, a `<details className="group">` block will house the expanded content.
- When clicked, it smoothly reveals the metadata chips, full prompt blocks, and variant images, allowing the admin to thoroughly audit the submission before hitting Approve.

## User Review Required
Are you happy with an inline accordion (a "View Details" dropdown arrow inside the card itself) or would you prefer a pop-up Modal overlay? The inline accordion is much faster to build, requires no client-side state, and keeps the admin page entirely Server-Side Rendered.
