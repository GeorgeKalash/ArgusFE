import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FieldSet from 'src/components/Shared/FieldSet'
import FormShell from 'src/components/Shared/FormShell'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useError } from 'src/error'
import { useWindow } from 'src/windows'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataSets } from 'src/resources/DataSets'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemFunction } from 'src/resources/SystemFunction'
import * as yup from 'yup'
import { ControlContext } from 'src/providers/ControlContext'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'

export default function InwardSettlementForm({ labels, recordId, access, plantId, cashAccountId, dtId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.InwardSettlement.snapshot
  })

  const initialValues = {
    recordId: recordId || null,
    dtId: parseInt(dtId),
    date: new Date(),
    reference: null,
    plantId: parseInt(plantId),
    cashAccountId: parseInt(cashAccountId),
    inwardId: null,
    inwardRef: null,
    corId: null,
    corRef: null,
    corName: null,
    clientId: null,
    clientRef: null,
    clientName: '',
    kycId: null,
    notes: null,
    paymentType: null,
    token: null,
    wip: 1,
    status: 1,
    releaseStatus: null
  }

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.InwardSettlement,
    access,
    enabled: !recordId
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      inwardId: yup.string().required(),
      clientId: yup.string().required()
    }),
    onSubmit: async () => {
      try {
        const copy = { ...formik.values }
        copy.date = formatDateToApi(copy?.date)
        copy.baseAmount = copy?.baseAmount === '' ? copy?.amount : copy?.baseAmount
        copy.sender_idIssueDate = copy.sender_idIssueDate ? formatDateToApi(copy?.sender_idIssueDate) : null
        copy.sender_idExpiryDate = copy.sender_idExpiryDate ? formatDateToApi(copy?.sender_idExpiryDate) : null
        copy.idIssueDate = copy.idIssueDate ? formatDateToApi(copy?.idIssueDate) : null
        copy.idExpiryDate = copy.idExpiryDate ? formatDateToApi(copy?.idExpiryDate) : null
        copy.expiryDate = copy.expiryDate ? formatDateToApi(copy?.expiryDate) : null

        const res = await postRequest({
          extension: RemittanceOutwardsRepository.InwardSettlement.set,
          record: JSON.stringify(copy)
        })

        invalidate()
        const res2 = await getInwardSettlement(res.recordId)
        formik.setValues(res2.record)
        toast.success(platformLabels.Added)
      } catch (error) {
        stackError(error)
      }
    }
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2

  const chooseClient = async clientId => {
    try {
      if (clientId) {
        const res = await getRequest({
          extension: RTCLRepository.CtClientIndividual.get2,
          parameters: `_clientId=${clientId}`
        })
        formik.setFieldValue('cl_category', res?.record?.clientMaster?.category)
        formik.setFieldValue('cl_isResident', res?.record?.clientIndividual?.isResident)
        formik.setFieldValue('cl_firstName', res?.record?.clientIndividual?.firstName)
        formik.setFieldValue('cl_middleName', res?.record?.clientIndividual?.middleName)
        formik.setFieldValue('cl_lastName', res?.record?.clientIndividual?.lastName)
        formik.setFieldValue('cl_fl_firstName', res?.record?.clientIndividual?.fl_firstName)
        formik.setFieldValue('cl_fl_middleName', res?.record?.clientIndividual?.fl_middleName)
        formik.setFieldValue('cl_fl_lastName', res?.record?.clientIndividual?.fl_lastName)
        formik.setFieldValue('cl_countryId', res?.record?.clientIDView?.idCountryId)
        formik.setFieldValue('cl_idtId', res?.record?.clientIDView?.idtId)
        formik.setFieldValue('cl_state', res?.record?.addressView?.stateName)
        formik.setFieldValue('cl_idNo', res?.record?.clientIDView?.idNo)
        formik.setFieldValue('cl_city', res?.record?.addressView?.city)
        formik.setFieldValue('cl_idIssueDate', formatDateFromApi(res?.record?.clientIDView?.idIssueDate))
        formik.setFieldValue('cl_cityDistrict', res?.record?.addressView?.cityDistrict)
        formik.setFieldValue('cl_idExpiryDate', formatDateFromApi(res?.record?.clientIDView?.idExpiryDate))
        formik.setFieldValue('cl_professionId', res?.record?.clientIndividual?.professionId)
        formik.setFieldValue('cl_sponsor', res?.record?.clientIndividual?.sponsorName)
        formik.setFieldValue('cl_idIssueCountry', res?.record?.clientIDView?.idCountryId)
        formik.setFieldValue('cl_nationalityId', res?.record?.clientMaster?.nationalityId)
        formik.setFieldValue('cl_birthDate', formatDateFromApi(res?.record?.clientIndividual?.birthDate))
        formik.setFieldValue('cl_relationId', res?.record?.clientRemittance?.trxCountPerYear)
      } else {
        formik.setFieldValue('cl_category', '')
        formik.setFieldValue('cl_isResident', '')
        formik.setFieldValue('cl_firstName', '')
        formik.setFieldValue('cl_middleName', '')
        formik.setFieldValue('cl_lastName', '')
        formik.setFieldValue('cl_fl_firstName', '')
        formik.setFieldValue('cl_fl_middleName', '')
        formik.setFieldValue('cl_fl_lastName', '')
        formik.setFieldValue('cl_countryId', '')
        formik.setFieldValue('cl_idtId', '')
        formik.setFieldValue('cl_state', '')
        formik.setFieldValue('cl_idNo', '')
        formik.setFieldValue('cl_city', '')
        formik.setFieldValue('cl_idIssueDate', '')
        formik.setFieldValue('cl_cityDistrict', '')
        formik.setFieldValue('cl_idExpiryDate', '')
        formik.setFieldValue('cl_professionId', '')
        formik.setFieldValue('cl_sponsor', '')
        formik.setFieldValue('cl_idIssueCountry', '')
        formik.setFieldValue('cl_nationalityId', '')
        formik.setFieldValue('cl_birthDate', '')
        formik.setFieldValue('cl_relationId', '')
      }
    } catch (error) {}
  }

  const chooseInward = async inwardId => {
    try {
      if (inwardId) {
        const res = await getRequest({
          extension: RemittanceOutwardsRepository.InwardsTransfer.get,
          parameters: `_recordId=${inwardId}`
        })
        formik.setFieldValue('inwardDate', formatDateFromApi(res?.record?.date))
        formik.setFieldValue('corName', res?.record?.corName)
        formik.setFieldValue('corRef', res?.record?.corRef)
        formik.setFieldValue('currencyId', res?.record?.currencyId)
        formik.setFieldValue('firstName', res?.record?.sender_firstName)
        formik.setFieldValue('lastName', res?.record?.sender_lastName)
        formik.setFieldValue('middleName', res?.record?.sender_middleName)
        formik.setFieldValue('nationalityId', res?.record?.sender_nationalityId)
        formik.setFieldValue('sourceOfIncome', res?.record?.sourceOfIncome)
        formik.setFieldValue('charges', res?.record?.charges)
        formik.setFieldValue('netAmount', res?.record?.netAmount)
        formik.setFieldValue('amount', res?.record?.amount)
        formik.setFieldValue('netAmount', res?.record?.netAmount)
        formik.setFieldValue('vatAmount', res?.record?.taxAmount)
      } else {
        formik.setFieldValue('inwardDate', '')
        formik.setFieldValue('corName', '')
        formik.setFieldValue('corRef', '')
        formik.setFieldValue('currencyId', '')
        formik.setFieldValue('firstName', '')
        formik.setFieldValue('lastName', '')
        formik.setFieldValue('middleName', '')
        formik.setFieldValue('nationalityId', '')
        formik.setFieldValue('sourceOfIncome', '')
        formik.setFieldValue('charges', '')
        formik.setFieldValue('netAmount', '')
        formik.setFieldValue('amount', '')
        formik.setFieldValue('vatAmount', '')
      }
    } catch (error) {}
  }

  async function getInwardSettlement(recordId) {
    try {
      return await getRequest({
        extension: RemittanceOutwardsRepository.InwardSettlement.get,
        parameters: `_recordId=${recordId}`
      })
    } catch (error) {}
  }

  const onClose = async () => {
    try {
      const res = await postRequest({
        extension: RemittanceOutwardsRepository.InwardSettlement.close,
        record: JSON.stringify({
          recordId: formik.values.recordId
        })
      })
      const res2 = await getInwardSettlement(res.recordId)
      formik.setValues({
        ...res2.record,
        date: formatDateFromApi(res.record.date)
      })
      toast.success(platformLabels.Closed)
      invalidate()
    } catch (error) {}
  }

  const actions = [
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getInwardSettlement(recordId)
        formik.setValues({
          ...res.record,
          date: formatDateFromApi(res.record.date)
        })
        await chooseInward(res?.record?.inwardId)
        await chooseClient(res?.record?.clientId)
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.InwardSettlement}
      form={formik}
      editMode={editMode}
      maxAccess={maxAccess}
      functionId={SystemFunction.InwardSettlement}
      actions={actions}
      onClose={onClose}
      isClosed={isClosed}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Fixed>
          <FieldSet title={labels.header} sx={{ flex: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='reference'
                      label={labels.reference}
                      value={formik?.values?.reference}
                      maxAccess={maxAccess}
                      maxLength='15'
                      readOnly={editMode}
                      onChange={e => formik.setFieldValue('reference', e.target.value)}
                      error={formik.touched.reference && Boolean(formik.errors.reference)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomDatePicker
                      name='date'
                      required
                      label={labels.date}
                      value={formik?.values?.date}
                      readOnly={editMode}
                      onChange={formik.setFieldValue}
                      editMode={editMode}
                      maxAccess={maxAccess}
                      onClear={() => formik.setFieldValue('date', '')}
                      error={formik.touched.date && Boolean(formik.errors.date)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <ResourceComboBox
                      values={formik.values}
                      datasetId={DataSets.DOCUMENT_STATUS}
                      name='status'
                      label={labels.status}
                      valueField='key'
                      displayField='value'
                      readOnly={true}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('status', newValue?.key)
                      }}
                      error={formik.touched.status && Boolean(formik.errors.status)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='token'
                      label={labels.token}
                      value={formik?.values?.token}
                      maxAccess={maxAccess}
                      maxLength='15'
                      readOnly={editMode}
                      onChange={e => formik.setFieldValue('token', e.target.value)}
                      error={formik.touched.token && Boolean(formik.errors.token)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet sx={{ flex: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <ResourceLookup
                      endpointId={RemittanceOutwardsRepository.InwardsTransfer.snapshot}
                      valueField='reference'
                      displayField='name'
                      name='inwardId'
                      label={labels.inwardRef}
                      form={formik}
                      required
                      displayFieldWidth={2}
                      valueShow='inwardRef'
                      secondValueShow='name'
                      maxAccess={maxAccess}
                      editMode={editMode}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      onChange={async (event, newValue) => {
                        formik.setFieldValue('inwardId', newValue ? newValue.recordId : '')
                        formik.setFieldValue('inwardName', newValue ? newValue.name : '')
                        formik.setFieldValue('inwardRef', newValue ? newValue.reference : '')
                        await chooseInward(newValue?.recordId)
                      }}
                      errorCheck={'inwardId'}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomDatePicker
                      name='inwardDate'
                      label={labels.inwardDate}
                      value={formik?.values?.inwardDate}
                      readOnly
                      maxAccess={maxAccess}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <ResourceLookup
                      endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                      values={formik.values}
                      valueField='reference'
                      displayField='name'
                      name='corRef'
                      readOnly
                      valueShow='corName'
                      label={labels.Correspondant}
                      form={formik}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <ResourceComboBox
                      endpointId={SystemRepository.Currency.qry}
                      name='correspondantCurrency'
                      label={labels.correspondantCurrency}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      values={formik.values}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('correspondantCurrency', newValue?.recordId || null)
                      }}
                      error={formik.touched.correspondantCurrency && Boolean(formik.errors.correspondantCurrency)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet sx={{ flex: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='firstName'
                      label={labels.firstName}
                      value={formik?.values?.firstName}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='middleName'
                      label={labels.middleName}
                      value={formik?.values?.middleName}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='lastName'
                      label={labels.lastName}
                      value={formik?.values?.lastName}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      values={formik.values}
                      endpointId={SystemRepository.Country.qry}
                      name='nationalityId'
                      label={labels.nationality}
                      valueField='record'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('nationalityId', newValue ? newValue.record : '')
                      }}
                      error={formik.touched.nationalityId && Boolean(formik.errors.nationalityId)}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      required
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      datasetId={DataSets.ID_CATEGORY}
                      name='category'
                      label={labels.category}
                      required
                      valueField='key'
                      displayField='value'
                      values={formik.values}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('type', '')
                        formik && formik.setFieldValue('category', parseInt(newValue?.key))
                      }}
                      error={formik.touched.category && Boolean(formik.errors.category)}
                    />
                  </Grid>
                  <Grid item xs={4}></Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet sx={{ flex: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <ResourceLookup
                      endpointId={CTCLRepository.ClientCorporate.snapshot}
                      parameters={{
                        _category: 0
                      }}
                      valueField='reference'
                      displayField='name'
                      name='clientId'
                      label={labels.Client}
                      form={formik}
                      required
                      displayFieldWidth={2}
                      valueShow='clientRef'
                      secondValueShow='clientName'
                      maxAccess={maxAccess}
                      editMode={editMode}
                      onChange={async (event, newValue) => {
                        formik.setFieldValue('clientId', newValue ? newValue.recordId : '')
                        formik.setFieldValue('clientName', newValue ? newValue.name : '')
                        formik.setFieldValue('clientRef', newValue ? newValue.reference : '')
                        await chooseClient(newValue?.recordId)
                      }}
                      errorCheck={'clientId'}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      datasetId={DataSets.ID_CATEGORY}
                      name='cl_category'
                      readOnly
                      label={labels.category}
                      valueField='key'
                      displayField='value'
                      values={formik.values}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name='cl_isResident'
                          checked={formik.values.isResident}
                          maxAccess={maxAccess}
                          readOnly
                        />
                      }
                      label={labels.isResident}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='cl_firstName'
                      label={labels.firstName}
                      value={formik?.values?.cl_firstName}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      values={formik.values}
                      endpointId={SystemRepository.Country.qry}
                      name='cl_countryId'
                      label={labels.country}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      values={formik.values}
                      endpointId={CurrencyTradingSettingsRepository.IdTypes.qry}
                      name='cl_idtId'
                      label={labels.idtId}
                      valueField='recordId'
                      displayField={['name']}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='cl_middleName'
                      label={labels.middleName}
                      value={formik?.values?.cl_middleName}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='cl_state'
                      label={labels.state}
                      value={formik?.values?.cl_state}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='cl_idNo'
                      label={labels.idNo}
                      value={formik?.values?.cl_idNo}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='cl_lastName'
                      label={labels.lastName}
                      value={formik?.values?.cl_lastName}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='cl_city'
                      label={labels.city}
                      value={formik?.values?.cl_city}
                      readOnly
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomDatePicker
                      name='cl_idIssueDate'
                      label={labels.idIssueDate}
                      value={formik?.values?.cl_idIssueDate}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='cl_fl_firstName'
                      label={labels.fl_firstName}
                      value={formik?.values?.cl_fl_firstName}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='cl_cityDistrict'
                      label={labels.cityDistrict}
                      value={formik?.values?.cl_cityDistrict}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomDatePicker
                      name='cl_idExpiryDate'
                      label={labels.idExpiryDate}
                      value={formik?.values?.cl_idExpiryDate}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='cl_fl_middleName'
                      label={labels.fl_middleName}
                      value={formik?.values?.cl_fl_middleName}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      endpointId={RemittanceSettingsRepository.Profession.qry}
                      label={labels.profession}
                      name='cl_professionId'
                      displayField={['reference', 'name']}
                      valueField='recordId'
                      values={formik.values}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      values={formik.values}
                      endpointId={SystemRepository.Country.qry}
                      name='cl_idIssueCountry'
                      label={labels.idIssueCountry}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='cl_fl_lastName'
                      label={labels.fl_lastName}
                      value={formik?.values?.cl_fl_lastName}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      endpointId={RemittanceSettingsRepository.Profession.qry}
                      label={labels.profession}
                      name='cl_professionId'
                      displayField={['reference', 'name']}
                      valueField='recordId'
                      values={formik.values}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomDatePicker
                      name='cl_birthDate'
                      label={labels.birthDate}
                      value={formik?.values?.birthDate}
                      editMode
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      endpointId={SystemRepository.Country.qry}
                      label={labels.nationality}
                      name='cl_nationalityId'
                      displayField={['reference', 'name']}
                      valueField='recordId'
                      values={formik.values}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='cl_sponsor'
                      label={labels.sponsor}
                      value={formik?.values?.cl_sponsor}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      endpointId={BusinessPartnerRepository.RelationTypes.qry}
                      name='relationId'
                      label={labels.relationId}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      valueField='recordId'
                      displayField='name'
                      values={formik.values}
                      required
                      onChange={(event, newValue) => {
                        formik && formik.setFieldValue('relationId', newValue?.recordId || '')
                      }}
                      error={formik.touched.relationId && Boolean(formik.errors.relationId)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet sx={{ flex: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='paymentType'
                      label={labels.paymentType}
                      value={formik?.values?.paymentType}
                      maxAccess={maxAccess}
                      readOnly
                      maxLength='50'
                      error={formik.touched.paymentType && Boolean(formik.errors.paymentType)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('paymentType', '')}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      endpointId={SystemRepository.Currency.qry}
                      name='currencyId'
                      label={labels.currency}
                      displayField={['reference', 'name']}
                      valueField='recordId'
                      values={formik.values}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomNumberField
                      name='vatAmount'
                      required
                      label={labels.vatAmount}
                      value={formik.values.vatAmount}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={e => formik.setFieldValue('vatAmount', e.target.value)}
                      onClear={() => formik.setFieldValue('vatAmount', '')}
                      error={formik.touched.vatAmount && Boolean(formik.errors.vatAmount)}
                      maxLength={15}
                      decimalScale={2}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomNumberField
                      name='amount'
                      required
                      label={labels.amount}
                      value={formik.values.amount}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={e => formik.setFieldValue('amount', e.target.value)}
                      onClear={() => formik.setFieldValue('amount', '')}
                      error={formik.touched.amount && Boolean(formik.errors.amount)}
                      maxLength={15}
                      decimalScale={2}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomNumberField
                      name='charges'
                      required
                      label={labels.charges}
                      value={formik.values.charges}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomNumberField
                      name='netAmount'
                      required
                      label={labels.netAmount}
                      value={formik?.values?.netAmount}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      endpointId={CurrencyTradingSettingsRepository.PurposeExchange.qry}
                      name='purposeOfExchange'
                      label={labels.purposeOfExchange}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      values={formik.values}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('purposeOfExchange', newValue?.recordId || null)
                      }}
                      error={formik.touched.purposeOfExchange && Boolean(formik.errors.purposeOfExchange)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      endpointId={RemittanceSettingsRepository.SourceOfIncome.qry}
                      name='sourceOfIncome'
                      label={labels.sourceOfIncome}
                      valueField='recordId'
                      readOnly
                      values={formik.values}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={4}></Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomTextArea
                      name='remarks'
                      label={labels.remarks}
                      value={formik.values.remarks}
                      maxLength='200'
                      readOnly={editMode}
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('remarks', '')}
                      error={formik.touched.remarks && Boolean(formik.errors.remarks)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
