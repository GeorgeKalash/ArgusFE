import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { Grid } from '@mui/material'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { formatDateToISO } from '@argus/shared-domain/src/lib/date-helper'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'

export default function AccountReconciliations(){
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.AccountReconciliations
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      startDate: null,
      endDate: null,
      currencyId: null,
      accountId: null,
      rclStatus: null,
      debits: 0,
      credits: 0,
      balance: 0,
      tDebits: 0,
      tCredits: 0,
      tBalance: 0,
      rows: []
    },
    onSubmit: async obj => {
    }
  })

  async function PreviewGrid() {
    const result = await getRequest({
      extension: FinancialRepository.AccountReconciliations.qry,
      parameters: `_startDate=${formatDateToISO(new Date(formik?.values?.startDate))}&_endDate=${formatDateToISO(new Date(formik?.values?.endDate))}
        &_accountId=${formik?.values?.accountId}&_currencyId=${formik?.values?.currencyId}
        &_rclStatus=${formik?.values?.rclStatus}`
    })

    let totalCredit = 0
    let totalDebit = 0
    let totalBalance = 0

    const res = (result?.list || []).map(item => {
      const debits = item?.amount > 0 ? item.amount : 0
      const credits = item?.amount < 0 ? Math.abs(item.amount) : 0
      const balance = debits - credits
      totalDebit += debits
      totalCredit += credits
      totalBalance += balance

      return {
        ...item,
        debits,
        credits,
        balance
      }
    })

    formik.setValues({
        ...formik.values,
        tCredits: totalCredit,
        tDebits: totalDebit,
        tBalance: totalBalance,
        rows: res
    })
  }

  function onRowCheck() {
    const { totalDebit, totalCredit, totalBalance } = (formik?.values?.rows || [])
        .filter(row => row.checked)
        .reduce(
        (acc, row) => {
            acc.totalDebit += row.debits || 0
            acc.totalCredit += row.credits || 0
            acc.totalBalance += row.balance || 0
            return acc
        },
        { totalDebit: 0, totalCredit: 0, totalBalance: 0 }
        )

    formik.setFieldValue('debits', totalDebit)
    formik.setFieldValue('credits', totalCredit)
    formik.setFieldValue('balance', totalBalance)
  }

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
    },
    {
      field: 'functionId',
      headerName: labels.function,
      flex: 1
    },
    {
      field: 'debits',
      headerName: labels.debits,
      flex: 1,
      type: 'number'
    },
    {
      field: 'credits',
      headerName: labels.credits,
      flex: 1,
      type: 'number'
    },
    {
      field: 'description',
      headerName: labels.notes,
      flex: 1,
    },
    {
      field: 'rclCode',
      headerName: labels.applyCode,
      flex: 1
    }
  ]


  const actions = [
    {
      key: 'PR',
      condition: true,
      onClick: PreviewGrid,
      disabled:
        !formik?.values?.startDate ||
        !formik?.values?.endDate ||
        !formik?.values?.accountId ||
        !formik?.values?.rclStatus ||
        !formik?.values?.currencyId
    },
    {
      key: 'Apply',
      condition: true,
      onClick: () => formik.handleSubmit('apply'),
    },
    {
      key: 'Unapply',
      condition: true,
      onClick: () => formik.handleSubmit('unapply'),
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.AccountReconciliations}
      form={formik}
      maxAccess={access}
      actions={actions}
      isSavedClear={false}
      isSaved={false}
      editMode={true}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2} p={2}>
            <Grid item xs={4}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                       <CustomDatePicker
                        name='startDate'
                        required
                        label={labels.startDate}
                        value={formik?.values?.startDate}
                        onChange={formik.setFieldValue}
                        maxAccess={access}
                        onClear={() => formik.setFieldValue('startDate', null)}
                        error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                    />
                    </Grid>
                    <Grid item xs={6}>
                        <ResourceComboBox
                            endpointId={SystemRepository.Currency.qry}
                            name='currencyId'
                            label={labels.currency}
                            valueField='recordId'
                            displayField={['reference', 'name']}
                            columnsInDropDown={[
                                { key: 'reference', value: 'Reference' },
                                { key: 'name', value: 'Name' }
                            ]}
                            required
                            displayFieldWidth={1.5}
                            values={formik.values}
                            maxAccess={access}
                            onChange={(_, newValue) => formik.setFieldValue('currencyId', newValue?.recordId || null)}
                            error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <CustomDatePicker
                            name='endDate'
                            required
                            label={labels.endDate}
                            value={formik?.values?.endDate}
                            onChange={formik.setFieldValue}
                            maxAccess={access}
                            onClear={() => formik.setFieldValue('endDate', null)}
                            error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <ResourceComboBox
                            datasetId={DataSets.RCL_STATUS}
                            name='rclStatus'
                            label={labels.show}
                            required
                            valueField='key'
                            displayField='value'
                            values={formik.values}
                            onClear={() => formik.setFieldValue('rclStatus', null)}
                            onChange={(_, newValue) => formik.setFieldValue('rclStatus', newValue?.key || null) }
                            error={formik.touched.rclStatus && Boolean(formik.errors.rclStatus)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ResourceLookup
                            endpointId={FinancialRepository.Account.snapshot}
                            valueField='recordId'
                            displayField='name'
                            name='reference'
                            secondValueShow='name'
                            label={labels.accountNo}
                            form={formik}
                            required
                            firstValue={formik.values.accountRef}
                            secondValue={formik.values.accountName}
                            columnsInDropDown={[
                            { key: 'reference', value: 'Reference' },
                            { key: 'name', value: 'Name' }
                            ]}
                            onChange={(event, newValue) => {
                            formik.setFieldValue('accountId', newValue?.recordId || null)
                            formik.setFieldValue('accountRef', newValue?.reference || '')
                            formik.setFieldValue('accountName', newValue?.name || '')
                            }}
                            displayFieldWidth={2}
                            errorCheck={'accountId'}
                            maxAccess={access}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='debits'
                    label={labels.debits}
                    value={formik.values.debits}
                    readOnly
                    decimalScale={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='credits'
                    label={labels.credits}
                    value={formik.values.credits}
                    readOnly
                    decimalScale={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='balance'
                    label={labels.balance}
                    value={formik.values.balance}
                    readOnly
                    decimalScale={3}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='tDebits'
                    label={labels.totalDebits}
                    value={formik.values.tDebits}
                    readOnly
                    decimalScale={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='tCredits'
                    label={labels.totalCredits}
                    value={formik.values.tCredits}
                    readOnly
                    decimalScale={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='tBalance'
                    label={labels.totalBalance}
                    value={formik.values.tBalance}
                    readOnly
                    decimalScale={3}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            name='table'
            columns={columns}
            gridData={{list: formik?.values?.rows || []}}
            rowId={'recordId'}
            maxAccess={access}
            pagination={false}
            showCheckboxColumn={true}
            handleCheckboxChange={onRowCheck}
            highlightRow={(row)=> row.checked}
          />
        </Grow>
      </VertLayout>
      </FormShell>
  )
}

