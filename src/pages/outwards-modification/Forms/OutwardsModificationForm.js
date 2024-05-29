import { Grid } from '@mui/material'
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

export default function OutwardsModificationForm({ maxAccess, labels, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [editMode, setEditMode] = useState(!!recordId)
  const [displayCash, setDisplayCash] = useState(false)
  const [displayBank, setDisplayBank] = useState(false)
  const [store, setStore] = useState({ submitted: false }, { beneficiaryList: {} })

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
      corId: ''
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
  async function fillOutwardData(recordId) {
    const formFields = [
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

    const setFieldValues = values => {
      formFields.forEach(field => {
        formik.setFieldValue(field, values[field] ?? '')
      })
    }

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

      setFieldValues(fieldValues)
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
    if (!dispersalType) {
      setDisplayBank(false)
      setDisplayCash(false)
    }
  }
  useEffect(() => {
    ;(async function () {
      try {
        if (store.beneficiaryList && store.submitted) {
          let beneficiaryBankPack = null
          let beneficiaryCashPack = null

          if (displayCash) beneficiaryCashPack = store.beneficiaryList
          if (displayBank) beneficiaryBankPack = store.beneficiaryList

          const data = {
            outwardId: formik.values.outwardId,
            beneficiaryId: formik.values.beneficiaryId,
            seqNo: '',
            beneficiaryCashPack: beneficiaryCashPack,
            beneficiaryBankPack: beneficiaryBankPack
          }

          const res = await postRequest({
            extension: RTOWMRepository.OutwardsModification.set2,
            record: JSON.stringify(data)
          })

          if (res.record) toast.success('Record Updated Successfully')
        }
      } catch (error) {}
    })()
  }, [store.beneficiaryList])

  return (
    <FormShell resourceId={ResourceIds.OutwardsModification} form={formik} height={480} maxAccess={maxAccess}>
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
            </Grid>
            <Grid container sx={{ display: 'flex', flexDirection: 'row' }}>
              <Grid item xs={4}>
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
                    fillOutwardData(newValue ? newValue.recordId : '')
                  }}
                  error={formik.touched.outwardRef && Boolean(formik.errors.outwardRef)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={4} sx={{ pl: 1, pt: 2 }}>
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
              <Grid item xs={8} sx={{ pl: 1, pt: 2 }}>
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
            </Grid>
            <Grid item xs={4} sx={{ pt: 2 }}>
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
                      beneficiaryId: formik.values.beneficiaryId,
                      beneficiarySeqNo: formik.values.beneficiarySeqNo
                    }}
                    dispersaltype={formik.values.dispersalType}
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
                      beneficiaryId: formik.values.beneficiaryId,
                      beneficiarySeqNo: formik.values.beneficiarySeqNo
                    }}
                    dispersaltype={formik.values.dispersalType}
                    countryId={formik.values.countryId}
                    corId={formik.values.corId}
                    viewBtns={false}
                  />
                )}
              </FieldSet>
            </Grid>
            <Grid container rowGap={2} xs={6} spacing={2} sx={{ pt: 5, pl: 4 }}>
              <FieldSet title='Benificiary [New]'>
                {displayBank && (
                  <BenificiaryBankForm
                    viewBtns={false}
                    store={store}
                    setStore={setStore}
                    editable={true}
                    client={{
                      clientId: formik.values.clientId,
                      clientName: formik.values.clientName,
                      clientRef: formik.values.clientRef
                    }}
                    beneficiary={{
                      beneficiaryId: formik.values.beneficiaryId,
                      beneficiarySeqNo: formik.values.beneficiarySeqNo
                    }}
                    dispersaltype={formik.values.dispersalType}
                    countryId={formik.values.countryId}
                    corId={formik.values.corId}
                  />
                )}
                {displayCash && (
                  <BenificiaryCashForm
                    viewBtns={false}
                    editable={true}
                    client={{
                      clientId: formik.values.clientId,
                      clientName: formik.values.clientName,
                      clientRef: formik.values.clientRef
                    }}
                    beneficiary={{
                      beneficiaryId: formik.values.beneficiaryId,
                      beneficiarySeqNo: formik.values.beneficiarySeqNo
                    }}
                    dispersaltype={formik.values.dispersalType}
                    countryId={formik.values.countryId}
                    corId={formik.values.corId}
                  />
                )}
              </FieldSet>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
