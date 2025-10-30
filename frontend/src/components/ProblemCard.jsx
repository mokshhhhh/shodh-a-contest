import React from 'react'

export default function ProblemCard({ problem, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-colors ${
        active ? 'bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{problem.name}</h3>
        {active && <span className="text-xs text-blue-600">Active</span>}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{problem.description}</p>
    </button>
  )
}




