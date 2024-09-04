import { Button, Grid, alpha } from '@mui/material'
import * as yup from 'yup'
import { useContext, useEffect, useState } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { formatDateFromApi } from 'src/lib/date-helper'
import FieldSet from 'src/components/Shared/FieldSet'
import BenificiaryCashForm from 'src/components/Shared/BenificiaryCashForm'
import BenificiaryBankForm from 'src/components/Shared/BenificiaryBankForm'
import toast from 'react-hot-toast'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import OTPPhoneVerification from 'src/components/Shared/OTPPhoneVerification'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { useInvalidate } from 'src/hooks/resource'

export default function OutwardsModificationForm({ access, labels, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const [resetForm, setResetForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [validSubmit, setValidSubmit] = useState(false)

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.OutwardsModification,
    access: access,
    hasDT: false
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.OutwardsModification.page
  })

  const { formik } = useForm({
    maxAccess: maxAccess,
    initialValues: {
      recordId: null,
      reference: '',
      date: new Date(),
      outwardsDate: null,
      outwardId: '',
      owRef: '',
      ttNo: '',
      productName: '',
      clientId: '',
      currencyId: '',
      clientRef: '',
      clientName: '',
      cellPhone: '',
      dispersalType: '',
      countryId: '',
      headerBenId: '',
      headerBenName: '',
      headerBenSeqNo: '',
      newBeneficiaryId: '',
      newBeneficiarySeqNo: '',
      corId: '',
      oldBeneficiaryId: '',
      oldBeneficiarySeqNo: '',
      oldBeneficiarySeqName: '',
      wip: '',
      releaseStatus: '',
      status: '',
      otpVerified: false,
      plantId: '',
      seqNo: '',
      beneficiaryData: {}
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      owRef: yup.string().required(),
      date: yup.string().required()
    }),
    onSubmit: async () => {
      setSubmitted(true)
    }
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2
  const isPosted = formik.values.status === 4
  const dispersalMode = formik.values.dispersalType
  const DISPERSAL_MODE_CASH = 1
  const DISPERSAL_MODE_BANK = 2

  async function getOutwardsModification(recordId) {
    return await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsModification.get,
      parameters: `_recordId=${recordId}`
    })
  }

  const onClose = async recId => {
    try {
      const res = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsModification.close,
        record: JSON.stringify({ recordId: recId })
      })

      if (recordId) toast.success(platformLabels.Closed)
      invalidate()

      await refetchForm(res.recordId)
    } catch (error) {}
  }

  const onReopen = async () => {
    try {
      const res = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsModification.reopen,
        record: JSON.stringify({ recordId: formik.values.recordId })
      })

      toast.success(platformLabels.Reopened)
      invalidate()
      await refetchForm(res.recordId)
    } catch (error) {}
  }

  const onPost = async () => {
    try {
      const res = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsModification.post,
        record: JSON.stringify({
          recordId: formik.values.recordId
        })
      })

      toast.success(platformLabels.Posted)
      invalidate()
      await refetchForm(res.recordId)
    } catch (error) {}
  }

  function changedBeneficiaryData(data) {
    formik.setValues({
      ...formik.values,
      beneficiaryData: data
    })
  }

  function setFieldValues(values) {
    for (let [key, value] of Object.entries(values)) {
      formik.setFieldValue(key, value ?? '')
    }
  }

  async function fillOutwardData(data) {
    setFieldValues(data)

    const res = await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.get2,
      parameters: `_recordId=${data.outwardId}`
    })

    const { headerView, ttNo } = res.record

    const fieldValues = {
      outwardsDate: formatDateFromApi(headerView.date),
      amount: headerView.amount,
      productName: headerView.productName,
      clientId: headerView.clientId,
      currencyId: headerView.currencyId,
      clientRef: headerView.clientRef,
      clientName: headerView.clientName,
      cellPhone: headerView.cellPhone,
      ttNo: ttNo,
      dispersalType: headerView.dispersalType,
      countryId: headerView.countryId,
      corId: headerView.corId
    }

    setFieldValues(fieldValues)
    fillBeneficiaryData({
      headerBenId: data.newBeneficiaryId ?? '',
      headerBenName: data.newBeneficiaryName ?? '',
      headerBenSeqNo: data.newBeneficiarySeqNo ?? '',
      dispersalType: headerView.dispersalType ?? ''
    })
  }

  function clearForm() {
    formik.resetForm()
    setResetForm(true)
  }

  async function fillBeneficiaryData(data) {
    formik.setFieldValue('newBeneficiaryId', data.headerBenId)
    formik.setFieldValue('newBeneficiarySeqNo', data.headerBenSeqNo)
    formik.setFieldValue('dispersalType', data.dispersalType)
  }

  const actions = [
    {
      key: 'Close',
      condition: !isClosed,
      onClick: () => onClose(formik.values.recordId),
      disabled: isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    },
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !isPosted
    }
  ]

  function viewOTP(recId) {
    stack({
      Component: OTPPhoneVerification,
      props: {
        formValidation: formik,
        recordId: recId,
        functionId: SystemFunction.OutwardsModification,
        onSuccess: () => {
          onClose(recId)
        }
      },
      width: 400,
      height: 400,
      title: labels.OTPVerification
    })
  }
  async function refetchForm(recordId) {
    const res2 = await getOutwardsModification(recordId)
    res2.record.date = formatDateFromApi(res2.record.date)
    await fillOutwardData(res2.record)
  }

  useEffect(() => {
    ;(async function () {
      try {
        if (validSubmit) {
          const data = {
            outwardId: formik.values.outwardId,
            beneficiaryCashPack: dispersalMode === DISPERSAL_MODE_CASH ? formik.values.beneficiaryData : null,
            beneficiaryBankPack: dispersalMode === DISPERSAL_MODE_BANK ? formik.values.beneficiaryData : null
          }

          const res = await postRequest({
            extension: RemittanceOutwardsRepository.OutwardsModification.set2,
            record: JSON.stringify(data)
          })

          const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
          toast.success(actionMessage)
          await refetchForm(res.recordId)
          invalidate()
          !recordId && viewOTP(res.recordId)
        }
      } catch (error) {
        setSubmitted(false)
        setValidSubmit(false)
      }
    })()
  }, [validSubmit])

  useEffect(() => {
    ;(async function () {
      if (recordId) await refetchForm(recordId)
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.OutwardsModification}
      form={formik}
      height={480}
      maxAccess={maxAccess}
      editMode={editMode}
      disabledSubmit={editMode}
      onClose={onClose}
      isClosed={isClosed}
      actions={actions}
      functionId={SystemFunction.OutwardsModification}
    >
      <VertLayout>
        <Grow>
          <Grid container>
            <Grid item xs={4}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4} sx={{ pl: 1 }}>
              <CustomDatePicker
                name='date'
                required
                readOnly={editMode}
                label={labels.date}
                value={formik.values.date}
                editMode={editMode}
                maxAccess={maxAccess}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={4} sx={{ pl: 1 }}>
              <ResourceLookup
                endpointId={RemittanceOutwardsRepository.OutwardsTransfer.snapshot}
                valueField='reference'
                displayField='reference'
                name='owRef'
                secondDisplayField={false}
                required
                readOnly={editMode}
                label={labels.outward}
                form={formik}
                onChange={(event, newValue) => {
                  if (!newValue?.recordId) clearForm()
                  else
                    fillOutwardData({
                      outwardId: newValue ? newValue.recordId : '',
                      owRef: newValue ? newValue.reference : '',
                      oldBeneficiaryId: newValue ? newValue.beneficiaryId : '',
                      oldBeneficiarySeqNo: newValue ? newValue.beneficiarySeqNo : '',
                      oldBeneficiaryName: newValue ? newValue.beneficiaryName : '',
                      newBeneficiaryId: newValue ? newValue.beneficiaryId : '',
                      newBeneficiarySeqNo: newValue ? newValue.beneficiarySeqNo : '',
                      newBeneficiaryName: newValue ? newValue.beneficiaryName : '',
                      dispersalType: newValue ? newValue.dispersalType : ''
                    })
                }}
                error={formik.touched.owRef && Boolean(formik.errors.owRef)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={4} sx={{ pt: 2 }}>
              <CustomTextField
                name='ttNo'
                label={labels.ttNo}
                value={formik.values.ttNo}
                readOnly
                error={formik.touched.ttNo && Boolean(formik.errors.ttNo)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={4} sx={{ pl: 1, pt: 2 }}>
              <CustomDatePicker
                name='outwardsDate'
                label={labels.outwardsDate}
                value={formik.values.outwardsDate}
                editMode={editMode}
                maxAccess={maxAccess}
                readOnly
                error={formik.touched.outwardsDate && Boolean(formik.errors.outwardsDate)}
              />
            </Grid>
            <Grid item xs={4} sx={{ pl: 1, pt: 2 }}>
              <CustomTextField
                name='productName'
                label={labels.product}
                value={formik.values.productName}
                readOnly
                error={formik.touched.ttNo && Boolean(formik.errors.productName)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={4} sx={{ pt: 2 }}>
              <CustomNumberField
                name='amount'
                label={labels.amount}
                value={formik.values.amount}
                maxAccess={maxAccess}
                readOnly
                error={formik.touched.amount && Boolean(formik.errors.amount)}
              />
            </Grid>
            <Grid item xs={4} sx={{ pl: 1, pt: 2 }}>
              <ResourceLookup
                endpointId={RemittanceOutwardsRepository.Beneficiary.snapshot2}
                parameters={{
                  _clientId: formik.values.clientId,
                  _dispersalType: formik.values.dispersalType,
                  _currencyId: formik.values.currencyId
                }}
                valueField='name'
                displayField='name'
                name='headerBenName'
                label={labels.beneficiary}
                form={formik}
                readOnly={!formik.values.clientId || !formik.values.dispersalType || editMode || isPosted}
                maxAccess={maxAccess}
                editMode={editMode}
                secondDisplayField={false}
                onChange={async (event, newValue) => {
                  if (newValue?.beneficiaryId)
                    fillBeneficiaryData({
                      headerBenId: newValue ? newValue.beneficiaryId : '',
                      headerBenName: newValue ? newValue.name : '',
                      headerBenSeqNo: newValue ? newValue.seqNo : '',
                      dispersalType: newValue ? newValue.dispersalType : ''
                    })
                  else {
                    formik.setFieldValue('headerBenId', '')
                    formik.setFieldValue('headerBenName', '')
                    formik.setFieldValue('headerBenSeqNo', '')
                  }
                }}
                errorCheck={'headerBenId'}
              />
            </Grid>
            <Grid item xs={4} sx={{ pl: 5, pt: 2 }}>
              <Button
                sx={{
                  backgroundColor: '#4eb558',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: alpha('#4eb558', 0.8)
                  },
                  '&:disabled': {
                    backgroundColor: alpha('#4eb558', 0.8)
                  }
                }}
                disabled={editMode}
                onClick={() => {
                  setResetForm(true)
                  formik.setFieldValue('newBeneficiaryId', '')
                  formik.setFieldValue('newBeneficiarySeqNo', '')
                  formik.setFieldValue('headerBenName', '')
                }}
              >
                Add Beneficiary
              </Button>
            </Grid>
          </Grid>
          <Grid container>
            <Grid container rowGap={2} xs={6} spacing={2} sx={{ pt: 5, pl: 2 }}>
              <FieldSet title={labels.benOld}>
                {dispersalMode === DISPERSAL_MODE_BANK && (
                  <BenificiaryBankForm
                    client={{
                      clientId: formik.values.clientId,
                      clientName: formik.values.clientName,
                      clientRef: formik.values.clientRef
                    }}
                    beneficiary={{
                      beneficiaryId: formik.values.oldBeneficiaryId,
                      beneficiarySeqNo: formik.values.oldBeneficiarySeqNo
                    }}
                    dispersalType={formik.values.dispersalType}
                    countryId={formik.values.countryId}
                    corId={formik.values.corId}
                    viewBtns={false}
                  />
                )}
                {dispersalMode === DISPERSAL_MODE_CASH && (
                  <BenificiaryCashForm
                    client={{
                      clientId: formik.values.clientId,
                      clientName: formik.values.clientName,
                      clientRef: formik.values.clientRef
                    }}
                    beneficiary={{
                      beneficiaryId: formik.values.oldBeneficiaryId,
                      beneficiarySeqNo: formik.values.oldBeneficiarySeqNo
                    }}
                    dispersalType={formik.values.dispersalType}
                    countryId={formik.values.countryId}
                    corId={formik.values.corId}
                    viewBtns={false}
                  />
                )}
              </FieldSet>
            </Grid>
            <Grid container rowGap={2} xs={6} spacing={2} sx={{ pt: 5, pl: 4 }}>
              <FieldSet title={labels.benNew}>
                <Grid>
                  {dispersalMode === DISPERSAL_MODE_BANK && (
                    <BenificiaryBankForm
                      viewBtns={false}
                      resetForm={resetForm}
                      setResetForm={setResetForm}
                      onChange={changedBeneficiaryData}
                      submitted={submitted}
                      setSubmitted={setSubmitted}
                      setValidSubmit={setValidSubmit}
                      editable={!editMode}
                      client={{
                        clientId: formik.values.clientId,
                        clientName: formik.values.clientName,
                        clientRef: formik.values.clientRef
                      }}
                      beneficiary={{
                        beneficiaryId: formik.values.newBeneficiaryId,
                        beneficiarySeqNo: formik.values.newBeneficiarySeqNo
                      }}
                      dispersalType={formik.values.dispersalType}
                      corId={formik.values.corId}
                      submitMainForm={false}
                    />
                  )}
                </Grid>
                <Grid>
                  {dispersalMode === DISPERSAL_MODE_CASH && (
                    <BenificiaryCashForm
                      viewBtns={false}
                      editable={!editMode}
                      resetForm={resetForm}
                      setResetForm={setResetForm}
                      onChange={changedBeneficiaryData}
                      submitted={submitted}
                      setSubmitted={setSubmitted}
                      setValidSubmit={setValidSubmit}
                      client={{
                        clientId: formik.values.clientId,
                        clientName: formik.values.clientName,
                        clientRef: formik.values.clientRef
                      }}
                      beneficiary={{
                        beneficiaryId: formik.values.newBeneficiaryId,
                        beneficiarySeqNo: formik.values.newBeneficiarySeqNo
                      }}
                      dispersalType={formik.values.dispersalType}
                      countryId={formik.values.countryId}
                      corId={formik.values.corId}
                      submitMainForm={false}
                    />
                  )}
                </Grid>
              </FieldSet>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
