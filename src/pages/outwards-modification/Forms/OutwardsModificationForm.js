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
import { RTOWMRepository } from 'src/repositories/RTOWMRepository'
import { useInvalidate } from 'src/hooks/resource'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'

export default function OutwardsModificationForm({ access, labels, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [editMode, setEditMode] = useState(!!recordId)
  const [displayCash, setDisplayCash] = useState(false)
  const [displayBank, setDisplayBank] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [isPosted, setIsPosted] = useState(false)

  const [store, setStore] = useState(
    { submitted: false },
    { clearBenForm: false },
    { loadBen: true },
    { beneficiaryList: {} },
    { fullModifiedOutwardBody: {} }
  )

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.OutwardsModification,
    access: access,
    hasDT: false,
    enabled: !editMode
  })

  const invalidate = useInvalidate({
    endpointId: RTOWMRepository.OutwardsModification.page
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
      clientRef: '',
      clientName: '',
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
      status: ''
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      owRef: yup.string().required(),
      date: yup.string().required()
    }),
    onSubmit: async values => {
      setStore(prevStore => ({
        ...prevStore,
        submitted: true,
        beneficiaryList: prevStore.beneficiaryList
      }))
    }
  })

  const onClose = async () => {
    const res = await postRequest({
      extension: RTOWMRepository.OutwardsModification.close,
      record: JSON.stringify({
        recordId: formik.values.recordId
      })
    })

    if (res.recordId) {
      toast.success('Record Closed Successfully')
      invalidate()
      setIsClosed(true)
    }
  }

  const onReopen = async () => {
    const res = await postRequest({
      extension: RTOWMRepository.OutwardsModification.reopen,
      record: JSON.stringify(store.fullModifiedOutwardBody)
    })

    if (res.recordId) {
      toast.success('Record Closed Successfully')
      invalidate()
      setIsClosed(false)
    }
  }

  const onPost = async () => {
    const res = await postRequest({
      extension: RTOWMRepository.OutwardsModification.post,
      record: JSON.stringify({
        recordId: formik.values.recordId
      })
    })

    if (res?.recordId) {
      toast.success('Record Posted Successfully')
      invalidate()
      setIsPosted(true)
    }
  }

  function setFieldValues(fields, values) {
    fields.forEach(field => {
      formik.setFieldValue(field, values[field] ?? '')
    })
  }

  async function fillOutwardData(data) {
    const outwardFields = [
      'outwardsDate',
      'amount',
      'productName',
      'clientId',
      'clientRef',
      'clientName',
      'ttNo',
      'dispersalType',
      'countryId',
      'corId'
    ]

    const modifiedOWFields = [
      'outwardId',
      'owRef',
      'reference',
      'recordId',
      'date',
      'oldBeneficiaryId',
      'oldBeneficiarySeqNo',
      'newBeneficiaryId',
      'newBeneficiarySeqNo',
      'status'
    ]

    setFieldValues(modifiedOWFields, data)
    setIsClosed(data.wip === 2 ? true : false)
    setIsPosted(data.status === 3 ? true : false)

    if (data.outwardId) {
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
        clientRef: headerView.clientRef,
        clientName: headerView.clientName,
        ttNo: ttNo,
        dispersalType: headerView.dispersalType,
        countryId: headerView.countryId,
        corId: headerView.corId
      }

      setFieldValues(outwardFields, fieldValues)
      fillBeneficiaryData({
        headerBenId: data.newBeneficiaryId ?? '',
        headerBenName: data.newBeneficiaryName ?? '',
        headerBenSeqNo: data.newBeneficiarySeqNo ?? '',
        dispersalType: headerView.dispersalType ?? ''
      })

      setStore(prevStore => ({
        ...prevStore,
        loadBen: true,
        fullModifiedOutwardBody: data
      }))
    } else {
      formik.resetForm()
      setDisplayBank(false)
      setDisplayCash(false)
      setStore(prevStore => ({
        ...prevStore,
        submitted: false,
        clearBenForm: false,
        loadBen: false,
        fullModifiedOutwardBody: data
      }))
    }
  }
  async function fillBeneficiaryData(data) {
    setStore(prevStore => ({
      ...prevStore,
      submitted: false,
      clearBenForm: false,
      loadBen: true
    }))

    const beneficiaryFields = ['headerBenId', 'headerBenSeqNo', 'headerBenName']
    setFieldValues(beneficiaryFields, data)
    viewBeneficiary(data.dispersalType ?? '')
    formik.setFieldValue('newBeneficiaryId', data.headerBenId)
    formik.setFieldValue('newBeneficiarySeqNo', data.headerBenSeqNo)
  }

  function viewBeneficiary(dispersalType) {
    if (dispersalType === 1) {
      setDisplayCash(true)
    } else if (dispersalType === 2) {
      setDisplayBank(true)
    }
  }

  const actions = [
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode || isPosted
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || !editMode || (formik.values.releaseStatus === 3 && formik.values.status === 3) || isPosted
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
      disabled: formik.values.status != 4 || isPosted
    }
  ]

  useEffect(() => {
    ;(async function () {
      try {
        if (store.beneficiaryList && store.submitted && !editMode) {
          let beneficiaryBankPack = null
          let beneficiaryCashPack = null

          if (displayCash) beneficiaryCashPack = store.beneficiaryList
          if (displayBank) beneficiaryBankPack = store.beneficiaryList

          const data = {
            outwardId: formik.values.outwardId,
            beneficiaryCashPack: beneficiaryCashPack,
            beneficiaryBankPack: beneficiaryBankPack
          }

          const res = await postRequest({
            extension: RTOWMRepository.OutwardsModification.set2,
            record: JSON.stringify(data)
          })

          if (res.recordId) {
            toast.success('Record Updated Successfully')
            formik.setFieldValue('recordId', res.recordId)
            invalidate()
            setEditMode(true)

            const res2 = await getRequest({
              extension: RTOWMRepository.OutwardsModification.get,
              parameters: `_recordId=${res.recordId}`
            })
            formik.setFieldValue('reference', res2.record.reference)
            setStore(prevStore => ({
              ...prevStore,
              fullModifiedOutwardBody: res2.record
            }))
          }
        }

        if (recordId && !store.beneficiaryList) {
          const res = await getRequest({
            extension: RTOWMRepository.OutwardsModification.get,
            parameters: `_recordId=${recordId}`
          })
          res.record.date = formatDateFromApi(res.record.date)
          fillOutwardData(res.record)
        }
      } catch (error) {}
    })()
  }, [store.beneficiaryList])

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
            <Grid container sx={{ display: 'flex', flexDirection: 'row' }}>
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
                    fillOutwardData({
                      outwardId: newValue ? newValue.recordId : '',
                      owRef: newValue ? newValue.reference : '',
                      date: newValue ? formatDateFromApi(newValue.date) : '',
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
            </Grid>
            <Grid container sx={{ display: 'flex', flexDirection: 'row' }}>
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
            </Grid>
            <Grid container sx={{ display: 'flex', flexDirection: 'row' }}>
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
                  endpointId={RemittanceOutwardsRepository.Beneficiary.snapshot}
                  parameters={{
                    _clientId: formik.values.clientId,
                    _dispersalType: formik.values.dispersalType
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
                    fillBeneficiaryData({
                      headerBenId: newValue ? newValue.beneficiaryId : '',
                      headerBenName: newValue ? newValue.name : '',
                      headerBenSeqNo: newValue ? newValue.seqNo : '',
                      dispersalType: newValue ? newValue.dispersalType : ''
                    })
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
                  disabled={store?.submitted || !displayCash == !displayBank || editMode}
                  onClick={() => {
                    setStore(prevStore => ({
                      ...prevStore,
                      clearBenForm: true
                    }))
                    formik.setFieldValue('headerBenName', '')
                  }}
                >
                  Add Beneficiary
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid container>
            <Grid container rowGap={2} xs={6} spacing={2} sx={{ pt: 5, pl: 2 }}>
              <FieldSet title='Benificiary [Old]'>
                {displayBank && (
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
                {displayCash && (
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
              <FieldSet title='Benificiary [New]'>
                <Grid>
                  {displayBank && (
                    <BenificiaryBankForm
                      viewBtns={false}
                      store={store}
                      setStore={setStore}
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
                      countryId={formik.values.countryId}
                      corId={formik.values.corId}
                    />
                  )}
                </Grid>
                <Grid>
                  {displayCash && (
                    <BenificiaryCashForm
                      viewBtns={false}
                      editable={!editMode}
                      store={store}
                      setStore={setStore}
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
