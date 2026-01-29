import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
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
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { DIRTYFIELD_RATE, getRate } from '@argus/shared-utils/src/utils/RateCalculator'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import ExpensesCostCenters from '@argus/shared-ui/src/components/Shared/ExpensesCostCenters'
import ConfirmationDialog from '@argus/shared-ui/src/components/ConfirmationDialog'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

export default function PaymentOrdersExpensesForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.PaymentOrderExpenses,
    editMode: !!recordId
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.PaymentOrder,
    access,
    enabled: !recordId
  })

  useSetWindow({ title: labels.PaymentOrderExpenses, window })

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.PaymentOrders.page3
  })

  const plantId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value)
  const currencyId = parseInt(defaultsData?.list?.find(obj => obj.key === 'currencyId')?.value)
  const cashAccountId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'cashAccountId')?.value)

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId, reference: documentType?.reference },
    initialValues: {
      recordId: null,
      reference: '',
      accountType: 3,
      currencyId: parseInt(currencyId),
      paymentMethod: null,
      date: new Date(),
      amount: null,
      notes: '',
      subTotal: null,
      exRate: 1,
      rateCalcMethod: 1,
      baseAmount: null,
      dtId: null,
      status: 1,
      releaseStatus: null,
      cashAccountId: parseInt(cashAccountId),
      plantId: parseInt(plantId),
      expenses: [
        {
          id: 1,
          pvId: recordId || 0,
          seqNo: 1,
          etId: '',
          subTotal: null,
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
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      accountType: yup.number().required(),
      currencyId: yup.number().required(),
      date: yup.date().required(),
      paymentMethod: yup.number().required(),
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
        header: {
          ...obj,
          date: formatDateToApi(obj.date),
          amount: totalAmount,
          baseAmount: totalAmount
        },
        items: updatedRows,
        costCenters: costCentersValues
      }

      const response = await postRequest({
        extension: FinancialRepository.PaymentOrders.set2,
        record: JSON.stringify(payload)
      })

      !obj.recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)
      getPaymentOrder(response.recordId)
      invalidate()
    }
  })

  const totalAmount = formik.values?.expenses?.reduce((amount, row) => {
    const amountValue = parseFloat(row.amount?.toString().replace(/,/g, '')) || 0

    return amount + amountValue
  }, 0)

  const getCashAccountAndPayment = async cashAccountId => {
    if (cashAccountId) {
      const { record: cashAccountResult } = await getRequest({
        extension: CashBankRepository.CbBankAccounts.get,
        parameters: `_recordId=${cashAccountId}`
      })
      formik.setFieldValue('cashAccountId', cashAccountResult?.recordId || null)
      formik.setFieldValue('cashAccountRef', cashAccountResult.reference || '')
      formik.setFieldValue('cashAccountName', cashAccountResult.name || '')

      return cashAccountResult.paymentMethod
    } else {
      return null
    }
  }

  const isCancelled = formik.values.status === -1
  const isClosed = formik.values.wip == 2
  const editMode = !!formik.values.recordId

  async function getPaymentOrder(recordId) {
    const res = await getRequest({
      extension: FinancialRepository.PaymentOrders.get,
      parameters: `_recordId=${recordId}`
    })

    const res2 = await getRequest({
      extension: FinancialRepository.PaymentOrdersExpenses.qry2,
      parameters: `_poId=${recordId}`
    })

    const expensesList = await Promise.all(
      res2?.list?.map(async item => {
        const costCenters = await getCostCenters(recordId, item.seqNo)

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
      ...res.record,
      date: formatDateFromApi(res.record.date),
      expenses: expensesList
    })

    return res.record
  }

  async function getDTD(dtId) {
    if (dtId) {
      const res = await getRequest({
        extension: FinancialRepository.FIDocTypeDefaults.get,
        parameters: `_dtId=${dtId}`
      })

      formik.setFieldValue('plantId', res?.record?.plantId || plantId || null)
      const payment = await getCashAccountAndPayment(res?.record?.cashAccountId || cashAccountId)
      formik.setFieldValue('paymentMethod', res?.record?.paymentMethod || payment || null)
    }
  }

  useEffect(() => {
    if (formik.values?.dtId && !recordId) getDTD(formik.values?.dtId)
  }, [formik.values?.dtId])

  useEffect(() => {
    ;(async function () {
      await getDefaultVAT()
      if (recordId) {
        await getPaymentOrder(recordId)
      } else {
        getCashAccountAndPayment(cashAccountId)
      }
    })()
  }, [])

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.PaymentOrder,
        recordId: formik.values.recordId
      },
      width: 950,
      title: labels.WorkFlow
    })
  }

  const onCancel = async () => {
    const res = await postRequest({
      extension: FinancialRepository.PaymentOrders.cancel,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Cancelled)
    invalidate()
    getPaymentOrder(res.recordId)
  }

  const onClose = async () => {
    const res = await postRequest({
      extension: FinancialRepository.PaymentOrders.close,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Closed)
    invalidate()
    getPaymentOrder(res.recordId)
  }

  const subTotalSum = formik.values?.expenses?.reduce((subTotal, row) => {
    const subTotalValue = parseFloat(row.subTotal?.toString().replace(/,/g, '')) || 0

    return subTotal + subTotalValue
  }, 0)

  const onReopen = async () => {
    const res = await postRequest({
      extension: FinancialRepository.PaymentOrders.reopen,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Reopened)
    invalidate()
    getPaymentOrder(res.recordId)
  }

  const getCostCenters = async (pvId, seqNo) => {
    const res = await getRequest({
      extension: FinancialRepository.PaymentOrdersCostCenters.qry,
      parameters: `_poId=${pvId}&_seqNo=${seqNo}`
    })

    return res?.list?.map(item => ({
      ...item,
      id: item.ccSeqNo
    }))
  }

  function onCancelConf() {
    stack({
      Component: ConfirmationDialog,
      props: {
        DialogText: platformLabels.CancelConf,
        okButtonAction: onCancel,
        fullScreen: false,
        close: true
      },
      width: 400,
      height: 150,
      title: platformLabels.Confirmation
    })
  }

  const actions = [
    {
      key: 'Cancel',
      condition: true,
      onClick: onCancelConf,
      disabled: !editMode || isCancelled || isClosed
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
      key: 'Attachment',
      condition: true,
      onClick: 'onClickAttachment',
      disabled: !editMode
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode || isCancelled
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || isCancelled
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    }
  ]

  const vatSum = formik?.values?.expenses?.reduce((vatAmount, row) => {
    const vatAmountValue = parseFloat(row.vatAmount?.toString().replace(/,/g, '')) || 0

    return vatAmount + vatAmountValue
  }, 0)

  async function getDefaultVAT() {
    const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: `_filter=&_key=vatPct`
    })

    formik.setFieldValue('vatPct', parseInt(res.record.value) ?? 0)

    return parseInt(res.record.value) ?? 0
  }

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
        readOnly: isCancelled || isClosed
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
        disabled: isCancelled || isClosed
      },
      async onChange({ row: { update, newRow } }) {
        if (newRow.isVAT) {
          const vatPct = await getDefaultVAT()

          if (!newRow.amount) {
            return
          }

          let newSubtotal = (newRow?.amount || 0) * (100 / (100 + (vatPct || 0))) || 0
          update({
            subTotal: parseFloat(newSubtotal || 0).toFixed(2),
            vatAmount: (parseFloat(newRow?.amount || 0) - parseFloat(newSubtotal || 0)).toFixed(2)
          })
        } else {
          update({
            subTotal: parseFloat(newRow.amount || 0),
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
        readOnly: isCancelled
      },
      async onChange({ row: { update, newRow } }) {
        if (newRow.isVAT) {
          let newsubTotal = parseFloat(newRow.amount || 0) * (100 / (100 + formik.values.vatPct || 0))
          update({
            subTotal: parseFloat(newsubTotal || 0).toFixed(2),
            vatAmount: (parseFloat(newRow.amount || 0) - parseFloat(newsubTotal || 0)).toFixed(2)
          })
        } else {
          update({
            subTotal: parseFloat(newRow.amount || 0),
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
      name: 'subTotal',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.vendorName,
      name: 'supplierName',
      props: {
        readOnly: isCancelled
      }
    },
    {
      component: 'numberfield',
      label: labels.vatNo,
      name: 'taxRef',
      props: {
        readOnly: isCancelled
      }
    },
    {
      component: 'textfield',
      label: labels.notes,
      name: 'notes',
      props: {
        readOnly: isCancelled
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
            readOnly: isCancelled || isClosed
          },
          width: 700,
          height: 600,
          title: labels.costCenter
        })
      }
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.PaymentOrderExpenses}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      actions={actions}
      functionId={SystemFunction.PaymentOrder}
      disabledSubmit={isCancelled || isClosed}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_dgId=${SystemFunction.PaymentOrder}&_startAt=${0}&_pageSize=${50}`}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
                    name='dtId'
                    label={labels.documentType}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={async (_, newValue) => {
                      await changeDT(newValue)
                      formik.setFieldValue('dtId', newValue?.recordId || null)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='currencyId'
                    label={labels.currency}
                    filter={item => item.currencyType === 1}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    readOnly={isClosed || isCancelled}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    datasetId={DataSets.FI_PV_GROUP_TYPE}
                    name='accountType'
                    filter={item => item.key == 3}
                    label={labels.accountType}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    required
                    readOnly
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('accountType', newValue?.key || null)
                    }}
                    error={formik.touched.accountType && Boolean(formik.errors.accountType)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik.values.date}
                    required
                    onChange={(e, newValue) => {
                      formik.setFieldValue('date', newValue)
                    }}
                    onClear={() => formik.setFieldValue('date', null)}
                    readOnly={isClosed || isCancelled}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    datasetId={DataSets.PAYMENT_METHOD}
                    name='paymentMethod'
                    label={labels.paymentMethod}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    required
                    readOnly={isClosed || isCancelled}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      if (!newValue?.key) {
                        formik.setFieldValue('cashAccountId', '')
                      }
                      formik.setFieldValue('paymentMethod', newValue?.key || null)
                    }}
                    error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    valueField='recordId'
                    readOnly={isClosed || isCancelled}
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantId', newValue?.recordId || null)
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={CashBankRepository.CashAccount.qry}
                    parameters={`_type=0`}
                    name='cashAccountId'
                    readOnly={isClosed || isCancelled}
                    label={labels.cashAccount}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('cashAccountId', newValue?.recordId || null)
                    }}
                    error={formik.touched.cashAccountId && Boolean(formik.errors.cashAccountId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
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
                  <CustomNumberField
                    name='subTotal'
                    label={labels.subtotal}
                    value={subTotalSum}
                    readOnly
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('subTotal', '')}
                    error={formik.touched.subTotal && Boolean(formik.errors.subTotal)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomNumberField
                    name='amount'
                    label={labels.amount}
                    maxLength={'10'}
                    decimalScale={2}
                    readOnly
                    value={totalAmount}
                    maxAccess={maxAccess}
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
                    onClear={() => {
                      formik.setFieldValue('amount', '')
                    }}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    neverPopulate={true}
                    endpointId={FinancialRepository.DescriptionTemplate.qry}
                    name='templateId'
                    label={labels.descriptionTemplate}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(_, newValue) => {
                      const notes = formik.values.notes || ''
                      if (newValue?.name) formik.setFieldValue('notes', notes === '' ? newValue.name : `${notes}\n${newValue.name}`)
                      formik.setFieldValue('templateId',newValue?.recordId || null)
                    }}
                    readOnly={isClosed || isCancelled}
                    error={formik.touched.templateId && Boolean(formik.errors.templateId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    type='text'
                    label={labels.notes}
                    value={formik.values.notes}
                    rows={3}
                    readOnly={isClosed || isCancelled}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('notes', '')}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <DataGrid
          onChange={value => formik.setFieldValue('expenses', value)}
          value={formik.values.expenses}
          error={formik.errors.expenses}
          initialValues={formik?.initialValues?.expenses[0]}
          columns={columns}
          allowDelete={!isClosed && !isCancelled}
          allowAddNewLine={!isClosed && !isCancelled}
        />
      </VertLayout>
    </FormShell>
  )
}

PaymentOrdersExpensesForm.width = 1300
PaymentOrdersExpensesForm.height = 700
