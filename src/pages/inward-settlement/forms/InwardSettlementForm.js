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

// import CloseForm from './CloseForm'

export default function InwardSettlementForm({ labels, recordId, access, plantId, window, userId, dtId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.InwardSettlement.snapshot
  })

  const initialValues = {
    recordId: recordId || null,
    plantId: parseInt(plantId),
    cashAccountId: null,
    inwardId: null,
    corId: null,
    corRef: '',
    corName: '',
    clientId: null,
    clientRef: '',
    clientName: '',
    clientId: null,
    kycId: null,
    notes: '',
    wip: 1,
    paymentType: null,
    token: '',
    plantName: '',
    plantRef: '',
    cashAccountName: '',
    inwardRef: '',
    dtName: '',
    statusName: '',
    corRef: '',
    corName: ''
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
    validationSchema: yup.object({}),
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
        formik.setFieldValue('recordId', res.recordId)
        invalidate()

        const res2 = await getRequest({
          extension: RemittanceOutwardsRepository.InwardSettlement.get,
          parameters: `_recordId=${res.recordId}`
        })
        formik.setValues(res2.record)
        toast.success(platformLabels.Added)
      } catch (error) {
        stackError(error)
      }
    }
  })
  const editMode = !!formik.values.recordId
  const isClosed = formik.values.status === 4

  const chooseClient = async clientId => {
    try {
      if (clientId) {
        const res = await getRequest({
          extension: RTCLRepository.CtClientIndividual.get2,
          parameters: `_clientId=${clientId}`
        })
        formik.setFieldValue('idNo', res?.record?.clientIDView?.idNo)
        formik.setFieldValue('expiryDate', formatDateFromApi(res?.record?.clientIDView?.idExpiryDate))
        formik.setFieldValue('firstName', res?.record?.clientIndividual?.firstName)
        formik.setFieldValue('middleName', res?.record?.clientIndividual?.middleName)
        formik.setFieldValue('lastName', res?.record?.clientIndividual?.lastName)
        formik.setFieldValue('familyName', res?.record?.clientIndividual?.familyName)
        formik.setFieldValue('fl_firstName', res?.record?.clientIndividual?.fl_firstName)
        formik.setFieldValue('fl_middleName', res?.record?.clientIndividual?.fl_middleName)
        formik.setFieldValue('fl_lastName', res?.record?.clientIndividual?.fl_lastName)
        formik.setFieldValue('fl_familyName', res?.record?.clientIndividual?.fl_familyName)
        formik.setFieldValue('professionId', res?.record?.clientIndividual?.professionId)
        formik.setFieldValue('cellPhone', res?.record?.clientMaster?.cellPhone)
        formik.setFieldValue('nationalityId', res?.record?.clientMaster?.nationalityId)
        formik.setFieldValue('hiddenTrxCount', res?.record?.clientRemittance?.trxCountPerYear)
        formik.setFieldValue('hiddenTrxAmount', res?.record?.clientRemittance?.trxAmountPerYear)
        formik.setFieldValue('hiddenSponserName', res?.record?.clientIndividual?.sponsorName)
      }
    } catch (error) {}
  }

  useEffect(() => {
    const fetchRecord = async () => {
      if (recordId) {
        try {
          const res = await getRequest({
            extension: RemittanceOutwardsRepository.InwardSettlement.get,
            parameters: `_recordId=${recordId}`
          })

          if (res.record) {
            const record = {
              ...res.record,
              date: formatDateFromApi(res.record.date)
            }

            formik.setValues(record)
          }
        } catch (error) {
          stackError(error)
        }
      }
    }
    fetchRecord()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.InwardSettlement}
      form={formik}
      editMode={editMode}
      maxAccess={maxAccess}
      functionId={SystemFunction.InwardSettlement}
      disabledSubmit={editMode}
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
                    <CustomTextField
                      name='inwardRef'
                      label={labels.inwardRef}
                      value={formik?.values?.inwardRef}
                      maxAccess={maxAccess}
                      maxLength='50'
                      readOnly={editMode}
                      required
                      error={formik.touched.inwardRef && Boolean(formik.errors.inwardRef)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('inwardRef', '')}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomDatePicker
                      name='inwardDate'
                      required
                      label={labels.inwardDate}
                      value={formik?.values?.inwardDate}
                      readOnly={editMode}
                      onChange={formik.setFieldValue}
                      editMode={editMode}
                      maxAccess={maxAccess}
                      onClear={() => formik.setFieldValue('inwardDate', '')}
                      error={formik.touched.inwardDate && Boolean(formik.errors.inwardDate)}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <ResourceLookup
                      endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                      valueField='reference'
                      displayField='name'
                      name='corId'
                      label={labels.Correspondant}
                      form={formik}
                      required={formik.values.corId}
                      displayFieldWidth={2}
                      valueShow='corRef'
                      secondValueShow='corName'
                      maxAccess={maxAccess}
                      editMode={editMode}
                      onChange={async (event, newValue) => {
                        formik.setFieldValue('corId', newValue ? newValue.recordId : null)
                        formik.setFieldValue('corName', newValue ? newValue.name : null)
                        formik.setFieldValue('corRef', newValue ? newValue.reference : null)
                      }}
                      errorCheck={'corId'}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomDatePicker
                      name='inwardDate'
                      required
                      label={labels.inwardDate}
                      value={formik?.values?.inwardDate}
                      readOnly={editMode}
                      onChange={formik.setFieldValue}
                      editMode={editMode}
                      maxAccess={maxAccess}
                      onClear={() => formik.setFieldValue('inwardDate', '')}
                      error={formik.touched.inwardDate && Boolean(formik.errors.inwardDate)}
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
                      readOnly={editMode}
                      maxLength='20'
                      required
                      error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('firstName', '')}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='middleName'
                      label={labels.middleName}
                      value={formik?.values?.middleName}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='20'
                      error={formik.touched.middleName && Boolean(formik.errors.middleName)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('middleName', '')}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='lastName'
                      label={labels.lastName}
                      value={formik?.values?.lastName}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='20'
                      required
                      error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('lastName', '')}
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
                      name='nationality'
                      label={labels.nationality}
                      valueField='record'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('nationality', newValue ? newValue.record : '')
                      }}
                      error={formik.touched.nationality && Boolean(formik.errors.nationality)}
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
                      name='category'
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
                        <Checkbox name='isResident' checked={formik.values.isResident} maxAccess={maxAccess} readOnly />
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
                      name='firstName'
                      label={labels.firstName}
                      value={formik?.values?.firstName}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      values={formik.values}
                      endpointId={SystemRepository.Country.qry}
                      name='countryId'
                      label={labels.countryId}
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
                      name='idtId'
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
                      name='middleName'
                      label={labels.middleName}
                      value={formik?.values?.middleName}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='state'
                      label={labels.state}
                      value={formik?.values?.state}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='idNo'
                      label={labels.idNo}
                      value={formik?.values?.idNo}
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
                      name='lastName'
                      label={labels.lastName}
                      value={formik?.values?.lastName}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='city'
                      label={labels.city}
                      value={formik.values.city}
                      readOnly
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomDatePicker
                      name='idIssueDate'
                      label={labels.idIssueDate}
                      value={formik?.values?.idIssueDate}
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
                      name='fl_firstName'
                      label={labels.fl_firstName}
                      value={formik?.values?.fl_firstName}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='cityDistrict'
                      label={labels.cityDistrict}
                      value={formik.values.cityDistrict}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomDatePicker
                      name='idExpiryDate'
                      label={labels.idExpiryDate}
                      value={formik?.values?.idExpiryDate}
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
                      name='fl_middleName'
                      label={labels.fl_middleName}
                      value={formik?.values?.fl_middleName}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      endpointId={RemittanceSettingsRepository.Profession.qry}
                      label={labels.profession}
                      name='professionId'
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
                      name='idIssueCountry'
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
                      name='fl_lastName'
                      label={labels.fl_lastName}
                      value={formik?.values?.fl_lastName}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      endpointId={RemittanceSettingsRepository.Profession.qry}
                      label={labels.profession}
                      name='professionId'
                      displayField={['reference', 'name']}
                      valueField='recordId'
                      values={formik.values}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomDatePicker
                      name='birthDate'
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
                      label={labels.Nationality}
                      name='nationalityId'
                      displayField={['reference', 'name']}
                      valueField='recordId'
                      values={formik.values}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='sponsor'
                      label={labels.sponsor}
                      value={formik?.values?.sponsor}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      endpointId={BusinessPartnerRepository.RelationTypes.qry}
                      name='relationId'
                      label={labels.relation}
                      valueField='recordId'
                      displayField='name'
                      values={formik.values}
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
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      values={formik.values}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('currencyId', newValue?.recordId || null)
                      }}
                      error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
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
                      readOnly={editMode}
                      onChange={e => formik.setFieldValue('charges', e.target.value)}
                      onClear={() => formik.setFieldValue('charges', '')}
                      error={formik.touched.charges && Boolean(formik.errors.charges)}
                      maxLength={15}
                      decimalScale={2}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomNumberField
                      name='netAmount'
                      required
                      label={labels.netAmount}
                      value={formik.values.netAmount}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={e => formik.setFieldValue('netAmount', e.target.value)}
                      onClear={() => formik.setFieldValue('netAmount', '')}
                      error={formik.touched.netAmount && Boolean(formik.errors.netAmount)}
                      maxLength={15}
                      decimalScale={2}
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
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      values={formik.values}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('sourceOfIncome', newValue?.recordId || null)
                      }}
                      error={formik.touched.sourceOfIncome && Boolean(formik.errors.sourceOfIncome)}
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
                  <Grid item xs={4}></Grid>
                  <Grid item xs={4}></Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
