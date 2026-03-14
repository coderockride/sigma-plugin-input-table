import { useState, useMemo } from 'react'
import {
  useEditorPanelConfig,
  useElementColumns,
  useElementData,
  useVariable,
  useActionTrigger,
} from '@sigmacomputing/plugin'

export default function App() {

  // ── Register inputs in Sigma's element panel ─────────────────────────
  useEditorPanelConfig([
    { name: 'source',       type: 'element',        label: 'Data Source'                         },
    { name: 'insertValue',  type: 'variable',        label: 'Insert Value Variable'               },
    { name: 'insertAction', type: 'action-trigger',  label: 'Insert Row Action'                   },
  ])

  // ── Sigma data hooks ──────────────────────────────────────────────────
  const sigmaColumns = useElementColumns('source')
  const sigmaData    = useElementData('source')

  // Variable that the plugin controls — wire this to your Input Table column
  const [insertVar, setInsertVar] = useVariable('insertValue')

  // Action trigger — wire this to the Input Table's "Insert row" action
  const triggerInsert = useActionTrigger('insertAction')

  // ── Derive connection state + rows ───────────────────────────────────
  const isConnected = sigmaColumns && Object.keys(sigmaColumns).length > 0

  const { columns, rows } = useMemo(() => {
    if (!isConnected) return { columns: [], rows: [] }
    const cols = Object.values(sigmaColumns).map(c => ({ id: c.id, name: c.name }))
    const len  = sigmaData ? (sigmaData[cols[0]?.id]?.length || 0) : 0
    const rowArr = Array.from({ length: len }, (_, i) => {
      const row = {}
      cols.forEach(c => { row[c.id] = sigmaData[c.id]?.[i] ?? '' })
      return row
    })
    return { columns: cols, rows: rowArr }
  }, [isConnected, sigmaColumns, sigmaData])

  // ── Local state ───────────────────────────────────────────────────────
  const [inputValue, setInputValue] = useState('')
  const [log,        setLog]        = useState([])
  const [status,     setStatus]     = useState(null) // 'ok' | 'error' | null

  const handleInsert = () => {
    const val = inputValue.trim()
    if (!val) return

    try {
      // 1. Push value into the Sigma variable
      setInsertVar(val)
      // 2. Fire the action trigger — Sigma runs whatever action is wired to it
      triggerInsert()
      // 3. Log it locally so the user gets feedback
      setLog(prev => [{ val, ts: new Date().toLocaleTimeString() }, ...prev])
      setInputValue('')
      setStatus('ok')
      setTimeout(() => setStatus(null), 2000)
    } catch (e) {
      console.error('Insert failed:', e)
      setStatus('error')
      setTimeout(() => setStatus(null), 3000)
    }
  }

  // ── Styles ────────────────────────────────────────────────────────────
  const s = {
    shell: {
      height: '100vh', display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: '#0f1117', color: '#e8eaf2', overflow: 'hidden',
    },
    header: {
      padding: '11px 16px', background: '#1a1d27',
      borderBottom: '1px solid #2e3350',
      display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
    },
    headerTitle: { fontWeight: 700, fontSize: 14 },
    chip: (connected) => ({
      fontSize: 11, padding: '2px 8px', borderRadius: 20,
      background: connected ? 'rgba(62,207,142,.15)' : 'rgba(245,165,35,.15)',
      color: connected ? '#3ecf8e' : '#f5a623',
      fontFamily: 'monospace',
    }),
    body: { flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 },
    label: {
      fontSize: 11, fontWeight: 700, letterSpacing: '.08em',
      textTransform: 'uppercase', color: '#7880a4', marginBottom: 8,
    },
    inputRow: { display: 'flex', gap: 10, alignItems: 'center' },
    input: {
      flex: 1, padding: '8px 12px', background: '#22263a',
      border: '1px solid #2e3350', borderRadius: 6,
      color: '#e8eaf2', fontSize: 14, outline: 'none',
      transition: 'border-color .15s',
    },
    button: {
      padding: '8px 20px', background: '#5b6af5', color: '#fff',
      border: 'none', borderRadius: 6, fontSize: 14,
      fontWeight: 600, cursor: 'pointer', flexShrink: 0,
    },
    statusOk:    { fontSize: 12, color: '#3ecf8e' },
    statusError: { fontSize: 12, color: '#f5555d' },
    logItem: {
      padding: '6px 12px', background: 'rgba(62,207,142,.08)',
      border: '1px solid rgba(62,207,142,.2)', borderRadius: 6,
      fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
    },
    logDot: { width: 6, height: 6, borderRadius: '50%', background: '#3ecf8e', flexShrink: 0 },
    logTs: { marginLeft: 'auto', fontSize: 11, color: '#7880a4' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    th: {
      padding: '6px 10px', textAlign: 'left', background: '#22263a',
      borderBottom: '2px solid #2e3350', fontSize: 11,
      letterSpacing: '.06em', textTransform: 'uppercase', color: '#7880a4',
    },
    td: { padding: '6px 10px', borderBottom: '1px solid #2e3350' },
    callout: {
      padding: '12px 14px', background: '#22263a', borderRadius: 8,
      border: '1px solid #2e3350', fontSize: 12, color: '#7880a4', lineHeight: 1.7,
    },
    calloutTitle: { fontWeight: 700, color: '#e8eaf2', marginBottom: 6, fontSize: 13 },
    step: { display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 },
    stepNum: {
      width: 18, height: 18, borderRadius: '50%', background: '#5b6af5',
      color: '#fff', fontSize: 10, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
    },
    splash: {
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 8, color: '#7880a4', textAlign: 'center', padding: 40,
    },
  }

  return (
    <div style={s.shell}>

      {/* ── Header ── */}
      <div style={s.header}>
        <span style={s.headerTitle}>Sigma Input Table Plugin</span>
        <span style={s.chip(isConnected)}>
          {isConnected ? `✓ connected · ${rows.length} rows` : '⚠ no data source'}
        </span>
      </div>

      <div style={s.body}>

        {/* ── Insert input ── */}
        <div>
          <div style={s.label}>Insert value into Input Table</div>
          <div style={s.inputRow}>
            <input
              style={s.input}
              placeholder="Type a value…"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInsert()}
            />
            <button style={s.button} onClick={handleInsert}>Insert</button>
          </div>
          {status === 'ok'    && <div style={{...s.statusOk,    marginTop: 6}}>✓ Inserted</div>}
          {status === 'error' && <div style={{...s.statusError, marginTop: 6}}>✕ Insert failed — check wiring in element panel</div>}
        </div>

        {/* ── Wiring instructions ── */}
        <div style={s.callout}>
          <div style={s.calloutTitle}>How to wire this plugin to your Input Table</div>
          <div style={s.step}><span style={s.stepNum}>1</span><span>In the element panel → <strong>Insert Value Variable</strong>: create or select a Sigma text variable</span></div>
          <div style={s.step}><span style={s.stepNum}>2</span><span>In that variable's settings, set it as the default value for your Input Table's text column</span></div>
          <div style={s.step}><span style={s.stepNum}>3</span><span>In the element panel → <strong>Insert Row Action</strong>: wire to an action that inserts a row in the Input Table</span></div>
          <div style={s.step}><span style={s.stepNum}>4</span><span>Type a value above and click <strong>Insert</strong> — the plugin sets the variable then fires the action</span></div>
        </div>

        {/* ── Insert log ── */}
        {log.length > 0 && (
          <div>
            <div style={s.label}>Inserted this session ({log.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {log.map((entry, i) => (
                <div key={i} style={s.logItem}>
                  <span style={s.logDot} />
                  <span>{entry.val}</span>
                  <span style={s.logTs}>{entry.ts}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Source data preview ── */}
        {isConnected && rows.length > 0 ? (
          <div>
            <div style={s.label}>Source data ({rows.length} rows)</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>{columns.map(c => <th key={c.id} style={s.th}>{c.name}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.slice(0, 50).map((row, i) => (
                    <tr key={i}>
                      {columns.map(c => <td key={c.id} style={s.td}>{String(row[c.id] ?? '')}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : !isConnected && (
          <div style={s.splash}>
            <div style={{ fontSize: 32, opacity: .3 }}>⊞</div>
            <div style={{ fontSize: 14, color: '#e8eaf2', fontWeight: 600 }}>Plugin loaded successfully</div>
            <div style={{ fontSize: 13 }}>Connect a Data Source in the element panel to preview your table here.</div>
          </div>
        )}

      </div>
    </div>
  )
}
