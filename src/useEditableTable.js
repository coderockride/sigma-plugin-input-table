import { useState, useCallback } from 'react'

/**
 * Core state management for the editable table.
 * Keeps allRows (master data) and opLog (pending operations) separate,
 * mirroring the writeback pattern: insert / update / delete.
 */
export function useEditableTable(initialRows = []) {
  const [rows, setRows]   = useState(initialRows)   // master data
  const [opLog, setOpLog] = useState([])             // [{op, origIndex, key, row, changes}]

  // ─── helpers ────────────────────────────────────────────────────────────
  const getEntry = (log, origIndex) => log.find(e => e.origIndex === origIndex)

  const currentVal = useCallback((origIndex, colId) => {
    const entry = opLog.find(e => e.origIndex === origIndex)
    if (entry?.changes && colId in entry.changes) return entry.changes[colId]
    if (entry?.row) return entry.row[colId] ?? null
    return rows[origIndex]?.[colId] ?? null
  }, [rows, opLog])

  // ─── cell edit ──────────────────────────────────────────────────────────
  const commitEdit = useCallback((origIndex, colId, newVal, keyCol) => {
    setOpLog(prev => {
      const next = [...prev]

      // If this is an inserted row, mutate it in place
      const insertIdx = next.findIndex(e => e.origIndex === origIndex && e.op === 'insert')
      if (insertIdx !== -1) {
        next[insertIdx] = {
          ...next[insertIdx],
          row: { ...next[insertIdx].row, [colId]: newVal },
          changes: { ...next[insertIdx].changes, [colId]: newVal },
        }
        setRows(r => r.map((row, i) => i === origIndex ? { ...row, [colId]: newVal } : row))
        return next
      }

      // Otherwise record an update
      const updateIdx = next.findIndex(e => e.origIndex === origIndex && e.op === 'update')
      if (updateIdx !== -1) {
        next[updateIdx] = {
          ...next[updateIdx],
          changes: { ...next[updateIdx].changes, [colId]: newVal },
          row: { ...next[updateIdx].row, [colId]: newVal },
        }
      } else {
        const origRow = rows[origIndex] || {}
        next.push({
          op: 'update',
          origIndex,
          key: keyCol ? origRow[keyCol] : origIndex,
          row: { ...origRow, [colId]: newVal },
          changes: { [colId]: newVal },
        })
      }
      return next
    })
  }, [rows])

  // ─── add row ────────────────────────────────────────────────────────────
  const addRow = useCallback((columns, keyCol) => {
    const newRow = {}
    columns.forEach(c => { newRow[c.id] = null })
    const tempKey = `__new_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    if (keyCol) newRow[keyCol] = tempKey

    setRows(prev => {
      const newIndex = prev.length
      setOpLog(log => [...log, {
        op: 'insert',
        origIndex: newIndex,
        key: tempKey,
        row: { ...newRow },
        changes: {},
      }])
      return [...prev, newRow]
    })
  }, [])

  // ─── delete row ─────────────────────────────────────────────────────────
  const deleteRow = useCallback((origIndex, keyCol) => {
    setOpLog(prev => {
      const next = [...prev]

      // Cancelling an insert: remove from opLog AND allRows
      const insertIdx = next.findIndex(e => e.origIndex === origIndex && e.op === 'insert')
      if (insertIdx !== -1) {
        next.splice(insertIdx, 1)
        // Re-index entries that follow
        for (let i = 0; i < next.length; i++) {
          if (next[i].origIndex > origIndex) next[i] = { ...next[i], origIndex: next[i].origIndex - 1 }
        }
        setRows(r => r.filter((_, i) => i !== origIndex))
        return next
      }

      // Remove any pending update first
      const updateIdx = next.findIndex(e => e.origIndex === origIndex && e.op === 'update')
      if (updateIdx !== -1) next.splice(updateIdx, 1)

      // Add a delete if not already present
      if (!next.find(e => e.origIndex === origIndex && e.op === 'delete')) {
        const origRow = rows[origIndex] || {}
        next.push({
          op: 'delete',
          origIndex,
          key: keyCol ? origRow[keyCol] : origIndex,
          row: { ...origRow },
          changes: {},
        })
      }
      return next
    })
  }, [rows])

  // ─── restore row ────────────────────────────────────────────────────────
  const restoreRow = useCallback((origIndex) => {
    setOpLog(prev => prev.filter(e => !(e.origIndex === origIndex && e.op === 'delete')))
  }, [])

  // ─── commit (after writeback) ────────────────────────────────────────────
  const commitWriteback = useCallback(() => {
    const toDelete = new Set(opLog.filter(e => e.op === 'delete').map(e => e.origIndex))
    setRows(prev => prev.filter((_, i) => !toDelete.has(i)))
    setOpLog([])
  }, [opLog])

  // ─── discard ────────────────────────────────────────────────────────────
  const discard = useCallback(() => {
    setRows(prev => prev.filter(r => !r.__inserted))
    setOpLog([])
  }, [])

  return {
    rows,
    setRows,
    opLog,
    currentVal,
    commitEdit,
    addRow,
    deleteRow,
    restoreRow,
    commitWriteback,
    discard,
  }
}
