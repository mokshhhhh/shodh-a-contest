import React from 'react'

export default function Editor({ value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Code Editor</label>
      <textarea className="textarea" spellCheck={false} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}




