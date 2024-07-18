import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
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
import ExpensesCostCenters from 'src/components/Shared/ExpensesCostCenters'

export default function FiPaymentVoucherExpensesForm({ labels, maxAccess: access, recordId, plantId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.PaymentVoucher,
    access,
    enabled: !recordId
  })

  const initialValues =  {
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
        hasCostCenters: true,
        costCenters: []
      },  
    ],
  }

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.PaymentVouchers.page
  })


  const { formik } = useForm({
    initialValues,
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
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
              amount: yup.number().required(),
            })
          )
          .required()
    }),
    onSubmit: async obj => {
      const copy = { ...obj }
      delete copy.expenses
      copy.date = formatDateToApi(copy.date)
      copy.amount = totalAmount
      copy.baseAmount = totalAmount
      const costCentersValues = [];

      const updatedRows = formik.values.expenses.map((expensesDetails, index) => {
        const { costCenters, ...restDetails } = expensesDetails;
        if (costCenters) {
          costCentersValues.push(...costCenters);
        }

        return {
          ...restDetails,
          seqNo: index + 1,
          pvId: formik.values.recordId || 0,
        };
      });

      const data = {
        header: copy,
        items: updatedRows,
        costCenters: costCentersValues,
      }
      try {
        const response = await postRequest({
            extension: FinancialRepository.PaymentVouchers.set2,
            record: JSON.stringify(data)
        })

        !recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)
        const res2 = await getPaymentVouchers(response.recordId)
        res2.record.date = formatDateFromApi(res2.record.date)
        await getExpenses(res2.record)
        invalidate()
      } catch (error) {}
    }
  })


  const totalAmount = formik.values?.expenses?.reduce((amount, row) => {
    const amountValue = parseFloat(row.amount?.toString().replace(/,/g, '')) || 0

    return amount + amountValue
  }, 0)

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

      toast.success(platformLabels.Posted)
      invalidate()
      const res2 = await getPaymentVouchers(res.recordId)
      res2.record.date = formatDateFromApi(res2.record.date)
      await getExpenses(res2.record)
      
    } catch (exception) {}
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getPaymentVouchers(recordId)
        res.record.date = formatDateFromApi(res.record.date)
        await getExpenses(res.record)

      }
      await getDefaultVAT()
    })()
  }, [])

  async function getDefaultVAT() {
    try {
      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: `_filter=&_key=vatPct`
      });

      const vatPctValue = parseInt(res.record.value);
      formik.setFieldValue('vatPct', vatPctValue);
    } catch (error) {}
  }

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

        toast.success('Record Cancelled Successfully')
        invalidate()
        const res2 = await getPaymentVouchers(res.recordId)
        res2.record.date = formatDateFromApi(res2.record.date)
        await getExpenses(res2.record)
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
        name: 'isVAT',
        props: {
          disabled: isPosted || isCancelled
        },
        async onChange({ row: { update, newRow } }) {
          if (newRow.isVAT && newRow.amount) {
            let newSubtotal = newRow.amount * (100 / (100 + formik.values.vatPct));
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
        component: 'textfield',
        label: labels.vat,
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
          readOnly: isPosted || isCancelled
        },
        async onChange({ row: { update, newRow } }) {
          if (newRow.isVAT) {
            let newSubtotal = newRow.amount * (100 / (100 + formik.values.vatPct));
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
        component: 'textfield',
        label: labels.vendorName,
        name: 'supplierName',
        props: {
          readOnly: isPosted || isCancelled
        }
    },
    {
      component: 'textfield',
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
      img: 'costCenters',
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
          },
          width: 700,
          height: 600,
          title: labels.costCenter
        })
      }
    }
  ]

  const getCostCenters = async (pvId, seqNo) => {
    try {
      const res = await getRequest({
        extension: FinancialRepository.PaymentVoucherCostCenters.qry,
        parameters: `_pvId=${pvId}&_seqNo=${seqNo}`
      });
    
      return res.list.map(item => ({
        ...item,
        id: item.ccSeqNo,
      }));
    } catch (exception) {}
  };
  
  const getExpenses = async (data) => {
    try {
      const res = await getRequest({
        extension: FinancialRepository.PaymentVoucherExpenses.qry,
        parameters: `_pvId=${data.recordId}`
      });

      const expensesList = await Promise.all(
        res.list.map(async item => {
          const costCenters = await getCostCenters(data.recordId, item.seqNo);
    
          return {
            ...item,
            id: item.seqNo,
            isVAT: item.vatAmount != 0,
            hasCostCenters: true,
            costCenters: costCenters 
          };
        })
      )

      formik.setValues({
        ...data,
        expenses: expensesList
      })
    } catch (exception) {}
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
                    required
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
                        formik.setFieldValue('paymentMethod', newValue ? newValue.key : null);
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
                      formik.setFieldValue('cashAccountId', newValue ? newValue.recordId : null);
                      formik.setFieldValue('cashAccountRef', newValue ? newValue.reference : null);
                      formik.setFieldValue('cashAccounName', newValue ? newValue.name : null);
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
          </Grid>
          <DataGrid
            onChange={value => {
              const updatedExpenses = value.map(expense => ({
                ...expense,
                hasCostCenters: true
              }))
            
              formik.setFieldValue('expenses', updatedExpenses);
            }}
            value={formik?.values?.expenses}
            error={formik?.errors?.expenses}
            columns={columns}
            allowDelete={!isPosted && !isCancelled}
            allowAddNewLine={!isPosted && !isCancelled}
          />
        </Grow>
      </VertLayout>      
    </FormShell>
  )
}