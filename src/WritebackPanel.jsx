import styles from './WritebackPanel.module.css'

export function WritebackPanel({ columns, wbMapping, wbKeyCol, onMappingChange, onKeyColChange }) {
  return (
    <div className={styles.panel}>
      <div className={styles.title}>Writeback Output Mapping</div>

      {/* Primary key selector */}
      <div className={styles.keyRow}>
        <span className={styles.keyLabel}>🔑 Primary key column (used for UPSERT matching):</span>
        <select
          className={styles.keySelect}
          value={wbKeyCol}
          onChange={e => onKeyColChange(e.target.value)}
        >
          <option value="">— none (row index used) —</option>
          {columns.map(col => (
            <option key={col.id} value={col.id}>{col.name}</option>
          ))}
        </select>
      </div>

      {/* Column mapping grid */}
      <div className={styles.grid}>
        <div className={styles.gridHeader}>Source column</div>
        <div />
        <div className={styles.gridHeader}>Target field name</div>

        {columns.map(col => (
          <MappingRow
            key={col.id}
            col={col}
            value={wbMapping[col.id] || ''}
            onChange={val => onMappingChange(col.id, val)}
          />
        ))}
      </div>

      <div className={styles.hint}>
        Each output row carries <code>__op</code> (<code>insert</code> / <code>update</code> / <code>delete</code>)
        and <code>__key</code> (primary key value), plus all mapped field values.
        Leave a target field blank to exclude that column from the payload.
        Wire the plugin's <strong>Writeback Rows</strong> output to a Sigma Input Table or Writeback element.
      </div>
    </div>
  )
}

function MappingRow({ col, value, onChange }) {
  return (
    <>
      <div className="wb-col-label" title={col.name} style={{
        fontSize: '12px', padding: '5px 8px', background: 'var(--surface-2)',
        borderRadius: '5px', border: '1px solid var(--border)', color: 'var(--text)',
        fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {col.name}
      </div>
      <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>→</div>
      <input
        style={{
          fontSize: '12px', padding: '5px 8px', background: 'var(--bg)',
          border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text)',
          fontFamily: 'var(--font-mono)', outline: 'none', width: '100%',
        }}
        type="text"
        placeholder={col.name.toLowerCase().replace(/\s+/g, '_')}
        value={value}
        onChange={e => onChange(e.target.value.trim())}
        onFocus={e => e.target.select()}
      />
    </>
  )
}
