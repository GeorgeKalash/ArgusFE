import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ExpensesCostCenters from '@argus/shared-ui/src/components/Shared/ExpensesCostCenters'
import MultiCurrencyRateForm from '@argus/shared-ui/src/components/Shared/MultiCurrencyRateForm'
import { MultiCurrencyRepository } from '@argus/repositories/src/repositories/MultiCurrencyRepository'
import { RateDivision } from '@argus/shared-domain/src/resources/RateDivision'
import { DIRTYFIELD_RATE, getRate } from '@argus/shared-utils/src/utils/RateCalculator'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'

export default function FiPaymentVoucherExpensesForm({ recordId, plantId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()
  const currencyId = parseInt(defaultsData?.list?.find(obj => obj.key === 'currencyId')?.value)
  const cashAccountId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'cashAccountId')?.value)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.PaymentVoucherExpenses,
    editMode: !!recordId
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.PaymentVoucher,
    access,
    enabled: !recordId
  })

  useSetWindow({ title: labels.paymentVoucherExpenses, window })

  const initialValues = {
    recordId: null,
    reference: '',
    accountId: '',
    accountType: 3,
    currencyId: parseInt(currencyId),
    currencyName: '',
    paymentMethod: '',
    date: new Date(),
    glId: null,
    amount: null,
    checkNo: '',
    checkbookId: null,
    decimals: null,
    notes: '',
    exRate: 1,
    rateCalcMethod: 1,
    baseAmount: null,
    cashAccountId: parseInt(cashAccountId) || null,
    dtId: null,
    status: 1,
    releaseStatus: null,
    plantId: parseInt(plantId),
    contactId: null,
    isVerified: false,
    expenses: [
      {
        id: 1,
        pvId: recordId || 0,
        seqNo: 1,
        etId: '',
        subtotal: null,
        vatAmount: null,
        amount: null,
        supplierName: '',
        taxRef: '',
        notes: '',
        isVAT: false,
        hasCostCenters: false,
        costCenters: []
      }
    ]
  }

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.PaymentVouchers.page2
  })

  const { formik } = useForm({
    initialValues,
    maxAccess,
    validateOnChange: true,
    documentType: { key: 'dtId', value: documentType?.dtId },
    validationSchema: yup.object({
      accountType: yup.string().required(),
      currencyId: yup.number().required(),
      date: yup.string().required(),
      paymentMethod: yup.string().required(),
      cashAccountId: yup.string().required(),
      expenses: yup
        .array()
        .of(
          yup.object().shape({
            etId: yup.number().required(),
            amount: yup.number().required()
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const payload = getPayload(obj)

      const response = await postRequest({
        extension: FinancialRepository.PaymentVouchers.set2,
        record: JSON.stringify(payload)
      })

      !recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)
      const res2 = await getPaymentVouchers(response.recordId)
      res2.record.date = formatDateFromApi(res2.record.date)
      await getExpenses(res2.record)
      invalidate()
    }
  })

  const getPayload = obj => {
    const updatedRateRow = getRate({
      amount: totalAmount,
      exRate: obj?.exRate,
      baseAmount: 0,
      rateCalcMethod: obj?.rateCalcMethod,
      dirtyField: DIRTYFIELD_RATE
    })

    const copy = { ...obj }
    delete copy.expenses
    copy.date = formatDateToApi(copy.date)
    copy.amount = totalAmount
    copy.baseAmount = updatedRateRow?.baseAmount || 0

    const costCentersValues = []

    const updatedRows = formik.values.expenses.map((expensesDetails, index) => {
      const { costCenters, ...restDetails } = expensesDetails
      if (costCenters) {
        costCentersValues.push(...costCenters)
      }

      return {
        ...restDetails,
        seqNo: index + 1,
        pvId: formik.values.recordId || 0
      }
    })

    const payload = {
      header: copy,
      items: updatedRows,
      costCenters: costCentersValues
    }

    return payload
  }

  const totalAmount = formik.values?.expenses?.reduce((amount, row) => {
    const amountValue = parseFloat(row.amount?.toString().replace(/,/g, '')) || 0

    return amount + amountValue
  }, 0)

  const isPosted = formik.values.status === 3
  const isCancelled = formik.values.status === -1
  const editMode = !!formik.values.recordId
  const isVerified = formik.values.isVerified

  async function getPaymentVouchers(recordId) {
    return await getRequest({
      extension: FinancialRepository.PaymentVouchers.get,
      parameters: `_recordId=${recordId}`
    })
  }

  const onPost = async () => {
    try {
      const res = await postRequest({
        extension: FinancialRepository.PaymentVouchers.post,
        record: JSON.stringify(formik.values)
      })

      toast.success(platformLabels.Posted)
      invalidate()
      const res2 = await getPaymentVouchers(res.recordId)
      res2.record.date = formatDateFromApi(res2.record.date)
      await getExpenses(res2.record)
    } catch (exception) {}
  }
  async function getDTD(dtId) {
    if (dtId) {
      const res = await getRequest({
        extension: FinancialRepository.FIDocTypeDefaults.get,
        parameters: `_dtId=${dtId}`
      })

      formik.setFieldValue('plantId', res?.record?.plantId || plantId)
      const payment = await getCashAccountAndPayment(res?.record?.cashAccountId || cashAccountId)
      formik.setFieldValue('paymentMethod', res?.record?.paymentMethod || payment)
    }
  }

  const getCashAccountAndPayment = async cashAccountId => {
    if (cashAccountId) {
      const { record: cashAccountResult } = await getRequest({
        extension: CashBankRepository.CbBankAccounts.get,
        parameters: `_recordId=${cashAccountId}`
      })
      formik.setFieldValue('cashAccountId', cashAccountResult?.recordId || null)
      formik.setFieldValue('cashAccountRef', cashAccountResult?.reference || '')
      formik.setFieldValue('cashAccountName', cashAccountResult?.name || '')

      return cashAccountResult.paymentMethod
    } else {
      return null
    }
  }

  useEffect(() => {
    if (formik.values?.dtId && !recordId) getDTD(formik.values?.dtId)
  }, [formik.values?.dtId])

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getPaymentVouchers(recordId)
          res.record.date = formatDateFromApi(res.record.date)
          await getExpenses(res.record)
        } else {
          getCashAccountAndPayment(cashAccountId)
        }
        await getDefaultVAT()
      } catch (e) {}
    })()
  }, [])

  async function getDefaultVAT() {
    const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: `_filter=&_key=vatPct`
    })

    const vatPctValue = parseInt(res.record.value)
    formik.setFieldValue('vatPct', vatPctValue)
  }

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.PaymentVoucher,
        recordId: formik.values.recordId
      }
    })
  }

  const onCancel = async () => {
    try {
      const res = await postRequest({
        extension: FinancialRepository.PaymentVouchers.cancel,
        record: JSON.stringify(formik.values)
      })

      toast.success(platformLabels.Cancelled)
      invalidate()
      const res2 = await getPaymentVouchers(res.recordId)
      res2.record.date = formatDateFromApi(res2.record.date)
      await getExpenses(res2.record)
    } catch (e) {}
  }

  const onVerify = async () => {
    const res = await postRequest({
      extension: FinancialRepository.PaymentVouchers.verify,
      record: JSON.stringify(formik.values)
    })

    if (res) {
      toast.success(!isVerified ? platformLabels.Verified : platformLabels.Unverfied)
      invalidate()
      window.close()
    }
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: FinancialRepository.PaymentVouchers.unpost,
      record: JSON.stringify(formik.values)
    })

    if (res?.recordId) {
      toast.success(platformLabels.Unposted)
      invalidate()
      const res2 = await getPaymentVouchers(res.recordId)
      res2.record.date = formatDateFromApi(res2.record.date)
      await getExpenses(res2.record)
    }
  }

  const onReset = async () => {
    getDefaultVAT()
    const payload = getPayload(formik.values)
    await postRequest({
      extension: FinancialRepository.ResetGL_PV.reset,
      record: JSON.stringify(payload)
    })
  }

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !editMode || isCancelled || isVerified
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || isCancelled
    },
    {
      key: 'Cancel',
      condition: true,
      onClick: onCancel,
      disabled: !editMode || isPosted || isCancelled
    },
    {
      key: 'FI Trx',
      condition: true,
      onClick: 'onClickIT',
      disabled: !editMode
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      datasetId: ResourceIds.GLPaymentVoucherExpenses,
      onReset,
      disabled: !editMode
    },
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'Verify',
      condition: !isVerified,
      onClick: onVerify,
      disabled: !isPosted
    },
    {
      key: 'Unverify',
      condition: isVerified,
      onClick: onVerify,
      disabled: !isPosted
    }
  ]

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.expenseType,
      name: 'reference',
      props: {
        valueField: 'reference',
        displayField: 'reference',
        displayFieldWidth: 4,
        endpointId: FinancialRepository.ExpenseTypes.snapshot,
        mapping: [
          { from: 'recordId', to: 'etId' },
          { from: 'name', to: 'etName' },
          { from: 'reference', to: 'etRef' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        readOnly: isPosted || isCancelled
      }
    },
    {
      component: 'textfield',
      label: labels.expenseName,
      name: 'etName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'checkbox',
      label: labels.isVAT,
      name: 'isVAT',
      props: {
        disabled: isPosted || isCancelled
      },
      async onChange({ row: { update, newRow } }) {
        if (newRow.isVAT && newRow.amount) {
          let newSubtotal = newRow.amount * (100 / (100 + formik.values.vatPct))
          update({
            subtotal: newSubtotal.toFixed(2),
            vatAmount: (newRow.amount - newSubtotal).toFixed(2)
          })
        } else {
          update({
            subtotal: newRow.amount,
            vatAmount: 0
          })
        }
      }
    },
    {
      component: 'numberfield',
      label: labels.amount,
      name: 'amount',
      props: {
        readOnly: isPosted || isCancelled
      },
      async onChange({ row: { update, newRow } }) {
        if (newRow.isVAT) {
          let newSubtotal = newRow.amount * (100 / (100 + formik.values.vatPct))
          update({
            subtotal: newSubtotal.toFixed(2),
            vatAmount: (newRow.amount - newSubtotal).toFixed(2)
          })
        } else {
          update({
            subtotal: newRow.amount,
            vatAmount: 0
          })
        }
      }
    },
    {
      component: 'numberfield',
      label: labels.vat,
      name: 'vatAmount',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.subtotal,
      name: 'subtotal',
      props: {
        readOnly: true
      }
    },

    {
      component: 'textfield',
      label: labels.vendorName,
      name: 'supplierName',
      props: {
        readOnly: isPosted || isCancelled
      }
    },
    {
      component: 'numberfield',
      label: labels.vatNo,
      name: 'taxRef',
      props: {
        readOnly: isPosted || isCancelled
      }
    },
    {
      component: 'textfield',
      label: labels.notes,
      name: 'notes',
      props: {
        readOnly: isPosted || isCancelled
      }
    },
    {
      component: 'button',
      name: 'hasCostCenters',
      props: {
        imgSrc: require('@argus/shared-ui/src/components/images/buttonsIcons/costCenter.png').default.src
      },
      label: labels.costCenter,
      onClick: (e, row, update, updateRow) => {
        stack({
          Component: ExpensesCostCenters,
          props: {
            maxAccess,
            labels,
            recordId,
            row,
            updateRow,
            readOnly: isPosted || isCancelled
          }
        })
      }
    }
  ]

  const getCostCenters = async (pvId, seqNo) => {
    const res = await getRequest({
      extension: FinancialRepository.PaymentVoucherCostCenters.qry,
      parameters: `_pvId=${pvId}&_seqNo=${seqNo}`
    })

    return res.list.map(item => ({
      ...item,
      id: item.ccSeqNo
    }))
  }

  const getExpenses = async data => {
    const res = await getRequest({
      extension: FinancialRepository.PaymentVoucherExpenses.qry,
      parameters: `_pvId=${data.recordId}`
    })

    const expensesList = await Promise.all(
      res.list.map(async item => {
        const costCenters = await getCostCenters(data.recordId, item.seqNo)

        return {
          ...item,
          id: item.seqNo,
          isVAT: item.vatAmount != 0,
          hasCostCenters: false,
          costCenters: costCenters
        }
      })
    )

    formik.setValues({
      ...data,
      expenses: expensesList
    })
  }

  const subtotalSum = formik.values?.expenses?.reduce((subtotal, row) => {
    const subtotalValue = parseFloat(row.subtotal?.toString().replace(/,/g, '')) || 0

    return subtotal + subtotalValue
  }, 0)

  const vatSum = formik.values?.expenses?.reduce((vatAmount, row) => {
    const vatAmountValue = parseFloat(row.vatAmount?.toString().replace(/,/g, '')) || 0

    return vatAmount + vatAmountValue
  }, 0)

  const amountSum = formik.values?.expenses?.reduce((amount, row) => {
    const amountValue = parseFloat(row.amount?.toString().replace(/,/g, '')) || 0

    return amount + amountValue
  }, 0)

  async function getMultiCurrencyFormData(currencyId, date, rateType, amount) {
    if (currencyId && date && rateType) {
      const res = await getRequest({
        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${currencyId}&_date=${formatDateForGetApI(date)}&_rateDivision=${rateType}`
      })

      const updatedRateRow = getRate({
        amount: amount === 0 ? 0 : amount ?? formik.values.amount,
        exRate: res.record?.exRate,
        baseAmount: 0,
        rateCalcMethod: res.record?.rateCalcMethod,
        dirtyField: DIRTYFIELD_RATE
      })

      formik.setFieldValue('baseAmount', parseFloat(updatedRateRow?.baseAmount).toFixed(2) || 0)
      if (res.record?.exRate) formik.setFieldValue('exRate', res.record?.exRate)
      if (res.record?.rateCalcMethod) formik.setFieldValue('rateCalcMethod', res.record?.rateCalcMethod)
    }
  }
  useEffect(() => {
    ;(async function () {
      await getMultiCurrencyFormData(formik.values.currencyId, formik.values.date, RateDivision.FINANCIALS)
    })()
  }, [])

  function openMCRForm(data) {
    stack({
      Component: MultiCurrencyRateForm,
      props: {
        DatasetIdAccess: ResourceIds.MCRPaymentVoucherExpenses,
        data: {
          ...data,
          amount: amountSum
        },
        onOk: childFormikValues => {
          formik.setValues(prevValues => ({
            ...prevValues,
            ...childFormikValues
          }))
        }
      }
    })
  }

  return (
    <FormShell
      resourceId={ResourceIds.PaymentVoucherExpenses}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      actions={actions}
      functionId={SystemFunction.PaymentVoucher}
      disabledSubmit={isPosted || isCancelled}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_dgId=${SystemFunction.PaymentVoucher}&_startAt=${0}&_pageSize=${50}`}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
                    name='dtId'
                    label={labels.documentType}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    onChange={async (_, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId || null)
                      changeDT(newValue)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.reference}
                    readOnly={editMode}
                    maxAccess={!editMode && maxAccess}
                    maxLength='15'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik.values?.date}
                    required
                    onChange={async (_, newValue) => {
                      formik.setFieldValue('date', newValue)
                      await getMultiCurrencyFormData(formik.values.currencyId, newValue, RateDivision.FINANCIALS)
                    }}
                    onClear={() => formik.setFieldValue('date', null)}
                    readOnly={isPosted || isCancelled}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    valueField='recordId'
                    readOnly={isPosted || isCancelled}
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('plantId', newValue ? newValue?.recordId : '')
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={CashBankRepository.CashAccount.qry}
                    parameters={`_type=0`}
                    name='cashAccountId'
                    readOnly={isCancelled || isPosted}
                    required
                    label={labels.cashAccount}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={async (_, newValue) => {
                      formik.setFieldValue('cashAccountId', newValue?.recordId || null)
                    }}
                    error={formik.touched.cashAccountId && Boolean(formik.errors.cashAccountId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Grid container spacing={1} alignItems='center'>
                    <Grid item xs={8}>
                      <ResourceComboBox
                        endpointId={SystemRepository.Currency.qry}
                        name='currencyId'
                        label={labels.currency}
                        valueField='recordId'
                        required
                        filter={item => item.currencyType === 1}
                        displayField={['reference', 'name']}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' }
                        ]}
                        readOnly={isPosted || isCancelled}
                        values={formik.values}
                        onChange={async (_, newValue) => {
                          await getMultiCurrencyFormData(
                            newValue?.recordId,
                            formik.values.date,
                            RateDivision.FINANCIALS
                          )
                          formik.setFieldValue('currencyId', newValue ? newValue?.recordId : null)
                          formik.setFieldValue('currencyName', newValue?.name)
                        }}
                        error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <CustomButton
                        onClick={() => openMCRForm(formik.values)}
                        image='popup.png'
                        tooltipText={platformLabels.add}
                        disabled={
                          !formik.values.currencyId ||
                          formik.values.currencyId === currencyId
                        }
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    neverPopulate={true}
                    endpointId={FinancialRepository.DescriptionTemplate.qry}
                    name='templateId'
                    label={labels.descriptionTemplate}
                    readOnly={isPosted || isCancelled}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(_, newValue) => {
                      const notes = formik.values.notes || ''
                      if (newValue?.name) formik.setFieldValue('notes', notes === '' ? newValue.name : `${notes}\n${newValue.name}`)
                      formik.setFieldValue('templateId',newValue?.recordId || null)
                    }}
                    error={formik.touched.templateId && Boolean(formik.errors.templateId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <ResourceComboBox
                    datasetId={DataSets.PAYMENT_METHOD}
                    name='paymentMethod'
                    label={labels.paymentMethod}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    required
                    readOnly={isPosted || isCancelled}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('paymentMethod', newValue ? newValue.key : null)
                    }}
                    error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomNumberField
                    name='subtotal'
                    label={labels.subtotal}
                    value={subtotalSum}
                    readOnly
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('subtotal', '')}
                    error={formik.touched.subtotal && Boolean(formik.errors.subtotal)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='checkNo'
                    label={labels.checkNo}
                    value={formik.values.checkNo}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('checkNo', '')}
                    error={formik.touched.checkNo && Boolean(formik.errors.checkNo)}
                    disabled={formik.values.paymentMethod != 3}
                    required={formik.values.paymentMethod == 3}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomNumberField
                    name='vatAmount'
                    label={labels.vat}
                    value={vatSum}
                    readOnly
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('vatAmount', '')}
                    error={formik.touched.vatAmount && Boolean(formik.errors.vatAmount)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={CashBankRepository.CACheckbook.qry}
                    name='checkbookId'
                    label={labels.checkbook}
                    valueField='recordId'
                    displayField={'firstCheckNo'}
                    values={formik.values}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('checkbookId', newValue ? newValue?.recordId : '')
                    }}
                    error={formik.touched.checkbookId && Boolean(formik.errors.checkbookId)}
                    disabled={formik.values.paymentMethod != 3}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomNumberField
                    name='amount'
                    label={labels.amount}
                    value={amountSum}
                    readOnly
                    maxAccess={maxAccess}
                    thousandSeparator={false}
                    onChange={async e => {
                      const updatedRateRow = getRate({
                        amount: e.target.value ?? 0,
                        exRate: formik.values?.exRate,
                        baseAmount: 0,
                        rateCalcMethod: formik.values?.rateCalcMethod,
                        dirtyField: DIRTYFIELD_RATE
                      })
                      formik.setFieldValue('baseAmount', parseFloat(updatedRateRow?.baseAmount).toFixed(2) || 0)
                      formik.setFieldValue('amount', e.target.value)
                    }}
                    onClear={async () => {
                      formik.setFieldValue('amount', 0)
                    }}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    type='text'
                    label={labels.notes}
                    value={formik.values.notes}
                    readOnly={isPosted || isCancelled}
                    rows={3}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('notes', e.target.value)}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <DataGrid
          onChange={value => {
            formik.setFieldValue('expenses', value)
          }}
          value={formik?.values?.expenses}
          error={formik?.errors?.expenses}
          initialValues={formik?.initialValues?.expenses[0]}
          columns={columns}
          allowDelete={!isPosted && !isCancelled}
          allowAddNewLine={!isPosted && !isCancelled}
        />
      </VertLayout>
    </FormShell>
  )
}

FiPaymentVoucherExpensesForm.width = 1300
FiPaymentVoucherExpensesForm.height = 700
