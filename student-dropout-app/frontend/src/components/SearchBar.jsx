import { useState } from 'react'

/**
 * SearchBar — controlled input that calls onSearch(query) on submit.
 * Props:
 *   onSearch {function} — called with the trimmed query string
 *   placeholder {string}
 *   loading {boolean}
 */
export default function SearchBar({ onSearch, placeholder = 'Search student by name…', loading }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (q) onSearch(q)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="relative flex-1">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          id="student-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="input-field pl-11"
        />
      </div>

      <button
        id="student-search-btn"
        type="submit"
        disabled={!query.trim() || loading}
        className="btn-primary min-w-[110px] flex items-center justify-center gap-2"
      >
        {loading ? (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <>🔍 Search</>
        )}
      </button>
    </form>
  )
}
