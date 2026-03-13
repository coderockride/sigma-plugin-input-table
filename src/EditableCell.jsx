import { useState, useRef } from 'react'

const NULL_STYLE = { color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '12px' }

export function EditableCell({ value, type, disabled, onCommit }) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState('')
  const inputRef = useRef(null)

  const startEdit = () => {
    if (disabled) return
    setDraft(value ?? '')
    setEditing(true)
    setTimeout(() => { inputRef.current?.select() }, 0)
  }

  const commit = () => {
    setEditing(false)
    const newVal = draft === '' ? null : draft
    const changed = String(newVal ?? '') !== String(value ?? '')
    if (changed) onCommit(newVal)
  }

  const handleKey = e => {
    if (e.key === 'Enter')  { e.preventDefault(); commit() }
    if (e.key === 'Escape') { setEditing(false) }
  }

  const displayText = (value === null || value === undefined || value === '')
    ? <span style={NULL_STYLE}>null</span>
    : String(value)

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        value={draft}
        type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        style={{
          width: '100%',
          background: 'var(--edit-bg, #1e2236)',
          border: '2px solid var(--accent)',
          borderRadius: '3px',
          color: 'var(--text)',
          fontSize: '13px',
          padding: '5px 11px',
          fontFamily: 'inherit',
          outline: 'none',
          minHeight: '32px',
        }}
      />
    )
  }

  return (
    <div
      onClick={startEdit}
      style={{
        padding: '6px 12px',
        minHeight: '32px',
        cursor: disabled ? 'default' : 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        border: '2px solid transparent',
        borderRadius: '3px',
        fontSize: '13px',
        transition: 'border-color 0.1s',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = 'var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent' }}
    >
      {displayText}
    </div>
  )
}
