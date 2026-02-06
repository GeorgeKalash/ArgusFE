import { Grid, Typography } from '@mui/material'
import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import PrintableTable from '@argus/shared-ui/src/components/Shared/PrintTable'

const PrintForm = ({ labels, tableData, columns, rpbParams }) => {
  const printRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page { size: A4; margin: 12mm; }
    `
  })

  return (
    <VertLayout>
      <Grid item sx={{ m: 2 }}>
        <CustomButton onClick={handlePrint} image='print.png' />
      </Grid>

      <div
        ref={printRef}
        className='print-container'
        style={{
          all: 'inherit'
        }}
      >
        <Typography
          variant='h5'
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
          <Grid container direction='column' spacing={0.5} sx={{ m: 0, p: 1 }}>
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

        <PrintableTable columns={columns} rows={tableData} showOnScreen treeField='nodeName' firstColWidth='45%' />
      </div>
    </VertLayout>
  )
}

export default PrintForm
