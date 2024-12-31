import React, { useContext, useState, useEffect } from 'react'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { useFormik } from 'formik'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CostAllocationRepository } from 'src/repositories/CostAllocationRepository'
import Table from 'src/components/Shared/Table'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'

const InvoicesForm = (labels, maxAccess) => {
  const { getRequest } = useContext(RequestsContext)
  const [gridData, setGridData] = useState({})

  const formik = useFormik({
    initialValues: {
      invoiceId: '',
      invoiceRef: '',
      invoiceName: ''
    }
  })

  async function fetchGridData() {
    if (formik.values.invoiceId) {
      const data = await getRequest({
        extension: CostAllocationRepository.Invoice.qry,
        parameters: `_caId=${formik.values.invoiceId}`
      })
      setGridData(data)
    } else {
      setGridData({
        list: [],
        count: 0
      })
    }
  }

  useEffect(() => {
    fetchGridData()
  }, [formik.values.invoiceId])

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} sx={{ m: 2 }}>
          <Grid item xs={6}>
            <ResourceLookup
              endpointId={PurchaseRepository.PurchaseInvoiceHeader.snapshot}
              name='invoiceRef'
              label={labels.invoice}
              valueField='reference'
              displayField='name'
              valueShow='invoiceRef'
              secondValueShow='invoiceName'
              form={formik}
              onChange={(event, newValue) => {
                formik.setValues({
                  invoiceId: newValue?.recordId || '',
                  invoiceRef: newValue?.reference || '',
                  invoiceName: newValue?.currencyName || ''
                })
              }}
              errorCheck={'invoiceId'}
              maxAccess={maxAccess}
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table columns={columns} gridData={gridData} rowId={['invoiceId']} isLoading={!gridData} pagination={false} />
      </Grow>
    </VertLayout>
  )
}

export default InvoicesForm
