import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
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
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { getStorageData } from 'src/storage/storage'
import { formatDateFromApi } from 'src/lib/date-helper'
import { ControlContext } from 'src/providers/ControlContext'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { useWindow } from 'src/windows'
import NormalDialog from 'src/components/Shared/NormalDialog'
import OTPPhoneVerification from 'src/components/Shared/OTPPhoneVerification'
import PaymentGrid from 'src/components/Shared/PaymentGrid'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import PreviewReport from 'src/components/Shared/PreviewReport'
import { Grow } from 'src/components/Shared/Layouts/Grow'

export default function ReceiptVoucherForm({ labels, access, recordId, cashAccountId, form }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [formikSettings, setFormik] = useState({})
  const [selectedReport, setSelectedReport] = useState(null)

  const { documentType, maxAccess } = useDocumentType({
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
      header: {
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
        otpVerified: false,
        clientId: null,
        cellPhone: null
      },
      cash: formikSettings.initialValuePayment || []
    },

    validationSchema: yup.object({
      header: yup.object({
        owoId: yup.string().required()
      }),
      cash: formikSettings?.paymentValidation
    }),
    onSubmit: async obj => {
      const cash = formik.values.cash.map((cash, index) => ({
        ...cash,
        id: index + 1,
        seqNo: index + 1,
        posStatus: 1,
        cashAccountId: cashAccountId
      }))

      const data = { header: formik.values.header, cash: cash }

      const totalCashAmount = formik.values.cash
        .reduce((sum, current) => sum + parseFloat(current.amount || 0), 0)
        .toFixed(2)

      if (totalCashAmount !== formik.values.header.amount.toFixed(2)) {
        toast.error('The total amount does not match the sum of amounts in the grid.')

        return
      }

      await postRequest({
        extension: RemittanceOutwardsRepository.ReceiptVouchers.set2,
        record: JSON.stringify(data)
      }).then(async res => {
        if (!obj.header.recordId) {
          toast.success(platformLabels.Added)
          const result = await getData(res?.recordId)
          viewOTP(result)
        } else {
          toast.success(platformLabels.Edited)
        }
      })

      invalidate()
    }
  })

  const editMode = !!recordId || !!formik?.values?.header?.recordId
  const isPosted = formik?.values?.header?.status === 3
  const isClosed = formik?.values?.header?.wip === 2
  const isOTPVerified = formik?.values?.header?.otpVerified

  function viewOTP(result) {
    const recordId = result.recordId || formik.values.header.recordId
    stack({
      Component: OTPPhoneVerification,
      props: {
        values: result || formik.values.header,
        recordId: recordId,
        functionId: SystemFunction.RemittanceReceiptVoucher,
        onSuccess: () => {
          onClose(recordId)
        }
      },
      width: 400,
      height: 400,
      title: labels.OTPVerification
    })
  }

  const onClose = recId => {
    const recordId = recId || formik.values.header.recordId

    const data = {
      recordId: recordId
    }
    postRequest({
      extension: RemittanceOutwardsRepository.ReceiptVouchers.close,
      record: JSON.stringify(data)
    }).then(async res => {
      if (res?.recordId) {
        toast.success(platformLabels.Closed)
        invalidate()
        const result = await getData(res?.recordId)
        result.status === 4 && onPost(result)
      }
    })
  }

  const onPost = async result => {
    const data = result || formik.values.header

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

  const getDefaultDT = async () => {
    const userData = getStorageData('userData')

    const _userId = userData.userId

    const { record: plantRecord } = await getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: `_userId=${_userId}&_key=plantId`
    })
    if (plantRecord) {
      formik.setFieldValue('header.plantId', parseInt(plantRecord.value))
    }
  }

  useEffect(() => {
    const initializeValues = async () => {
      await getDefaultDT()
      if (recordId) {
        await getData(recordId)
      } else if (form) {
        formik.setValues(prevValues => ({
          ...prevValues,
          header: {
            ...prevValues.header,
            amount: form.values.amount,
            owoId: form.values.recordId,
            owoRef: form.values.reference,
            clientId: form.values.clientId,
            cellPhone: form.values.cellPhone,
            plantId: form.values.plantId
          }
        }))
      }
    }

    initializeValues()
  }, [recordId, form])

  async function getData(_recordId) {
    const finalRecordId = _recordId || recordId || formik.values.header.recordId
    if (finalRecordId) {
      const res = await getRequest({
        extension: RemittanceOutwardsRepository.ReceiptVouchers.get,
        parameters: `_recordId=${finalRecordId}`
      })

      const result = await getRequest({
        extension: RemittanceOutwardsRepository.OutwardsCash.qry,
        parameters: `_receiptId=${finalRecordId}`
      })
      console.log(res.record)
      formik.setValues({
        header: {
          ...res.record,
          date: formatDateFromApi(res?.record?.date)
        },
        cash: result.list.map((amount, index) => ({
          id: index + 1,
          ...amount
        }))
      })

      return res.record
    }
  }

  async function onReopen() {
    const obj = formik.values

    await postRequest({
      extension: RemittanceOutwardsRepository.ReceiptVouchers.reopen,
      record: JSON.stringify(formik.values.header)
    }).then(res => {
      if (res.recordId) {
        toast.success(platformLabels.Reopened)
        invalidate()
        getData(obj?.recordId)
      }
    })
  }

  function openDialog(recordId) {
    let parts = recordId.split(',')
    let Id = parts[0]
    let Reference = parts[1]
    stack({
      Component: NormalDialog,
      props: {
        DialogText: `${platformLabels.Posted} ${Reference}`,
        bottomSection: (
          <Fixed>
            <WindowToolbar
              previewReport={true}
              onGenerateReport={() =>
                stack({
                  Component: PreviewReport,
                  props: {
                    selectedReport: selectedReport,
                    recordId: Id,
                    functionId: SystemFunction.OutwardsTransfer,
                    resourceId: ResourceIds.OutwardsTransfer
                  },
                  width: 1150,
                  height: 700,
                  title: platformLabels.PreviewReport
                })
              }
              setSelectedReport={setSelectedReport}
            />
          </Fixed>
        ),
        width: 600,
        height: 200,
        title: platformLabels.Post
      }
    })
  }

  const actions = [
    {
      key: 'Post',
      condition: true,
      onClick: e => onPost(e.target.value),
      disabled: isPosted || !editMode || !isOTPVerified || !isClosed
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: e => onClose(e.target.value),
      disabled: isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || !editMode || formik?.values?.header?.releaseStatus === 3
    },
    {
      key: 'OTP',
      condition: true,
      onClick: viewOTP,
      disabled: !editMode
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      disabled: !editMode
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
      disabledSubmit={isPosted || isClosed}
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
                    value={formik?.values?.header?.reference}
                    readOnly={editMode}
                    maxAccess={!editMode && maxAccess}
                    maxLength='30'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    readOnly={true}
                    value={formik?.values?.header?.date}
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
                    formObject={formik.values.header}
                    readOnly={isPosted}
                    required
                    maxAccess={maxAccess}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'amount', value: 'Amount' }
                    ]}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.owoId', newValue ? newValue.recordId : '')
                      formik.setFieldValue('header.owoRef', newValue ? newValue.reference : '')

                      formik.setFieldValue('header.amount', newValue ? newValue.amount : '')
                      formik.setFieldValue('header.clientId', newValue ? newValue.clientId : '')
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomNumberField
                    name='amount'
                    label={labels.amount}
                    value={formik?.values?.header?.amount}
                    readOnly={true}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('header.amount', e.target.value)}
                    onClear={() => {
                      formik.setFieldValue('header.amount', '')
                      if (!formik?.values?.header?.fcAmount) {
                        handleSelectedProduct(null, true)
                        formik.setFieldValue('header.products', [])
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
          <PaymentGrid
            onChange={value => formik.setFieldValue('cash', value)}
            value={formik.values.cash}
            error={formik.errors.cash}
            labels={labels}
            maxAccess={maxAccess}
            allowDelete={!isPosted}
            allowAddNewLine={!isPosted}
            amount={formik.values.header.amount}
            setFormik={setFormik}
            name='cash'
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
