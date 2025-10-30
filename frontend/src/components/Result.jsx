import React from 'react'

export default function Result({ result }) {
  if (!result) return null
  const { mode, data } = result

  if (data?.error) {
    return (
      <div className="card p-5">
        <h3 className="font-semibold mb-2">Result</h3>
        <p className="text-red-600">{data.error}</p>
      </div>
    )
  }

  if (mode === 'run') {
    return (
      <div className="card p-5">
        <h3 className="font-semibold mb-2">Run Output</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="md:col-span-2">
            <label className="text-xs uppercase text-gray-500">stdout</label>
            <pre className="mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-auto">{data.stdout || ''}</pre>
          </div>
          <div>
            <label className="text-xs uppercase text-gray-500">stderr</label>
            <pre className="mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-auto">{data.stderr || ''}</pre>
          </div>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">Exit: {String(data.exitCode)} · Time: {data.timeMs}ms {data.timeout ? '(timeout)' : ''}</div>
      </div>
    )
  }

  if (mode === 'submit') {
    const verdict = data.verdict || 'UNKNOWN'
    return (
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Submission</h3>
          <span className={`text-sm font-medium ${verdict === 'ACCEPTED' ? 'text-green-600' : 'text-red-600'}`}>{verdict}</span>
        </div>
        <div className="space-y-2">
          {(data.results || []).map(r => (
            <div key={r.index} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="font-medium">Test #{r.index + 1}</div>
                <div className={`text-sm ${r.passed ? 'text-green-600' : 'text-red-600'}`}>{r.passed ? 'Passed' : 'Failed'}</div>
              </div>
              {!r.passed && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 text-sm">
                  <div>
                    <div className="text-xs uppercase text-gray-500">Expected</div>
                    <pre className="mt-1 p-2 rounded bg-gray-100 dark:bg-gray-800 overflow-auto">{r.expected}</pre>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">stdout</div>
                    <pre className="mt-1 p-2 rounded bg-gray-100 dark:bg-gray-800 overflow-auto">{r.stdout}</pre>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">stderr</div>
                    <pre className="mt-1 p-2 rounded bg-gray-100 dark:bg-gray-800 overflow-auto">{r.stderr}</pre>
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">Exit: {String(r.exitCode)} · Time: {r.timeMs}ms {r.timeout ? '(timeout)' : ''}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}




