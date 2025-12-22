import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Grid } from '@mui/material'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { useForm } from '@argus/shared-hooks/src/hooks/form.js'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { GeneralLedgerRepository } from '@argus/repositories/src/repositories/GeneralLedgerRepository'
import CustomNumberField from '../Inputs/CustomNumberField'
import { useContext } from 'react'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import Form from './Form'

export default function ExpensesCostCenters({ row, window, updateRow, recordId, readOnly }) {
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.CostCenter, window })

  const { labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.CostCenter
  })

  const { formik } = useForm({
    maxAccess,
    validateOnChange: true,
    initialValues: {
      costCenters: row.costCenters || [
        {
          id: 1,
          pvId: recordId || 0,
          seqNo: 1,
          ccSeqNo: '',
          ccId: '',
          amount: ''
        }
      ]
    },
    onSubmit: async obj => {
      const costCenters = obj.costCenters.map((costCenter, index) => ({
        ...costCenter,
        id: index + 1,
        ccSeqNo: index + 1,
        seqNo: row.id,
        pvId: recordId
      }))

      updateRow({ changes: { costCenters } })
      window.close()
    }
  })

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.costCenter,
      name: 'ccId',
      props: {
        endpointId: GeneralLedgerRepository.CostCenter.qry,
        parameters: `_params=&_startAt=0&_pageSize=1000&`,
        valueField: 'recordId',
        displayField: 'reference',
        displayFieldWidth: 3,
        readOnly,
        mapping: [
          { from: 'recordId', to: 'ccId' },
          { from: 'name', to: 'ccName' },
          { from: 'reference', to: 'ccRef' },
          { from: 'ccgName', to: 'ccgName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name', grid: 3 },
          { key: 'ccgName', value: 'Group Name' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'ccName',
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.group,
      name: 'ccgName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.amount,
      name: 'amount',
      props: {
        readOnly
      }
    }
  ]

  const totalAmount = formik.values?.costCenters?.reduce((amount, row) => {
    const amountValue = parseFloat(row.amount?.toString().replace(/,/g, '')) || 0

    return amount + amountValue
  }, 0)

  const balance = row.amount - totalAmount

  const canSubmit = balance > 0 || balance < 0 || readOnly

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} disabledSubmit={canSubmit}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomNumberField
                name='amount'
                label={labels.amount}
                value={row.amount}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('amount', '')}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='amountAssigned'
                label={labels.amountAssigned}
                value={totalAmount}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='balance'
                label={labels.balance}
                value={balance}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('balance', '')}
                error={canSubmit}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('costCenters', value)
            }}
            value={formik.values.costCenters}
            error={formik.errors.costCenters}
            columns={columns}
            allowDelete={!readOnly}
            allowAddNewLine={!readOnly}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

ExpensesCostCenters.width = 700
ExpensesCostCenters.height = 600
