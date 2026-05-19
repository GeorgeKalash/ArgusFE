import { Grid, Typography } from '@mui/material'
import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import PrintableTable from '@argus/shared-ui/src/components/Shared/PrintTable'

const PrintForm = ({
  labels,
  tableData,
  columns,
  rpbParams,
  renderDetailRow 
}) => {
  const printRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page { size: A4; margin: 12mm; }
    `
  })

  const visibleColumns = columns.filter(col => col.hide !== true)

  return (
    <VertLayout>
      <Grid item sx={{ m: 2 }}>
        <CustomButton onClick={handlePrint} image='print.png' />
      </Grid>

          
      <div ref={printRef} className="print-container" style={{ all: 'inherit' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            m: 1,
            fontSize: '18pt'
          }}
        >
          {labels.FinancialStatement}
        </Typography>

        {rpbParams && rpbParams.length > 0 && (
          <Grid container direction="column" spacing={0.5} sx={{ m: 0, p: 1 }}>
            {rpbParams.map(
              (param, i) =>
                param.display && (
                  <Grid key={i} item>
                    <b>{param.caption}:</b> {param.display}
                  </Grid>
                )
            )}
          </Grid>
        )}

        
        {tableData.map(row => {
          // Skip synthetic detail rows
          if (row.isDetailRow) return null

          // Only generate detail content when the row actually has breakdowns
          const hasDetails =
            row.breakDowns &&
            Array.isArray(row.breakDowns) &&
            row.breakDowns.length > 0

          const detailContent =
            hasDetails && renderDetailRow
              ? renderDetailRow(row)
              : null

          return (
            <div key={row.nodeId}>
              <PrintableTable
                columns={visibleColumns}
                rows={tableData.filter(row => !row.isDetailRow)}
                showOnScreen
                treeField="nodeName"
                firstColWidth="45%"
              />

              {tableData
                .filter(row => {
                  return (
                    !row.isDetailRow &&
                    row.breakDowns &&
                    Array.isArray(row.breakDowns) &&
                    row.breakDowns.length > 0
                  )
                })
                .map(row => {
                  const detailContent =
                    renderDetailRow ? renderDetailRow(row) : null

                  if (!detailContent) return null

                  return (
                    <div
                      key={`detail-${row.nodeId}`}
                      style={{
                        marginLeft: '40px',
                        marginTop: '8px',
                        marginBottom: '16px',
                        pageBreakInside: 'avoid'
                      }}
                    >
                      {detailContent}
                    </div>
                  )
                })}
            </div>
          )
        })}
      </div>
    </VertLayout>
  )
}

export default PrintForm