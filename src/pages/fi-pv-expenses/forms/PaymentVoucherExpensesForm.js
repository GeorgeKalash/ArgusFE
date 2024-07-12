import { Box, Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { useFormik } from 'formik'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { DataSets } from 'src/resources/DataSets'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { useWindow } from 'src/windows'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

export default function FiPaymentVoucherExpensesForm({ labels, maxAccess: access, recordId, plantId }) {
  const [itemStore, setItemStore] = useState([])
  const [subtotalSum, setSubtotalSum] = useState(0);
  const [vatSum, setVatSum] = useState(0);
  const [amountSum, setAmountSum] = useState(0);
  const [rowSelectionModel, setRowSelectionModel] = useState([])

  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.PaymentVoucher,
    access: access,
    enabled: !recordId
  })


  const invalidate = useInvalidate({
    endpointId: FinancialRepository.PaymentVouchers.page
  })

  const detailsFormik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      expenses: [
        {
          id: 1,
          pvId: recordId || 0,
          seqNo: 1,
          etId: '',
          subtotal: '',
          vatAmount: '',
          amount: '',
          supplierName: '',
          taxRef: '',
          notes: '',
          vatRate: null,
        }
      ]
    },
    validationSchema: yup.object({
        expenses: yup
          .array()
          .of(
            yup.object().shape({
                pvId: yup.number().required(),
                seqNo: yup.number().required(),
                etId: yup.number().required(),
                subtotal: yup.number().required(),
                amount: yup.number().required(),
                supplierName: yup.string().required(),
                taxRef: yup.string().required(),
                notes: yup.string().required(),
            })
          )
          .required()
      }),
    onSubmit: async obj => {
  
        const updatedRows = detailsFormik.values.rows.map((obj, index) => {
            const seqNo = index + 1

            return {
                ...obj,
                seqNo: seqNo
            }
          
        })
      }
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      accountId: '',
      accountType: 3,
      currencyId: null,
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
      cashAccountId: null,
      dtId: documentType?.dtId,
      status: 1,
      releaseStatus: null,
      plantId: plantId,
      contactId: null,
      isVerified: false,
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      accountType: yup.string().required(),
      currencyId: yup.number().required(),
      date: yup.string().required(),
      paymentMethod: yup.string().required(),
      cashAccountId: yup.string().required(),
      amount: yup.string().required(),
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const data = {
        header: {
            ...obj,
            date: formatDateToApi(obj.date),
            recordId: recordId
        },
        items: [],
        costCenters: []
      }
      try {
        const response = await postRequest({
            extension: FinancialRepository.PaymentVouchers.set2,
            record: JSON.stringify(data)
        })

        !recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)
        const res2 = await getPaymentVouchers(response.recordId)
        res2.record.date = formatDateFromApi(res2.record.date)
        formik.setValues(res2.record)

        invalidate()
      } catch (error) {}
    }
  })

  const isPosted = formik.values.status === 3
  const isCancelled = formik.values.status === -1
  const editMode = !!formik.values.recordId;


  async function getPaymentVouchers(recordId) {
    try {
      return await getRequest({
        extension: FinancialRepository.PaymentVouchers.get,
        parameters: `_recordId=${recordId}`
      })
    } catch (error) {}
  }

  const onPost = async () => {
    try {
        const res = await postRequest({
            extension: FinancialRepository.PaymentVouchers.post,
            record: JSON.stringify(formik.values)
        })

        if (res?.recordId) {
            toast.success(platformLabels.Posted)
            invalidate()
            const res2 = await getPaymentVouchers(res.recordId)
            res2.record.date = formatDateFromApi(res2.record.date)
            formik.setValues(res2.record)
        }
    } catch (exception) {}
  }
  
  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: FinancialRepository.PaymentVouchers.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues({
            ...res.record,
            date: formatDateFromApi(res.record.date)
          })
        }
      } catch (exception) {}
    })()
  }, [])

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.PaymentVoucher,
        recordId: formik.values.recordId
      },
      width: 950,
      title: 'Workflow'
    })
  }

  const onCancel = async () => {
    try {
      const res = await postRequest({
        extension: FinancialRepository.PaymentVouchers.cancel,
        record: JSON.stringify(formik.values)
      })

      if (res?.recordId) {
        toast.success('Record Cancelled Successfully')
        invalidate()
        const res2 = await getPaymentVouchers(res.recordId)
        res2.record.date = formatDateFromApi(res2.record.date)
        formik.setValues(res2.record)
      }
    } catch (e) {}
  }

  const actions = [
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: isPosted || !editMode || isCancelled
    },
    {
      key: 'Cancel',
      condition: true,
      onClick: onCancel,
      disabled: !editMode || isPosted || isCancelled
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
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
  ]

  async function getDefaultVAT() {
    try {
      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: `_filter=&_key=vatPct`
      })
      formik.setFieldValue('vatRate', parseInt(res.record.value))
    } catch (error) {}
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.expenseType,
      name: 'etId',
      props: {
        valueField: 'etId',
        displayField: 'reference',
        displayFieldWidth: 4,
        mapping: [
          { from: 'etId', to: 'etId' },
          { from: 'name', to: 'expenseName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.expenseName,
      name: 'expenseName',
      props: {
        readOnly: true
      }
    },
    {
        component: 'textfield',
        label: labels.subtotal,
        name: 'subtotal',
        props: {
          readOnly: true
        }
    },
    {
        component: 'checkbox',
        label: labels.isVAT,
        name: 'isVAT'
    },
    {
        component: 'textfield',
        label: labels.vatAmount,
        name: 'vatAmount',
        props: {
          readOnly: true
        }
    },
    {
        component: 'numberfield',
        label: labels.amount,
        name: 'amount',
        props: {
          readOnly: true
        }
    },
    {
        component: 'textfield',
        label: labels.vendorName,
        name: 'supplierName',
        props: {
          readOnly: isPosted
        }
    },
    {
        component: 'textfield',
        label: labels.notes,
        name: 'notes',
        props: {
          readOnly: isPosted
        }
    },
  ]

  useEffect(() => {
    recordId && getExpenses(recordId)
  }, [recordId])

  const getExpenses = pvId => {
    const defaultParams = `_pvId=${recordId}`
    var parameters = defaultParams
    getRequest({
      extension: FinancialRepository.PaymentVoucherExpenses.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0)
          formik.setValues({
            expenses: res.list.map(({ ...rest }, index) => ({
              id: index + 1,
              saved: true,
              ...rest
            }))
          })
      })
      .catch(error => {})
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
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={3}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${SystemFunction.PaymentVoucher}&_startAt=${0}&_pageSize=${50}`}
                filter={!editMode ? item => item.activeStatus === 1 : undefined}
                name='dtId'
                label={labels.documentType}
                readOnly={isPosted || isCancelled}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || '')
                  changeDT(newValue)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={3}>
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
                    readOnly={isPosted || isCancelled}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currencyId', newValue ? newValue?.recordId : null)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                />
            </Grid>
            <Grid item xs={3}>
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
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantId', newValue ? newValue?.recordId : '')
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
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
            <Grid item xs={3}>
              <CustomDatePicker
                  name='date'
                  label={labels.date}
                  value={formik.values?.date}
                  required={true}
                  onChange={formik.setFieldValue}
                  onClear={() => formik.setFieldValue('date', '')}
                  readOnly={isPosted || isCancelled}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  helperText={formik.touched.date && formik.errors.date}
                  maxAccess={maxAccess}
                />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                  name='reference'
                  label={labels.reference}
                  value={formik.values.reference}
                  readOnly={isPosted || isCancelled}
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('reference', '')}
                  error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                    endpointId={CashBankRepository.CACheckbook.qry}
                    name='checkbookId'
                    label={labels.checkbook}
                    valueField='recordId'
                    displayField={'firstCheckNo'}
                    values={formik.values}
                    onChange={(event, newValue) => {
                        formik.setFieldValue('checkbookId', newValue ? newValue?.recordId : '');
                    }}
                    error={formik.touched.checkbookId && Boolean(formik.errors.checkbookId)}
                    disabled={formik.values.paymentMethod != 3}
                />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
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
            <Grid item xs={3}>
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
                    onChange={(event, newValue) => {
                        formik.setFieldValue('paymentMethod', newValue?.key);
                        formik.setFieldValue('checkNo', '');
                        formik.setFieldValue('checkbookId', null);
                    }}
                    error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                />
            </Grid>
            <Grid item xs={3}>
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
            <Grid item xs={3}>
                <ResourceComboBox
                    endpointId={FinancialRepository.DescriptionTemplate.qry}
                    name='templateId'
                    label={labels.descriptionTemplate}
                    readOnly={isPosted || isCancelled}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(event, newValue) => {
                        let notes = formik.values.notes
                        notes += newValue?.name && formik.values.notes && '\n'
                        notes += newValue?.name

                        notes && formik.setFieldValue('notes', notes)
                        newValue?.name && formik.setFieldValue('templateId', newValue.recordId)
                    }}
                    error={formik.touched.templateId && Boolean(formik.errors.templateId)}
                    maxAccess={maxAccess}
                />
            </Grid>
            <Grid item xs={3}>
                <CustomTextField
                    name='amount'
                    label={labels.amount}
                    value={amountSum}
                    readOnly
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('amount', '')}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                />
            </Grid>
            <Grid item xs={6}>
                <ResourceLookup
                    endpointId={CashBankRepository.CashAccount.snapshot}
                    parameters={{
                      _type: 0
                    }}
                    name='cashAccountRef'
                    readOnly={isPosted || isCancelled}
                    label={labels.cash}
                    valueField='reference'
                    displayField='name'
                    valueShow='cashAccountRef'
                    secondValueShow='cashAccountName'
                    form={formik}
                    required
                    onChange={(event, newValue) => {
                      formik.setValues({
                          ...formik.values,
                          cashAccountId: newValue?.recordId || '',
                          cashAccountRef: newValue?.reference || '',
                          cashAccountName: newValue?.name || ''
                      })
                    }}
                    errorCheck={'cashAccountId'}
                    maxAccess={maxAccess}
                />
            </Grid>
            <Grid item xs={6}>
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
            <Grid item xs={12}>
                <DataGrid
                    onChange={value => detailsFormik.setFieldValue('expenses', value)}
                    value={detailsFormik.values.expenses}
                    error={detailsFormik.errors.expenses}
                    columns={columns}
                    rowSelectionModel={rowSelectionModel}
                    onSelectionChange={row => {
                        if (row) {
                            setStore(prevStore => ({
                                ...prevStore,
                                pvId: row.pvId,
                                etId: row.etId,
                                subtotal: row.subtotal,
                                vatAmount: row.vatAmount,
                                amount: row.amount,
                                supplierName: row.supplierName,
                                taxRef: row.taxRef,
                                notes: row.notes,
                                vatRate: row.vatRate,
                                _seqNo: row.seqNo
                            }))
                            setRowSelectionModel(row.id)
                        }
                    }}
                />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>      
    </FormShell>
  )
}
