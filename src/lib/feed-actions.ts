'use server'

import { createClient } from '@/lib/supabase/server'
import type { PromptCard } from '@/types/prompt'

// ponytail: one config type, one action, zero abstractions
export type FeedConfig = {
  feedType: 'latest' | 'popular' | 'trending' | 'search'
  category?: string       // category slug (for home tabs)
  categoryId?: string     // exact category uuid (for /categories/[slug])
  tagSlug?: string        // tag slug (for /tags/[slug])
  searchQuery?: string
}

export type FeedCursor = {
  id: string
  sortValue: number | string  // created_at ISO string or view_count number
  offset?: number             // only used for search/trending (no keyset possible)
}

export type FeedResult = {
  prompts: PromptCard[]
  nextCursor: FeedCursor | null
  hasMore: boolean
}

const BATCH = 50
const PROMPT_SELECT = 'id, title, slug, image_url, view_count, copy_count, is_premium, has_variants, variants, category:categories(slug)'

export async function fetchFeedBatch(config: FeedConfig, cursor: FeedCursor | null): Promise<FeedResult> {
  const supabase = await createClient()

  // ── TRENDING ──
  if (config.feedType === 'trending') {
    const offset = cursor?.offset ?? 0
    const { data: scores } = await supabase
      .from('prompt_trending_scores')
      .select('prompt_id, score')
      .eq('window_size', 'week')
      .order('score', { ascending: false })
      .range(offset, offset + BATCH - 1)

    if (!scores || scores.length === 0) return { prompts: [], nextCursor: null, hasMore: false }

    const ids = scores.map(t => t.prompt_id)
    const { data: prompts } = await supabase
      .from('prompts')
      .select(PROMPT_SELECT)
      .eq('status', 'published')
      .in('id', ids)

    if (!prompts) return { prompts: [], nextCursor: null, hasMore: false }

    const scoreMap = new Map(scores.map(t => [t.prompt_id, t.score]))
    const promptMap = new Map(prompts.map(p => [p.id, p]))
    const ordered = scores
      .map(t => {
        const p = promptMap.get(t.prompt_id)
        if (!p) return null
        return { ...p, trending_score: scoreMap.get(t.prompt_id) || 0 } as PromptCard
      })
      .filter(Boolean) as PromptCard[]

    const hasMore = scores.length === BATCH
    return {
      prompts: ordered,
      nextCursor: hasMore ? { id: '', sortValue: 0, offset: offset + BATCH } : null,
      hasMore,
    }
  }

  // ── SEARCH ──
  if (config.feedType === 'search' && config.searchQuery) {
    const offset = cursor?.offset ?? 0
    const { data: matchedIds } = await supabase.rpc('search_prompt_ids', { search_term: config.searchQuery })
    const allIds = matchedIds?.map((m: any) => m.prompt_id) || []

    // ponytail: slice the matched IDs for pagination instead of re-querying
    const pageIds = allIds.slice(offset, offset + BATCH)
    if (pageIds.length === 0) return { prompts: [], nextCursor: null, hasMore: false }

    const { data } = await supabase
      .from('prompts')
      .select(PROMPT_SELECT)
      .eq('status', 'published')
      .in('id', pageIds)

    const prompts = (data as PromptCard[]) || []
    const hasMore = offset + BATCH < allIds.length
    return {
      prompts,
      nextCursor: hasMore ? { id: '', sortValue: 0, offset: offset + BATCH } : null,
      hasMore,
    }
  }

  // ── LATEST / POPULAR (keyset pagination) ──
  const sortField = config.feedType === 'popular' ? 'view_count' : 'created_at'

  let query = supabase
    .from('prompts')
    .select(PROMPT_SELECT)
    .eq('status', 'published')
    .order(sortField, { ascending: false })
    .order('id', { ascending: false }) // tiebreaker
    .limit(BATCH)

  // Category filter (slug from home tabs)
  if (config.category) {
    query = query.eq('categories.slug', config.category)
  }

  // Category filter (exact id from /categories/[slug])
  if (config.categoryId) {
    query = query.eq('category_id', config.categoryId)
  }

  // Tag filter: fetch prompt IDs first, then filter (ponytail: simplest approach)
  if (config.tagSlug) {
    const { data: tagRow } = await supabase.from('tags').select('id').eq('slug', config.tagSlug).single()
    if (!tagRow) return { prompts: [], nextCursor: null, hasMore: false }
    const { data: tagLinks } = await supabase.from('prompt_tags').select('prompt_id').eq('tag_id', tagRow.id)
    const tagIds = tagLinks?.map(t => t.prompt_id) || []
    if (tagIds.length === 0) return { prompts: [], nextCursor: null, hasMore: false }
    query = query.in('id', tagIds)
  }

  // Keyset cursor filter
  if (cursor) {
    if (config.feedType === 'popular') {
      // view_count < cursorValue OR (view_count = cursorValue AND id < cursorId)
      query = query.or(`view_count.lt.${cursor.sortValue},and(view_count.eq.${cursor.sortValue},id.lt.${cursor.id})`)
    } else {
      // created_at < cursorValue OR (created_at = cursorValue AND id < cursorId)
      query = query.or(`created_at.lt.${cursor.sortValue},and(created_at.eq.${cursor.sortValue},id.lt.${cursor.id})`)
    }
  }

  const { data } = await query

  let prompts = (data as PromptCard[]) || []

  // Filter out null categories when a category filter is applied
  if (config.category) {
    prompts = prompts.filter(p => p.category !== null)
  }

  const hasMore = prompts.length === BATCH
  const last = prompts[prompts.length - 1]
  const nextCursor: FeedCursor | null = hasMore && last
    ? {
        id: last.id,
        sortValue: config.feedType === 'popular' ? (last.view_count ?? 0) : (last as any).created_at,
      }
    : null

  return { prompts, nextCursor, hasMore }
}
