/**
 * Builds the writeback payload array from the opLog.
 * Each row gets __op (insert|update|delete) and __key (primary key value),
 * plus all mapped field values under their target names.
 *
 * @param {Array}  opLog     - pending operations
 * @param {Array}  rows      - master data array
 * @param {Array}  columns   - [{id, name, type}]
 * @param {Object} wbMapping - {colId: targetFieldName}
 * @returns {Array} writeback payload rows
 */
export function buildPayload(opLog, rows, columns, wbMapping) {
  return opLog.map(entry => {
    const out = { __op: entry.op, __key: entry.key }

    // Resolve the most up-to-date version of the row
    const sourceRow =
      entry.op === 'delete'
        ? entry.row
        : { ...(rows[entry.origIndex] || {}), ...(entry.changes || {}) }

    columns.forEach(col => {
      const targetField = wbMapping[col.id]
      if (targetField) out[targetField] = sourceRow[col.id] ?? null
    })

    return out
  })
}

/**
 * Syntax-highlights a JSON string as HTML spans.
 */
export function syntaxHighlight(json) {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      m => {
        if (/^"/.test(m)) {
          return /:$/.test(m)
            ? `<span style="color:#7dd3fc">${m}</span>`
            : `<span style="color:#86efac">${m}</span>`
        }
        if (/true|false/.test(m)) return `<span style="color:#c084fc">${m}</span>`
        if (/null/.test(m))       return `<span style="color:#7880a4">${m}</span>`
        return `<span style="color:#fca5a5">${m}</span>`
      }
    )
}
