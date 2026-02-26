import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { RemittanceOutwardsRepository } from '@argus/repositories/src/repositories/RemittanceOutwardsRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { getStorageData } from '@argus/shared-domain/src/storage/storage'
import { formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import NormalDialog from '@argus/shared-ui/src/components/Shared/NormalDialog'
import OTPPhoneVerification from '@argus/shared-ui/src/components/Shared/OTPPhoneVerification'
import PaymentGrid from '@argus/shared-ui/src/components/Shared/PaymentGrid'
import WindowToolbar from '@argus/shared-ui/src/components/Shared/WindowToolbar'
import PreviewReport from '@argus/shared-ui/src/components/Shared/PreviewReport'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const ReceiptVoucherForm = ({ recordId, cashAccountId, form = null, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [formikSettings, setFormik] = useState({})
  const [selectedReport, setSelectedReport] = useState(null)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.RemittanceReceiptVoucher,
    editMode: !!recordId
  })

  useSetWindow({ title: labels.receiptVoucher, window })

  const { documentType, maxAccess } = useDocumentType({
    functionId: SystemFunction.RemittanceReceiptVoucher,
    access: access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.ReceiptVouchers.page
  })

  const { formik } = useForm({
    maxAccess: maxAccess,
    documentType: { key: 'header.dtId', value: documentType?.dtId },
    validateOnChange: true,
    initialValues: {
      recordId,
      header: {
        recordId,
        plantId: null,
        reference: '',
        accountId: null,
        date: new Date(),
        dtId: null,
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
      if (!form) {
        invalidate()
      }
    }
  })

  const editMode = !!recordId || !!formik?.values?.header?.recordId
  const isPosted = formik?.values?.header?.status === 3
  const isClosed = formik?.values?.header?.wip === 2
  const isOTPVerified = formik?.values?.header?.otpVerified

  function viewOTP(result) {
    const recordId = result?.recordId || formik.values.header.recordId
    stack({
      Component: OTPPhoneVerification,
      props: {
        values: result || formik.values.header,
        recordId,
        deviceId: (result?.cellPhone || formik?.values?.header?.cellPhone)?.replace(/^\+/, '') || null,
        functionId: SystemFunction.RemittanceReceiptVoucher,
        onSuccess: () => {
          onClose(recordId)
        }
      }
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
            amount: form.amount,
            owoId: form.recordId,
            owoRef: form.reference,
            clientId: form.clientId,
            cellPhone: form.cellPhone,
            plantId: form.plantId
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
      formik.setValues({
        recordId: _recordId,
        header: {
          ...res.record,
          date: formatDateFromApi(res?.record?.date)
        },
        cash:
          result?.list?.length != 0
            ? result.list.map((item, index) => ({
                id: index + 1,
                pos: item?.type != 3,
                ...item
              }))
            : formik.initialValues.cash
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
                  }
                })
              }
              recordId={Id}
              resourceId={ResourceIds.OutwardsTransfer}
              setSelectedReport={setSelectedReport}
            />
          </Fixed>
        ),
        title: platformLabels.Post
      }
    })
  }

  const actions = [
    {
      key: 'Locked',
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
      onClick: () => {
        viewOTP(null)
      },
      disabled: !editMode || formik?.values?.header?.status == 3
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      datasetId: ResourceIds.GLRemittanceReceiptVoucher,
      valuesPath: formik.values.header,
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
                    name='header.reference'
                    label={labels.reference}
                    value={formik?.values?.header?.reference}
                    readOnly={editMode}
                    maxAccess={!editMode && maxAccess}
                    maxLength='30'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomDatePicker
                    name='header.date'
                    label={labels.date}
                    readOnly={true}
                    value={formik?.values?.header?.date}
                    maxAccess={maxAccess}
                    error={formik.touched.header?.date && Boolean(formik.errors.header?.date)}
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
                    name='header.owoId'
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
                    errorCheck={'header.owoId'}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomNumberField
                    name='header.amount'
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
                    error={formik.touched.header?.amount && Boolean(formik.errors.header?.amount)}
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
            allowDelete={!isPosted}
            allowAddNewLine={!isPosted}
            amount={formik.values.header.amount}
            setFormik={setFormik}
            data={{
              recordId: formik.values.header.recordId,
              reference: formik.values.header.reference,
              clientName: formik.values.header.clientName,
              beneficiaryName: formik.values.header.beneficiaryName,
              viewPosButtons: formik?.values?.header?.wip === 2
            }}
            name='cash'
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

ReceiptVoucherForm.width = 1000

export default ReceiptVoucherForm
