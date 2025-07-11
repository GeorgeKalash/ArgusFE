import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Grid } from '@mui/material'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useForm } from 'src/hooks/form.js'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import CustomNumberField from '../Inputs/CustomNumberField'
import { useContext } from 'react'
import { ControlContext } from 'src/providers/ControlContext'
import useSetWindow from 'src/hooks/useSetWindow'
import { useResourceQuery } from 'src/hooks/resource'

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
    <FormShell
      resourceId={ResourceIds.CostCenter}
      form={formik}
      maxAccess={maxAccess}
      isCleared={false}
      isInfo={false}
      disabledSubmit={canSubmit}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={4}>
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
    </FormShell>
  )
}

ExpensesCostCenters.width = 700
ExpensesCostCenters.height = 600
