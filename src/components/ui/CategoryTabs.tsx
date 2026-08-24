'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function CategoryTabs({ categories }: { categories: { id: string; name: string; slug: string }[] }) {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar scrollbar-hide items-center w-full pr-4">
      <Link
          href="/"
          className={`shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            !activeCategory 
              ? 'bg-black text-white' 
              : 'bg-transparent text-gray-800 hover:bg-gray-100'
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/?category=${cat.slug}`}
            className={`shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
              activeCategory === cat.slug 
                ? 'bg-black text-white' 
                : 'bg-transparent text-gray-800 hover:bg-gray-100'
            }`}
          >
            {cat.name}
          </Link>
        ))}
    </div>
  )
}
