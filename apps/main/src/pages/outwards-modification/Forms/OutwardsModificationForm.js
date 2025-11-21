import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext, useEffect, useState } from 'react'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { RemittanceOutwardsRepository } from '@argus/repositories/src/repositories/RemittanceOutwardsRepository'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'
import FieldSet from '@argus/shared-ui/src/components/Shared/FieldSet'
import BenificiaryCashForm from '@argus/shared-ui/src/components/Shared/BenificiaryCashForm'
import BenificiaryBankForm from '@argus/shared-ui/src/components/Shared/BenificiaryBankForm'
import toast from 'react-hot-toast'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import OTPPhoneVerification from '@argus/shared-ui/src/components/Shared/OTPPhoneVerification'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const OutwardsModificationForm = ({ recordId, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const [resetForm, setResetForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [validSubmit, setValidSubmit] = useState(false)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.OutwardsModification,
    editMode: !!recordId
  })

  useSetWindow({ title: labels.outwardsModification, window })

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
      owoId: '',
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
      owtId: '',
      owtRef: '',
      plantId: '',
      seqNo: '',
      modificationType: '',
      beneficiaryData: {}
    },
    validateOnChange: true,
    validationSchema: yup.object({
      owRef: yup.string().required(),
      date: yup.string().required(),
      modificationType: yup.string().required()
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
    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsModification.close,
      record: JSON.stringify({ recordId: recId })
    })

    if (recordId) toast.success(platformLabels.Closed)
    invalidate()

    await refetchForm(res.recordId)
  }

  const onReopen = async () => {
    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsModification.reopen,
      record: JSON.stringify({ recordId: formik.values.recordId })
    })

    toast.success(platformLabels.Reopened)
    invalidate()
    await refetchForm(res.recordId)
  }

  const onPost = async () => {
    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsModification.post,
      record: JSON.stringify({
        recordId: formik.values.recordId
      })
    })

    toast.success(platformLabels.Posted)
    invalidate()
    await refetchForm(res.recordId)
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
      extension: RemittanceOutwardsRepository.OutwardsOrder.get2,
      parameters: `_recordId=${data?.owoId}`
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
      corId: headerView.corId,
      modificationType: data?.modificationType
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
      key: 'Locked',
      condition: true,
      onClick: onPost,
      disabled: !isPosted
    }
  ]

  function viewOTP(recId) {
    stack({
      Component: OTPPhoneVerification,
      props: {
        values: formik.values,
        recordId: recId,
        functionId: SystemFunction.OutwardsModification,
        onSuccess: () => {
          onClose(recId)
        }
      }
    })
  }
  async function refetchForm(recordId) {
    const res2 = await getOutwardsModification(recordId)
    res2.record.date = formatDateFromApi(res2.record.date)
    await fillOutwardData(res2.record)
  }
  async function getOutwardOrder(owoId) {
    if (!owoId) return

    return await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsOrder.get,
      parameters: `_recordId=${owoId}`
    })
  }

  useEffect(() => {
    ;(async function () {
      if (validSubmit) {
        setSubmitted(false)
        setValidSubmit(false)

        const data = {
          owoId: formik.values.owoId,
          modificationType: formik.values.modificationType,
          owtId: formik.values.owtId,
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
      maxAccess={maxAccess}
      editMode={editMode}
      disabledSubmit={editMode}
      onClose={onClose}
      isClosed={isClosed}
      actions={actions}
      functionId={SystemFunction.OutwardsModification}
      previewReport={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Fixed>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='reference'
                      label={labels.reference}
                      value={formik.values.reference}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
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
                  <Grid item xs={2}>
                    <ResourceLookup
                      endpointId={RemittanceOutwardsRepository.OutwardsOrder.snapshot}
                      valueField='reference'
                      displayField='reference'
                      name='owRef'
                      secondDisplayField={false}
                      required
                      readOnly={editMode || formik.values.owtRef}
                      label={labels.outwardOrder}
                      form={formik}
                      onChange={(event, newValue) => {
                        if (!newValue?.recordId) clearForm()
                        else
                          fillOutwardData({
                            owoId: newValue?.recordId,
                            owRef: newValue?.reference,
                            oldBeneficiaryId: newValue?.beneficiaryId,
                            oldBeneficiarySeqNo: newValue?.beneficiarySeqNo,
                            oldBeneficiaryName: newValue?.beneficiaryName,
                            newBeneficiaryId: newValue?.beneficiaryId,
                            newBeneficiarySeqNo: newValue?.beneficiarySeqNo,
                            newBeneficiaryName: newValue?.beneficiaryName,
                            dispersalType: newValue?.dispersalType
                          })
                      }}
                      error={formik.touched.owRef && Boolean(formik.errors.owRef)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <ResourceLookup
                      endpointId={RemittanceOutwardsRepository.OutwardsTransfer.snapshot}
                      valueField='reference'
                      displayField='reference'
                      name='owtRef'
                      secondDisplayField={false}
                      readOnly={editMode || formik.values.owRef}
                      label={labels.outwardTransfer}
                      form={formik}
                      onChange={async (event, newValue) => {
                        if (!newValue?.recordId) clearForm()
                        const order = await getOutwardOrder(newValue?.owoId)
                        await fillOutwardData({
                          owoId: newValue?.owoId,
                          owRef: order?.record?.reference,
                          owtId: newValue?.recordId,
                          owtRef: newValue?.reference,
                          oldBeneficiaryId: order?.record?.beneficiaryId,
                          oldBeneficiarySeqNo: order?.record?.beneficiarySeqNo,
                          oldBeneficiaryName: order?.record?.beneficiaryName,
                          newBeneficiaryId: order?.record?.beneficiaryId,
                          newBeneficiarySeqNo: order?.record?.beneficiarySeqNo,
                          newBeneficiaryName: order?.record?.beneficiaryName,
                          dispersalType: order?.record?.dispersalType
                        })
                      }}
                      error={formik.touched.owtRef && Boolean(formik.errors.owtRef)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='ttNo'
                      label={labels.ttNo}
                      value={formik.values.ttNo}
                      readOnly
                      error={formik.touched.ttNo && Boolean(formik.errors.ttNo)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={4}>
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
                  <Grid item xs={4}>
                    <CustomTextField
                      name='productName'
                      label={labels.product}
                      value={formik.values.productName}
                      readOnly
                      error={formik.touched.ttNo && Boolean(formik.errors.productName)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomNumberField
                      name='amount'
                      label={labels.amount}
                      value={formik.values.amount}
                      maxAccess={maxAccess}
                      readOnly
                      error={formik.touched.amount && Boolean(formik.errors.amount)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      datasetId={DataSets.OW_MODIFICATION_TYPE}
                      name='modificationType'
                      label={labels.modificationType}
                      values={formik.values}
                      valueField='key'
                      displayField='value'
                      required
                      readOnly={editMode}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('modificationType', newValue?.key)
                        if (newValue?.key == 3) {
                          setResetForm(true)
                          formik.setFieldValue('newBeneficiaryId', '')
                          formik.setFieldValue('newBeneficiarySeqNo', '')
                          formik.setFieldValue('headerBenName', '')
                        }
                      }}
                      error={formik.touched.modificationType && Boolean(formik.errors.modificationType)}
                    />
                  </Grid>
                  <Grid item xs={4}>
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
                      readOnly={
                        !formik.values.clientId ||
                        !formik.values.dispersalType ||
                        editMode ||
                        isPosted ||
                        formik.values.modificationType != 2
                      }
                      maxAccess={maxAccess}
                      editMode={editMode}
                      secondDisplayField={false}
                      onChange={async (event, newValue) => {
                        if (newValue?.beneficiaryId)
                          fillBeneficiaryData({
                            headerBenId: newValue?.beneficiaryId,
                            headerBenName: newValue?.name,
                            headerBenSeqNo: newValue?.seqNo,
                            dispersalType: newValue?.dispersalType
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
                </Grid>
              </Fixed>
            </Grid>
            <Grid item xs={12}>
              <Grow>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FieldSet title={labels.benOld} form={true}>
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
                          recordId={
                            formik.values?.clientId &&
                            formik.values?.oldBeneficiaryId &&
                            formik.values?.oldBeneficiarySeqNo
                              ? (formik.values.clientId * 100).toString() +
                                (formik.values.oldBeneficiaryId * 10).toString() +
                                formik.values.oldBeneficiarySeqNo
                              : null
                          }
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
                          recordId={
                            formik.values?.clientId &&
                            formik.values?.oldBeneficiaryId &&
                            formik.values?.oldBeneficiarySeqNo
                              ? (formik.values.clientId * 100).toString() +
                                (formik.values.oldBeneficiaryId * 10).toString() +
                                formik.values.oldBeneficiarySeqNo
                              : null
                          }
                          viewBtns={false}
                        />
                      )}
                    </FieldSet>
                  </Grid>
                  <Grid item xs={6}>
                    <FieldSet title={labels.benNew} form={true}>
                      {dispersalMode === DISPERSAL_MODE_BANK && (
                        <BenificiaryBankForm
                          viewBtns={false}
                          resetForm={resetForm}
                          setResetForm={setResetForm}
                          onChange={changedBeneficiaryData}
                          submitted={submitted}
                          setSubmitted={setSubmitted}
                          setValidSubmit={setValidSubmit}
                          forceEdit={editMode}
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
                          recordId={
                            formik.values?.clientId &&
                            formik.values?.newBeneficiaryId &&
                            formik.values?.newBeneficiarySeqNo
                              ? (formik.values.clientId * 100).toString() +
                                (formik.values.newBeneficiaryId * 10).toString() +
                                formik.values.newBeneficiarySeqNo
                              : null
                          }
                          submitMainForm={false}
                        />
                      )}
                      {dispersalMode === DISPERSAL_MODE_CASH && (
                        <BenificiaryCashForm
                          viewBtns={false}
                          forceEdit={editMode}
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
                          recordId={
                            formik.values?.clientId &&
                            formik.values?.newBeneficiaryId &&
                            formik.values?.newBeneficiarySeqNo
                              ? (formik.values.clientId * 100).toString() +
                                (formik.values.newBeneficiaryId * 10).toString() +
                                formik.values.newBeneficiarySeqNo
                              : null
                          }
                          submitMainForm={false}
                        />
                      )}
                    </FieldSet>
                  </Grid>
                </Grid>
              </Grow>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

OutwardsModificationForm.width = 1200
OutwardsModificationForm.height = 650

export default OutwardsModificationForm
