import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { Grid } from '@mui/material'
import * as yup from 'yup'
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
  const [selectedRow, setRow] = useState(null)

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.AccountReconciliations
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      recordId: null,
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
    validationSchema: yup.object({
      startDate: yup.date().required(),
      endDate: yup.date().required(),
      currencyId: yup.string().required(),
      accountId: yup.string().required(),
      rclStatus: yup.string().required(),
    }),
    onSubmit: () => {
      PreviewGrid()
    }
  })

  async function PreviewGrid() {
    const startDate = formatDateToISO(new Date(formik?.values?.startDate)).trim()
    const endDate = formatDateToISO(new Date(formik?.values?.endDate)).trim()
    const currencyId = String(formik?.values?.currencyId).trim()

    const result = await getRequest({
      extension: FinancialRepository.AccountReconciliations.qry,
      parameters: `_startDate=${startDate}&_endDate=${endDate}&_accountId=${formik?.values?.accountId}&_currencyId=${currencyId}&_rclStatus=${formik?.values?.rclStatus}`
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
        debits: 0,
        credits: 0,
        balance: 0,
        tCredits: totalCredit,
        tDebits: totalDebit,
        tBalance: totalBalance,
        rows: res
    })
  }

  function onRowCheck(row) {
    setRow(row?.rclCode || null)
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

      formik.setValues({
        ...formik.values,
        debits: totalDebit,
        credits: totalCredit,
        balance: totalBalance
      })
  }

  async function applyReconciliation(){
    const payload = {
      accountId: formik?.values?.accountId,
      transactions: formik?.values?.rows?.filter(row => row.checked)
    }

    await postRequest({
      extension: FinancialRepository.AccountReconciliations.set,
      record: JSON.stringify(payload)
    })

    toast.success(platformLabels.Applied)
    PreviewGrid()
  }

  async function unApplyReconciliation(){
    const payload = {
      accountId: formik?.values?.accountId,
      code: selectedRow,
      rclCode: selectedRow
    }

    await postRequest({
      extension: FinancialRepository.AccountReconciliations.del,
      record: JSON.stringify(payload)
    })

    toast.success(platformLabels.Unapplied)
    PreviewGrid()
    setRow(null)
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
      onClick: formik.handleSubmit
    },
    {
      key: 'Apply',
      condition: true,
      onClick: applyReconciliation,
      disabled: !(formik?.values?.debits === formik?.values?.credits && formik?.values?.rows?.some(row => row.checked))
    },
    {
      key: 'Unapply',
      condition: true,
      onClick: unApplyReconciliation,
      disabled: !selectedRow
    }
  ]

  useEffect(() => {
    formik.setValues({
      ...formik.values,
      debits: 0,
      credits: 0,
      balance: 0,
      tDebits: 0,
      tCredits: 0,
      tBalance: 0,
      rows: []
    })
  },[formik?.values?.startDate, formik?.values?.endDate, formik?.values?.accountId, formik?.values?.currencyId, formik?.values?.rclStatus])

  return (
    <FormShell
      resourceId={ResourceIds.Reconciliation}
      form={formik}
      maxAccess={access}
      actions={actions}
      isSaved={false}
      editMode={formik?.values?.recordId}
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
                            maxAccess={access}
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
                            onChange={(_, newValue) => {
                              formik.setFieldValue('recordId', newValue?.recordId || null)
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
            highlightRow={{ field: 'checked', value: true , color: formik?.values?.balance == 0 ? '#78d580' : '#efc65e'}}
            disable={(row) => row.rclCode}
            onSelectionChange={row => setRow(row?.rclCode || null)}
          />
        </Grow>
      </VertLayout>
      </FormShell>
  )
}

