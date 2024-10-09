import React, { useContext, useState, useEffect } from 'react'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { useFormik } from 'formik'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from './Table'
import { ResourceLookup } from './ResourceLookup'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { Fixed } from './Layouts/Fixed'
import { Grow } from './Layouts/Grow'
import { VertLayout } from './Layouts/VertLayout'
import { getFormattedNumber } from 'src/lib/numberField-helper'

const AccountBalance = () => {
  const { getRequest } = useContext(RequestsContext)
  const [gridData, setGridData] = useState({})

  const formik = useFormik({
    initialValues: {
      cashAccountId: '',
      cashAccountRef: '',
      cashAccountName: ''
    }
  })

  async function fetchGridData() {
    if (formik.values.cashAccountId) {
      const data = await getRequest({
        extension: CashBankRepository.AccountBalance.qry,
        parameters: `_cashAccountId=${formik.values.cashAccountId}`
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
  }, [formik.values.cashAccountId])

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    datasetId: ResourceIds.AccountBalance
  })

  const columns = [
    {
      field: 'currencyRef',
      headerName: _labels.currencyRef,
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: _labels.currencyName,
      flex: 1
    },
    {
      field: 'balance',
      headerName: _labels.balance,
      flex: 1,
      type: 'number'
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <Grid item xs={3} width={'50%'} paddingLeft={'0.5rem'} marginTop={'1rem'} marginBottom={'1rem'}>
          <ResourceLookup
            endpointId={CashBankRepository.CashAccount.snapshot}
            parameters={{
              _type: 0
            }}
            name='cashAccountRef'
            label={_labels.cashAccount}
            valueField='reference'
            displayField='name'
            valueShow='cashAccountRef'
            secondValueShow='cashAccountName'
            form={formik}
            onChange={(event, newValue) => {
              formik.setValues({
                cashAccountId: newValue?.recordId || '',
                cashAccountRef: newValue?.reference || '',
                cashAccountName: newValue?.name || ''
              })
            }}
            errorCheck={'cashAccountId'}
            maxAccess={access}
          />
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['currencyId']}
          isLoading={!gridData}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default AccountBalance
