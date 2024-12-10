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
import { formatDateFromApi } from 'src/lib/date-helper'
import { ControlContext } from 'src/providers/ControlContext'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { useWindow } from 'src/windows'
import OTPPhoneVerification from 'src/components/Shared/OTPPhoneVerification'
import PaymentGrid from 'src/components/Shared/PaymentGrid'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function OutwardReturnSettlementForm({ labels, access, recordId, cashAccountId, plantId, form, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [formikSettings, setFormik] = useState({})
  const [selectedReport, setSelectedReport] = useState(null)

  const { documentType, maxAccess } = useDocumentType({
    functionId: SystemFunction.OutwardReturnSettlement,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.OutwardReturnSettlement.page
  })

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      recordId: null,
      plantId: parseInt(plantId),
      reference: '',
      accountId: null,
      date: new Date(),
      dtId: documentType?.dtId,
      amount: null,
      returnId: null,
      owrRef: '',
      status: 1,
      corId: null,
      corRef: '',
      corName: '',
      otpVerified: false,
      releaseStatus: 1,
      clientId: null,
      cellPhone: null,
      cashAccountId: parseInt(cashAccountId),
      wip: 1,
      items: formikSettings.initialValuePayment || []
    },

    validationSchema: yup.object({
      returnId: yup.string().required(),
      items: formikSettings?.paymentValidation
    }),
    onSubmit: async obj => {
      const copy = { ...formik.values, dtId: documentType?.dtId }
      delete copy.items

      const items = formik.values.items.map((item, index) => ({
        ...item,
        id: index + 1,
        seqNo: index + 1,
        posStatus: 1,
        cashAccountId: cashAccountId
      }))

      const data = { header: copy, items: items }

      const totalCashAmount = formik.values.items
        .reduce((sum, current) => sum + parseFloat(current.amount || 0), 0)
        .toFixed(2)

      if (totalCashAmount !== formik.values.amount.toFixed(2)) {
        toast.error('The total amount does not match the sum of amounts in the grid.')

        return
      }

      await postRequest({
        extension: RemittanceOutwardsRepository.OutwardReturnSettlement.set2,
        record: JSON.stringify(data)
      }).then(async res => {
        if (!obj.recordId) {
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

  const editMode = !!recordId || !!formik?.values?.recordId
  const isPosted = formik?.values?.status === 3
  const isClosed = formik?.values?.wip === 2
  const isOTPVerified = formik?.values?.otpVerified

  function viewOTP(result) {
    const recordId = result.recordId || formik.values.recordId
    stack({
      Component: OTPPhoneVerification,
      props: {
        values: result || formik.values,
        recordId: recordId,
        functionId: SystemFunction.OutwardReturnSettlement,
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
    const recordId = recId || formik.values.recordId

    const data = {
      recordId: recordId
    }
    postRequest({
      extension: RemittanceOutwardsRepository.OutwardReturnSettlement.close,
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
    const data = result || formik.values

    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardReturnSettlement.post,
      record: JSON.stringify(data)
    })

    if (res) {
      toast.success(platformLabels.Posted)
      window.close()
      invalidate()
      getData()
    }
  }

  useEffect(() => {
    const initializeValues = async () => {
      if (recordId) {
        await getData(recordId)
      } else if (form) {
        formik.setValues(prevValues => ({
          ...prevValues,
          amount: form.values.amount,
          returnId: form.values.recordId,
          owrRef: form.values.reference,
          reference: form.values.reference,
          clientId: form.values.clientId,
          cellPhone: form.values.cellPhone,
          plantId: form.values.plantId
        }))
      }
    }

    initializeValues()
  }, [recordId, form])

  async function getData(_recordId) {
    const finalRecordId = _recordId || recordId || formik.values.recordId
    if (finalRecordId) {
      const res = await getRequest({
        extension: RemittanceOutwardsRepository.OutwardReturnSettlement.get,
        parameters: `_recordId=${finalRecordId}`
      })

      const result = await getRequest({
        extension: RemittanceOutwardsRepository.OutwardsCash.qry,
        parameters: `_receiptId=${finalRecordId}`
      })

      formik.setValues({
        ...res.record,
        date: formatDateFromApi(res?.record?.date),
        items: result.list.map((amount, index) => ({
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
      extension: RemittanceOutwardsRepository.OutwardReturnSettlement.reopen,
      record: JSON.stringify(formik.values)
    }).then(res => {
      if (res.recordId) {
        toast.success(platformLabels.Reopened)
        invalidate()
        getData(obj?.recordId)
      }
    })
  }

  const actions = [
    {
      key: 'Unlocked',
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
      disabled: !isClosed || !editMode || formik?.values?.releaseStatus === 3
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
      resourceId={ResourceIds.OutwardReturnSettlement}
      functionId={SystemFunction.OutwardReturnSettlement}
      form={formik}
      actions={actions}
      maxAccess={maxAccess}
      editMode={editMode}
      disabledSubmit={isPosted || isClosed}
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
                    value={formik?.values?.reference}
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
                    value={formik?.values?.date}
                    maxAccess={maxAccess}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values}
                    readOnly
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceLookup
                    endpointId={RemittanceOutwardsRepository.OutwardsReturn.snapshot}
                    valueField='reference'
                    name='returnId'
                    label={labels.outwards}
                    form={formik}
                    secondDisplayField={false}
                    valueShow='owrRef'
                    formObject={formik.values}
                    readOnly={isPosted}
                    required
                    maxAccess={maxAccess}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'amount', value: 'Amount' }
                    ]}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('returnId', newValue ? newValue.recordId : '')
                      formik.setFieldValue('corId', newValue ? newValue.corId : '')
                      formik.setFieldValue('corRef', newValue ? newValue.corRef : '')
                      formik.setFieldValue('corName', newValue ? newValue.corName : '')
                      formik.setFieldValue('owrRef', newValue ? newValue.reference : '')

                      formik.setFieldValue('amount', newValue ? newValue.amount : '')
                      formik.setFieldValue('clientId', newValue ? newValue.clientId : '')
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceLookup
                    endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='corId'
                    label={labels.correspondent}
                    form={formik}
                    formObject={formik.values}
                    required
                    displayFieldWidth={2}
                    valueShow='corRef'
                    secondValueShow='corName'
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomNumberField
                    name='amount'
                    label={labels.amount}
                    value={formik?.values?.amount}
                    readOnly={true}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('amount', e.target.value)}
                    onClear={() => {
                      formik.setFieldValue('amount', '')
                      if (!formik?.values?.fcAmount) {
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
          <PaymentGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            labels={labels}
            maxAccess={maxAccess}
            allowDelete={!isPosted}
            allowAddNewLine={!isPosted}
            amount={formik.values.amount}
            setFormik={setFormik}
            name='items'
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
