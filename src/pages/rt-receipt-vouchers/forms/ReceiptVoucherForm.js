import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useForm } from 'src/hooks/form'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { SystemFunction } from 'src/resources/SystemFunction'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { DataSets } from 'src/resources/DataSets'
import { getStorageData } from 'src/storage/storage'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { ControlContext } from 'src/providers/ControlContext'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useWindow } from 'src/windows'
import POSForm from './POSForm'
import NormalDialog from 'src/components/Shared/NormalDialog'
import OTPPhoneVerification from 'src/components/Shared/OTPPhoneVerification'

export default function ReceiptVoucherForm({ labels, access, recordId, cashAccountId, form }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.RemittanceReceiptVoucher,
    access: access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.ReceiptVouchers.page
  })

  const { formik } = useForm({
    maxAccess: maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      recordId: null,
      plantId: null,
      reference: '',
      accountId: null,
      date: new Date(),
      dtId: documentType?.dtId,
      amount: null,
      owoId: null,
      owoRef: '',
      status: 1,
      wip: null,
      otpVertified: false,
      clientId: null,
      cash: [
        {
          id: 1,
          seqNo: 0,
          cashAccountId: cashAccountId,
          cashAccount: '',
          posStatus: 1,
          posStatusName: '',
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
      owoId: yup.string().required(),
      cash: yup
        .array()
        .of(
          yup.object().shape({
            type: yup
              .string()
              .required('Type is required')
              .test('unique', 'Type must be unique', function (value) {
                const { options } = this
                if (!this.parent.outwardId) {
                  const arrayOfTypes = options.context.cash.map(row => row.type)
                  if (value == 2) {
                    const countOfType1 = arrayOfTypes.filter(item => item === '2').length
                    if (countOfType1 > 1) {
                      return false
                    }
                  }
                }

                return true
              }),
            paidAmount: yup.string().test('Paid Amount', 'Paid Amount is required', function (value) {
              if (this.parent.type == '2') {
                return !!value
              }

              return true
            }),
            returnedAmount: yup.string().test('Returned Amount', 'Returned Amount is required', function (value) {
              if (this.parent.type == '2') {
                return !!value
              }

              return true
            }),
            amount: yup.string().nullable().required('Amount is required')
          })
        )

        .required('Cash array is required')
    }),
    onSubmit: async obj => {
      const header = {
        recordId: formik.values.recordId,
        plantId: formik.values.plantId,
        reference: formik.values.reference,
        accountId: formik.values.accountId,
        date: formatDateToApi(formik.values.date),
        dtId: formik.values.dtId,
        amount: formik.values.amount,
        owoId: formik.values.owoId,
        status: formik.values.status,
        otpVertified: formik.values.otpVertified
      }

      const cash = formik.values.cash.map((cash, index) => ({
        ...cash,
        id: index + 1,
        seqNo: index + 1,
        posStatus: 1,
        cashAccountId: cashAccountId
      }))

      const data = { header: header, cash: cash }

      const totalCashAmount = formik.values.cash
        .reduce((sum, current) => sum + parseFloat(current.amount || 0), 0)
        .toFixed(2)

      if (totalCashAmount !== formik.values.amount.toFixed(2)) {
        toast.error('The total amount does not match the sum of amounts in the grid.')

        return
      }

      const response = await postRequest({
        extension: RemittanceOutwardsRepository.ReceiptVouchers.set2,
        record: JSON.stringify(data)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
        getData(response.recordId)
      } else {
        toast.success(platformLabels.Edited)
      }
      invalidate()
    }
  })

  const editMode = !!recordId || !!formik.values.recordId
  const isPosted = formik.values.status === 3
  const isClosed = formik.values.wip === 2

  const getDefaultDT = async () => {
    const userData = getStorageData('userData')

    const _userId = userData.userId

    const { record: plantRecord } = await getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: `_userId=${_userId}&_key=plantId`
    })
    if (plantRecord) {
      formik.setFieldValue('plantId', parseInt(plantRecord.value))
    }
  }

  useEffect(() => {
    getDefaultDT()
    ;(async function () {
      recordId && getData()
      form &&
        formik.setValues({
          ...formik.values,
          amount: form.values.amount,
          owoId: form.values.recordId,
          owoRef: form.values.reference,
          clientId: formik.values.clientId
        })
    })()
  }, [recordId])

  async function getData(_recordId) {
    const finalRecordId = _recordId || recordId || formik.values.recordId
    if (finalRecordId) {
      const res = await getRequest({
        extension: RemittanceOutwardsRepository.ReceiptVouchers.get,
        parameters: `_recordId=${finalRecordId}`
      })

      const result = await getRequest({
        extension: RemittanceOutwardsRepository.OutwardsCash.qry,
        parameters: `_receiptId=${finalRecordId}`
      })

      formik.setValues({
        ...res.record,
        date: formatDateFromApi(res.record.date),
        cash: result.list.map((amount, index) => ({
          id: index + 1,
          ...amount
        }))
      })
    }
  }

  const onPost = async () => {
    const data = {
      recordId: formik.values.recordId,
      plantId: formik.values.plantId,
      reference: formik.values.reference,
      accountId: formik.values.accountId,
      date: formatDateToApi(formik.values.date),
      dtId: formik.values.dtId,
      amount: formik.values.amount,
      owoId: formik.values.owoId,
      status: formik.values.status
    }

    const totalCashAmount = formik.values.cash
      .reduce((sum, current) => sum + parseFloat(current.amount || 0), 0)
      .toFixed(2)

    if (totalCashAmount !== formik.values.amount.toFixed(2)) {
      toast.error('The total amount does not match the sum of amounts in the grid.')

      return
    }

    const res = await postRequest({
      extension: RemittanceOutwardsRepository.ReceiptVouchers.post,
      record: JSON.stringify(data)
    })

    if (res) {
      toast.success(platformLabels.Posted)
      openDialog(res.recordId)
      invalidate()
      getData()
    }
  }

  const onClose = () => {
    const data = {
      recordId: formik.values.recordId
    }
    postRequest({
      extension: RemittanceOutwardsRepository.ReceiptVouchers.close,
      record: JSON.stringify(data)
    }).then(res => {
      if (res?.recordId) {
        toast.success(platformLabels.Closed)
        invalidate()
        getData(res?.recordId)
      }
    })
  }

  function viewOTP() {
    stack({
      Component: OTPPhoneVerification,
      props: {
        formValidation: formik,
        recordId: formik.values.recordId,
        functionId: SystemFunction.RemittanceReceiptVoucher,
        onSuccess: () => {
          onClose(formik.values.recordId)
        }
      },
      width: 400,
      height: 400,
      title: labels.OTPVerification
    })
  }

  async function onReopen() {
    const obj = formik.values

    const data = {
      recordId: formik.values.recordId,
      reference: formik.values.reference,
      date: formatDateToApi(formik.values.date),
      plantId: formik.values.plantId,
      wip: formik.values.wip,
      amount: formik.values.amount,
      owoId: formik.values.owoId
    }

    const res = await postRequest({
      extension: RemittanceOutwardsRepository.ReceiptVouchers.reopen,
      record: JSON.stringify(data)
    }).then(res => {
      if (res.recordId) {
        toast.success(platformLabels.Reopened)
        invalidate()
        getData(obj?.recordId)
      }
    })
  }

  function openDialog(recordId) {
    stack({
      Component: NormalDialog,
      props: {
        DialogText: `${platformLabels.Posted} ${recordId}`
      },
      width: 600,
      height: 200,
      title: platformLabels.Post
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
        ],
        readOnly: isPosted
      },
      async onChange({ row: { update, newRow } }) {
        const sumAmount = formik.values.cash.slice(0, -1).reduce((sum, row) => {
          const curValue = parseFloat(row.amount.toString().replace(/,/g, '')) || 0

          return sum + curValue
        }, 0)
        const currentAmount = (parseFloat(formik.values.amount) - parseFloat(sumAmount)).toFixed(2)
        update({ amount: currentAmount, POS: newRow.type === '1' })
      }
    },
    {
      component: 'numberfield',
      name: 'paidAmount',
      label: labels.paidAmount,
      defaultValue: '',
      async onChange({ row: { update, newRow } }) {
        const sumAmount = formik.values.cash.slice(0, -1).reduce((sum, row) => {
          const curValue = parseFloat(row.amount.toString().replace(/,/g, '')) || 0

          return sum + curValue
        }, 0)

        let rowAmount
        let returnedAmount

        if (formik.values.cash.length === 1) {
          rowAmount = newRow.paidAmount > sumAmount ? newRow.paidAmount : sumAmount - newRow.paidAmount
          returnedAmount = (parseFloat(newRow.paidAmount) - parseFloat(formik.values.amount)).toFixed(2)
        } else {
          const remainingAmount = (parseFloat(formik.values.amount) - parseFloat(sumAmount)).toFixed(2)
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
      defaultValue: '',
      props: {
        readOnly: isPosted
      }
    },
    {
      component: 'numberfield',
      header: labels.bankFees,
      name: 'bankFees',
      label: labels.bankFees,
      props: {
        readOnly: isPosted
      }
    },
    {
      component: 'textfield',
      header: labels.receiptRef,
      name: 'receiptRef',
      label: labels.receiptRef,
      props: {
        readOnly: isPosted
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.posStatusName,
      name: 'posStatusName',
      props: {
        readOnly: true,
        datasetId: DataSets.RT_POSSTATUS,
        displayField: 'value',
        valueField: 'key',
        mapping: [
          { from: 'value', to: 'posStatusName' },
          { from: 'key', to: 'posStatus' }
        ]
      }
    },
    {
      component: 'button',
      name: 'POS',
      label: labels.POS,
      onClick: (e, row, update, updateRow) => {
        stack({
          Component: POSForm,
          props: {},
          width: 700,
          title: labels.POS
        })
      }
    }
  ]

  const actions = [
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: isPosted || !editMode
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || !editMode || formik.values.releaseStatus === 3
    },
    {
      key: 'OTP',
      condition: true,
      onClick: viewOTP,
      disabled: false
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.RemittanceReceiptVoucher}
      functionId={SystemFunction.RemittanceReceiptVoucher}
      form={formik}
      actions={actions}
      maxAccess={maxAccess}
      editMode={editMode}
      disabledSubmit={isPosted}
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
                    readOnly={true}
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
                    endpointId={RemittanceOutwardsRepository.OutwardsOrder.snapshot}
                    valueField='reference'
                    name='owoId'
                    label={labels.outwards}
                    form={formik}
                    secondDisplayField={false}
                    valueShow='owoRef'
                    readOnly={isPosted}
                    required
                    maxAccess={maxAccess}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'amount', value: 'Amount' }
                    ]}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('owoId', newValue ? newValue.recordId : '')
                      formik.setFieldValue('amount', newValue ? newValue.amount : '')
                      formik.setFieldValue('clientId', newValue ? newValue.clientId : '')
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomNumberField
                    name='amount'
                    label={labels.amount}
                    value={formik.values.amount}
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
          <DataGrid
            onChange={value => formik.setFieldValue('cash', value)}
            value={formik.values.cash}
            error={formik.errors.cash}
            maxAccess={maxAccess}
            allowDelete={!isPosted}
            allowAddNewLine={!isPosted}
            columns={columns}
            name='cash'
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
