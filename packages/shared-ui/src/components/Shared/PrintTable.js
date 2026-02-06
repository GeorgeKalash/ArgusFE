import React from 'react'
import { formatDateDefault, formatDateTimeDefault } from '@argus/shared-domain/src/lib/date-helper'

export default function PrintableTable({
  columns = [],
  rows = [],
  treeField,
  firstColWidth = '',
  showOnScreen
}) {
  const treeColField = columns.find(c => c.isTree)?.field || treeField

  const treeIndex = Math.max(
    0,
    columns.findIndex(c => c.field === treeColField)
  )

  const colWidths = columns.map((_, i) => (i === treeIndex ? firstColWidth : null))

  const widthStyle = w => (w == null ? {} : { width: typeof w === 'number' ? `${w}px` : String(w) })

  const formatCell = (col, value) => {
    if (col?.type === 'number' && typeof value === 'number') {
      return new Intl.NumberFormat().format(value)
    }

    if (col?.type === 'date') {
      return typeof formatDateDefault === 'function' ? formatDateDefault(value) : value ?? ''
    }

    if (col?.type === 'dateTime') {
      return typeof formatDateTimeDefault === 'function' ? formatDateTimeDefault(value, col?.dateFormat) : value ?? ''
    }

    return value ?? ''
  }

  return (
    <table
      className='print-table'
      style={{
        display: showOnScreen ? 'table' : 'none',
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '10pt',
        tableLayout: 'fixed'
      }}
    >
      <colgroup>
        {colWidths.map((w, i) => (
          <col key={i} style={widthStyle(w)} />
        ))}
      </colgroup>

      <thead>
        <tr>
          {columns.map((col, i) => (
            <th
              key={col.field}
              style={{
                ...widthStyle(colWidths[i]),
                textAlign: col?.type === 'number' ? 'right' : 'left',
                padding: '6px 8px',
                border: '1px solid #ddd',
                fontWeight: 700,
                background: '#fafafa',
                overflow: 'hidden',
                whiteSpace: 'normal'
              }}
            >
              {i === treeIndex ? '' : col.headerName || col.field}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows?.map((row, rIdx) => {
          const isBoldRow = !!row?.isBold

          return (
            <tr key={rIdx} style={{ background: rIdx % 2 ? '#fbfbfb' : 'white' }}>
              {columns.map((col, i) => {
                const isTreeCol = i === treeIndex
                const level = Number(row?.level || 0)
                const pad = `${level * 20}px`
                const rawVal = row?.[col.field]
                const cellContent = formatCell(col, rawVal)

                return (
                  <td
                    key={col.field}
                    style={{
                      ...widthStyle(colWidths[i]),
                      textAlign: col?.type === 'number' ? 'right' : 'left',
                      padding: '6px 8px',
                      border: '1px solid #eee',
                      verticalAlign: 'top',
                      fontWeight: isBoldRow ? 700 : 400,
                      overflow: 'hidden',
                      whiteSpace: 'normal'
                    }}
                  >
                    {isTreeCol ? (
                      <div style={{ paddingInlineStart: pad, whiteSpace: 'pre-wrap' }}>
                        <span>{cellContent}</span>
                      </div>
                    ) : (
                      <span>{cellContent}</span>
                    )}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
