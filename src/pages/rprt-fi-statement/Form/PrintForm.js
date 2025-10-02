import { Grid, Typography } from '@mui/material'
import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import CustomButton from 'src/components/Inputs/CustomButton'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import Table from 'src/components/Shared/Table'

const PrintForm = ({ labels, tableData, columns, rpbParams }) => {
  const printRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => printRef.current
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
          {labels.FinancialStatements}
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

        <div style={{ all: 'inherit' }}>
          <Table
            name='print'
            columns={columns}
            gridData={{ list: tableData }}
            rowId={['nodeId']}
            pagination={false}
            collabsable={false}
            domLayout={'autoHeight'}
            field='nodeName'
            disableSorting
            fullRowData={tableData}
          />
        </div>
      </div>
    </VertLayout>
  )
}

export default PrintForm
