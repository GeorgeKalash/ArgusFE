import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useForm } from 'src/hooks/form'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { SystemFunction } from 'src/resources/SystemFunction'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { DataSets } from 'src/resources/DataSets'
import { getStorageData } from 'src/storage/storage'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import FieldSet from 'src/components/Shared/FieldSet'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

export default function ReceiptVoucherForm({ labels, maxAccess: access, recordId, cashAccountId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.ReceiptVoucher,
    access: access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.ReceiptVouchers.qry
  })

  const { formik } = useForm({
    maxAccess: maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      reference: '',
      accountId: null,
      date: new Date(),
      currencyId: null,
      dtId: documentType?.dtId,
      dgId: '',
      amount: '',
      baseAmount: '',
      notes: '',
      oDocId: '',
      printStatus: '',
      status: 1,
      paymentMethod: '1',
      cashAccountId: null,
      plantId: null,
      exRate: 1.0,
      rateCalcMethod: 1,
      contactId: null,
      collectorId: null,
      isVerified: true,
      template: 1,
      sourceReference: '',
      spId: '',
      amountRows: [
        {
          id: 1,
          outwardId: '',
          seqNo: '',
          cashAccountId: cashAccountId,
          cashAccount: '',
          ccId: '',
          ccName: '',
          type: '',
          amount: '',
          paidAmount: 0,
          returnedAmount: 0,
          bankFees: '',
          receiptRef: ''
        }
      ]
    },
    validationSchema: yup.object({
      accountId: yup.string().required(),
      currencyId: yup.string().required(),
      cashAccountId: yup.string().required(),
      amount: yup.string().required(),
      paymentMethod: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const response = await postRequest({
          extension: FinancialRepository.ReceiptVouchers.set,
          record: JSON.stringify({ ...obj, date: formatDateToApi(obj.date) })
        })
        if (!obj.recordId) {
          toast.success(platformLabels.Added)
          formik.setFieldValue('recordId', response.recordId)
          getData(response.recordId)
        } else toast.success(platformLabels.Edited)
        invalidate()
      } catch (e) {}
    }
  })

  const editMode = !!recordId || !!formik.values.recordId
  const isCancelled = formik.values.status === -1
  const isPosted = formik.values.status === 3
  const readOnly = formik.values.status !== 1

  const getDefaultDT = async () => {
    const userData = getStorageData('userData')

    const _userId = userData.userId
    try {
      const { record: cashAccountRecord } = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${_userId}&_key=cashAccountId`
      })

      const { record: currency } = await getRequest({
        extension: SystemRepository.Default.get,
        parameters: `_key=currencyId`
      })
      const cashAccountId = cashAccountRecord?.value
      if (cashAccountId) {
        const { record: cashAccountResult } = await getRequest({
          extension: CashBankRepository.CbBankAccounts.get,
          parameters: `_recordId=${cashAccountId}`
        })

        formik.setFieldValue('cashAccountId', cashAccountId)
        formik.setFieldValue('cashAccountRef', cashAccountResult.reference)
        formik.setFieldValue('cashAccountName', cashAccountResult.name)
        formik.setFieldValue('currencyId', parseInt(currency.value))
      }

      const { record: plantRecord } = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${_userId}&_key=plantId`
      })
      if (plantRecord) {
        formik.setFieldValue('plantId', parseInt(plantRecord.value))
      }
    } catch (error) {}
  }

  useEffect(() => {
    recordId && getDefaultDT()
    ;(async function () {
      getData()
    })()
  }, [recordId])

  async function getData(_recordId) {
    try {
      const finalRecordId = _recordId || recordId || formik.values.recordId
      if (finalRecordId) {
        const res = await getRequest({
          extension: FinancialRepository.ReceiptVouchers.get,
          parameters: `_recordId=${finalRecordId}`
        })

        formik.setValues({ ...res.record, date: formatDateFromApi(res.record.date) })
      }
    } catch (e) {}
  }

  const onPost = async () => {
    try {
      const res = await postRequest({
        extension: FinancialRepository.ReceiptVouchers.post,
        record: JSON.stringify(formik.values)
      })

      if (res) {
        toast.success('Record Posted Successfully')
        invalidate()
        getData()
      }
    } catch (e) {}
  }

  function openInfo() {
    stack({
      Component: InfoForm,
      props: {
        labels,
        formik
      },
      width: 700,
      height: 610,
      title: labels.Audit
    })
  }

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.type,
      name: 'type',
      props: {
        datasetId: DataSets.CA_CASH_ACCOUNT_TYPE,
        displayField: 'value',
        valueField: 'key',
        mapping: [
          { from: 'key', to: 'type' },
          { from: 'value', to: 'typeName' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        if (newRow.type != 2) return

        const sumAmount = formik.values.amountRows.slice(0, -1).reduce((sum, row) => {
          const curValue = parseFloat(row.amount.toString().replace(/,/g, '')) || 0

          return sum + curValue
        }, 0)

        const currentAmount = (parseFloat(amount) - parseFloat(sumAmount)).toFixed(2)
        update({ amount: currentAmount })
      }
    },
    {
      component: 'numberfield',
      name: 'paidAmount',
      label: labels.paidAmount,
      defaultValue: '',
      propsReducer({ row, props }) {
        return { ...props, readOnly: row.type == 1 || !row.type }
      },
      async onChange({ row: { update, newRow } }) {
        const sumAmount = formik.values.amountRows.slice(0, -1).reduce((sum, row) => {
          const curValue = parseFloat(row.amount.toString().replace(/,/g, '')) || 0

          return sum + curValue
        }, 0)

        let rowAmount
        let returnedAmount

        if (formik.values.amountRows.length === 1) {
          rowAmount = newRow.paidAmount > sumAmount ? newRow.paidAmount : sumAmount - newRow.paidAmount
          returnedAmount = (parseFloat(newRow.paidAmount) - parseFloat(amount)).toFixed(2)
        } else {
          const remainingAmount = (parseFloat(amount) - parseFloat(sumAmount)).toFixed(2)
          returnedAmount = (parseFloat(newRow.paidAmount) - parseFloat(remainingAmount)).toFixed(2)
          rowAmount = returnedAmount > 0 ? newRow.paidAmount - returnedAmount : newRow.paidAmount
        }

        update({
          returnedAmount: returnedAmount,
          amount: parseFloat(rowAmount).toFixed(2)
        })
      }
    },
    {
      component: 'numberfield',
      name: 'returnedAmount',
      label: labels.returnedAmount,
      defaultValue: '',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'amount',
      label: labels.Amount,
      defaultValue: ''
    },
    {
      component: 'resourcecombobox',
      name: 'ccName',
      editable: false,
      label: labels.creditCard,
      props: {
        endpointId: CashBankRepository.CreditCard.qry,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'ccId' },
          { from: 'name', to: 'ccName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 2
      }
    },
    {
      component: 'numberfield',
      header: labels.bankFees,
      name: 'bankFees',
      label: labels.bankFees
    },
    {
      component: 'textfield',
      header: labels.receiptRef,
      name: 'receiptRef',
      label: labels.receiptRef
    }
  ]

  const actions = [
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: isPosted || !editMode || isCancelled
    },
    {
      key: 'Audit',
      condition: true,
      onClick: openInfo,
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.ReceiptVoucher}
      functionId={SystemFunction.ReceiptVoucher}
      form={formik}
      actions={actions}
      maxAccess={maxAccess}
      editMode={editMode}
      disabledSubmit={isPosted || isCancelled}
      previewReport={editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.reference}
                    readOnly={editMode}
                    maxAccess={!editMode && maxAccess}
                    maxLength='30'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    onChange={formik.setFieldValue}
                    readOnly={readOnly}
                    value={formik.values.date}
                    maxAccess={maxAccess}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <ResourceLookup
                    endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='corId'
                    label={labels.corName}
                    form={formik}
                    displayFieldWidth={2}
                    valueShow='corRef'
                    readOnly={editMode}
                    secondValueShow='corName'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('corId', newValue ? newValue.recordId : '')
                      formik.setFieldValue('corName', newValue ? newValue.name : '')
                      formik.setFieldValue('corRef', newValue ? newValue.reference : '')
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomNumberField
                    name='amount'
                    label={labels.amount}
                    value={formik.values.amount}
                    required
                    readOnly={true}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('amount', e.target.value)}
                    onClear={() => {
                      formik.setFieldValue('amount', '')
                      if (!formik.values.fcAmount) {
                        handleSelectedProduct(null, true)
                        formik.setFieldValue('products', [])
                      }
                    }}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                    maxLength={10}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Grid container>
            <FieldSet title='Amount'>
              <Grid width={'100%'}>
                <DataGrid
                  onChange={value => formik.setFieldValue('amountRows', value)}
                  value={formik.values.amountRows}
                  error={formik.errors.amountRows}
                  disabled={editMode && !mobilePlantExists}
                  allowAddNewLine={!editMode}
                  allowDelete={editMode}
                  maxAccess={maxAccess}
                  name='amountRows'
                  height={170}
                  columns={columns}
                />
              </Grid>
            </FieldSet>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
