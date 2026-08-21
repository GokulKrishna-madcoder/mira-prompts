import { TrendingUp } from 'lucide-react'

export default function TrendingBadge({ score }: { score?: number }) {
  if (!score || score <= 0) return null

  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold rounded-full shadow-sm">
      <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
      Trending
    </div>
  )
}
