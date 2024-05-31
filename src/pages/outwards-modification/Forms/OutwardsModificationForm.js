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
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { formatDateFromApi } from 'src/lib/date-helper'
import FieldSet from 'src/components/Shared/FieldSet'
import BenificiaryCashForm from 'src/components/Shared/BenificiaryCashForm'
import BenificiaryBankForm from 'src/components/Shared/BenificiaryBankForm'
import toast from 'react-hot-toast'
import { RTOWMRepository } from 'src/repositories/RTOWMRepository'
import { useInvalidate } from 'src/hooks/resource'

export default function OutwardsModificationForm({ maxAccess, labels, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [editMode, setEditMode] = useState(!!recordId)
  const [displayCash, setDisplayCash] = useState(false)
  const [displayBank, setDisplayBank] = useState(false)
  const [clearBenForm, setClearBen] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [isPosted, setIsPosted] = useState(false)
  const [store, setStore] = useState({ submitted: false }, { beneficiaryList: {} })

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
      outwardRef: '',
      ttNo: '',
      productName: '',
      clientId: '',
      clientRef: '',
      clientName: '',
      dispersalType: '',
      countryId: '',
      beneficiaryId: '',
      beneficiarySeqNo: '',
      corId: '',
      oldBeneficiaryId: '',
      oldBeneficiarySeqNo: '',
      wip: '',
      releaseStatus: '',
      status: ''
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({}),
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
      extension: RemittanceOutwardsRepository.OutwardsTransfer.close,
      record: JSON.stringify({
        outwardId: formik.values.outwardId
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
      extension: RemittanceOutwardsRepository.OutwardsTransfer.reopen,
      record: JSON.stringify({
        outwardId: formik.values.outwardId
      })
    })

    if (res.recordId) {
      toast.success('Record Closed Successfully')
      invalidate()
      setIsClosed(false)
    }
  }

  const onPost = async () => {
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
      extension: RemittanceOutwardsRepository.OutwardsTransfer.post,
      record: JSON.stringify({ data })
    })

    if (res?.recordId) {
      toast.success('Record Posted Successfully')
      invalidate()
      setIsPosted(true)
    }
  }

  async function fillOutwardData(recordId, data) {
    setDisplayBank(false)
    setDisplayCash(false)
    setClearBen(false)
    setStore(prevStore => ({
      ...prevStore,
      submitted: false
    }))

    const outwardFields = [
      'outwardId',
      'outwardRef',
      'outwardsDate',
      'amount',
      'productName',
      'clientId',
      'clientRef',
      'clientName',
      'ttNo',
      'dispersalType',
      'countryId',
      'beneficiaryId',
      'beneficiarySeqNo',
      'corId'
    ]

    const modifiedOWFields = ['reference', 'recordId', 'date', 'oldBeneficiaryId', 'oldBeneficiarySeqNo']

    const setFieldValues = (fields, values) => {
      fields.forEach(field => {
        formik.setFieldValue(field, values[field] ?? '')
      })
    }

    setFieldValues(modifiedOWFields, data)

    if (recordId) {
      const res = await getRequest({
        extension: RemittanceOutwardsRepository.OutwardsTransfer.get2,
        parameters: `_recordId=${recordId}`
      })

      const { headerView, ttNo } = res.record

      const fieldValues = {
        outwardId: headerView.recordId,
        outwardRef: headerView.reference,
        outwardsDate: formatDateFromApi(headerView.date),
        amount: headerView.amount,
        productName: headerView.productName,
        clientId: headerView.clientId,
        clientRef: headerView.clientRef,
        clientName: headerView.clientName,
        ttNo: ttNo,
        dispersalType: headerView.dispersalType,
        countryId: headerView.countryId,
        beneficiaryId: headerView.beneficiaryId,
        beneficiarySeqNo: headerView.beneficiarySeqNo,
        corId: headerView.corId
      }

      setFieldValues(outwardFields, fieldValues)
      viewBeneficiary(headerView.dispersalType)
    } else {
      viewBeneficiary('')
    }
  }

  function viewBeneficiary(dispersalType) {
    if (dispersalType === 1) {
      setDisplayCash(true)
    } else if (dispersalType === 2) {
      setDisplayBank(true)
    }
  }

  function clearForm() {
    setClearBen(true)
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
      disabled: !editMode || isPosted || !isClosed
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
            invalidate()
          }
        }

        if (recordId && !store.beneficiaryList) {
          const res = await getRequest({
            extension: RTOWMRepository.OutwardsModification.get,
            parameters: `_recordId=${recordId}`
          })
          res.record.date = formatDateFromApi(res.record.date)
          fillOutwardData(res.record.outwardId, res.record)
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
                  maxLength='15'
                  readOnly
                  required
                />
              </Grid>
              <Grid item xs={4} sx={{ pl: 1 }}>
                <CustomDatePicker
                  name='date'
                  required
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
                  name='outwardRef'
                  secondDisplayField={false}
                  required
                  label={labels.outward}
                  form={formik}
                  onChange={(event, newValue) => {
                    fillOutwardData(newValue ? newValue.recordId : '', {
                      reference: newValue ? newValue.reference : '',
                      recordId: newValue ? newValue.recordId : '',
                      date: newValue ? formatDateFromApi(newValue.date) : '',
                      oldBeneficiaryId: newValue ? newValue.beneficiaryId : '',
                      oldBeneficiarySeqNo: newValue ? newValue.beneficiarySeqNo : ''
                    })
                  }}
                  error={formik.touched.outwardRef && Boolean(formik.errors.outwardRef)}
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
                  error={formik.touched.date && Boolean(formik.errors.date)}
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
                <ResourceLookup
                  endpointId={CTCLRepository.ClientCorporate.snapshot}
                  parameters={{
                    _category: 0
                  }}
                  valueField='reference'
                  displayField='name'
                  name='clientId'
                  label={labels.client}
                  form={formik}
                  readOnly
                  displayFieldWidth={2}
                  valueShow='clientRef'
                  secondValueShow='clientName'
                  maxAccess={maxAccess}
                  errorCheck={'clientId'}
                />
              </Grid>
              <Grid item xs={8} sx={{ pl: 1, pt: 2 }}>
                <CustomNumberField
                  name='amount'
                  label={labels.amount}
                  value={formik.values.amount}
                  maxAccess={maxAccess}
                  readOnly
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                />
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
                <Grid item xs={2}>
                  <Button
                    sx={{
                      backgroundColor: '#f44336',
                      color: '#FFFFFF',
                      '&:hover': {
                        backgroundColor: alpha('#f44336', 0.8)
                      },
                      '&:disabled': {
                        backgroundColor: alpha('#f44336', 0.8)
                      }
                    }}
                    disabled={clearBenForm || store?.submitted || !displayCash == !displayBank || editMode}
                    onClick={() => {
                      clearForm()
                    }}
                  >
                    Clear
                  </Button>
                </Grid>
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
                        beneficiaryId: formik.values.beneficiaryId,
                        beneficiarySeqNo: formik.values.beneficiarySeqNo
                      }}
                      dispersalType={formik.values.dispersalType}
                      countryId={formik.values.countryId}
                      corId={formik.values.corId}
                      clearBenForm={clearBenForm}
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
                        beneficiaryId: formik.values.beneficiaryId,
                        beneficiarySeqNo: formik.values.beneficiarySeqNo
                      }}
                      dispersalType={formik.values.dispersalType}
                      countryId={formik.values.countryId}
                      corId={formik.values.corId}
                      clearBenForm={clearBenForm}
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
