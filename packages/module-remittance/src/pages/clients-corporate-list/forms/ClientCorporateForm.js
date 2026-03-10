import { Grid } from '@mui/material'
import { useState, useEffect, useContext } from 'react'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import AddressTab from '@argus/shared-ui/src/components/Shared/AddressTab'
import FieldSet from '@argus/shared-ui/src/components/Shared/FieldSet'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { TextFieldReference } from '@argus/shared-ui/src/components/Shared/TextFieldReference'
import { CurrencyTradingSettingsRepository } from '@argus/repositories/src/repositories/CurrencyTradingSettingsRepository'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { CTCLRepository } from '@argus/repositories/src/repositories/CTCLRepository'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { BusinessPartnerRepository } from '@argus/repositories/src/repositories/BusinessPartnerRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'

const ClientCorporateForm = ({ recordId, _labels, maxAccess, setErrorMessage }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [referenceRequired, setReferenceRequired] = useState(true)
  const { platformLabels } = useContext(ControlContext)
  const [formikSettings, setFormik] = useState({})

  const { formik } = useForm({
    initialValues: {
      //ClientCorporate
      clientId: null,
      lgsId: null,
      industry: null,
      activityId: null,
      capital: null,
      trading: false,
      outward: false,
      inward: false,

      //clientMaster
      category: null,
      reference: null,
      name: null,
      flName: null,
      keyword: null,
      nationalityId: null,
      expiryDate: null,
      addressId: null,
      category: null,
      createdDate: null,
      status: -1,
      addressId: null,
      plantId: null,
      cellPhone: null,
      cellPhoneRepeat: null,
      otp: null
    },
    maxAccess: formikSettings.maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      ...formikSettings.validate,
      reference: referenceRequired && yup.string().required(),
      expiryDate: yup.date().required(),
      name1: yup.string().required(),
      nationalityId: yup.number().required(),
      cellPhone: yup.string().required(),
      capital: yup.string().required(),
      lgsId: yup.number().required(),
      industry: yup.string().required(),
      activityId: yup.number().required()
    }),
    onSubmit: async values => {
      await postRtDefault(values)
    }
  })

  const postRtDefault = async obj => {
    const date = new Date()

    const obj1 = {
      clientId: 0,
      lgsId: obj.lgsId,
      industry: obj.industry,
      activityId: obj.activityId,
      capital: obj.capital,
      trading: obj.trading,
      outward: obj.outward,
      inward: obj.inward
    }

    //ClientMaster
    const obj2 = {
      category: 2,
      reference: obj.reference,
      name: obj.name1,
      flName: obj.flName,
      nationalityId: obj.nationalityId,
      status: obj.status,
      plantId: formik.values.plantId,
      cellPhone: obj.cellPhone,
      oldReference: obj.oldReference,
      otp: obj.otpVerified,
      ExpiryDate: formatDateToApi(obj.expiryDate),
      createdDate: formatDateToApi(date)
    }

    // Address
    const obj3 = {
      name: obj.name,
      countryId: obj.countryId,
      stateId: obj.stateId,
      cityId: obj.cityId,
      cityName: obj.cityName,
      street1: obj.street1,
      street2: obj.street2,
      email1: obj.email1,
      email2: obj.email2,
      phone: obj.phone,
      phone2: obj.phone2,
      phone3: obj.phone3,
      addressId: obj.addressId,
      postalCode: obj.postalCode,
      cityDistrictId: obj.cityDistrictId,
      bldgNo: obj.bldgNo,
      unitNo: obj.unitNo,
      subNo: obj.subNo,
      poBox: obj.poBox
    }

    const data = {
      clientMaster: obj2,
      clientCorporate: obj1,
      address: obj3
    }

    const res = await postRequest({
      extension: CTCLRepository.ClientCorporate.set2,
      record: JSON.stringify(data)
    })
    toast.success(platformLabels.Submit)
    await getClient(res.recordId)
  }

  async function getClient(recordId) {
    if (recordId) {
      const res = await getRequest({
        extension: CTCLRepository.ClientCorporate.get,
        parameters: `_clientId=${recordId}`
      })
      const obj = res?.record

      formik.setValues({
        ...obj.clientCorporate,
        ...obj.addressView,
        ...obj.clientMaster,
        expiryDate: obj.clientMaster.expiryDate ? formatDateFromApi(obj.clientMaster.expiryDate) : null,
        createdDate: obj.clientMaster.createdDate ? formatDateFromApi(obj.clientMaster.createdDate) : null,
        name1: obj.clientMaster.name
      })
    }
  }

  const editMode = !!formik.values.recordId

  useEffect(() => {
    getClient(recordId)
  }, [recordId])

  const actions = [
    {
      key: 'Client Relation',
      condition: true,
      onClick: 'onClientRelation',
      disabled: !editMode
    },
    {
      key: 'Add Client Relation',
      condition: true,
      onClick: 'onAddClientRelation',
      disabled: !editMode
    },
    {
      key: 'Client Balance',
      condition: true,
      onClick: 'onClientBalance',
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      actions={actions}
      form={formik}
      resourceId={ResourceIds.ClientCorporate}
      maxAccess={maxAccess}
      recordId={recordId}
      disabledSubmit={editMode}
      editMode={editMode}
      setErrorMessage={setErrorMessage}
    >
      <VertLayout>
        <Grow>
          <Grid container xs={12} spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextFieldReference
                    name='reference'
                    label={_labels.reference}
                    value={formik.values?.reference}
                    endpointId={CurrencyTradingSettingsRepository.Defaults.get}
                    param={'ct-nra-corporate'}
                    setReferenceRequired={setReferenceRequired}
                    onChange={formik.handleChange}
                    maxLength='10'
                    editMode={editMode}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                    helperText={formik.touched.reference && formik.errors.reference}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='expiryDate'
                    label={_labels.expiryDate}
                    value={formik.values?.expiryDate}
                    readOnly={editMode}
                    required={true}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('expiryDate', '')}
                    disabledDate={!editMode && '<'}
                    error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Grid container xs={12}>
                    <FieldSet title={_labels.title}>
                      <Grid container xs={12} spacing={2}>
                        <Grid item xs={12}>
                          <CustomTextField
                            name='cellPhone'
                            phone={true}
                            label={_labels.cellPhone}
                            value={formik.values?.cellPhone}
                            readOnly={editMode}
                            required
                            onChange={formik.handleChange}
                            maxLength='15'
                            onClear={() => formik.setFieldValue('cellPhone', '')}
                            error={formik.touched.cellPhone && Boolean(formik.errors.cellPhone)}
                            maxAccess={maxAccess}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <CustomTextField
                            name='name1'
                            label={_labels.name}
                            value={formik.values?.name1}
                            required
                            onChange={formik.handleChange}
                            readOnly={editMode}
                            onClear={() => formik.setFieldValue('name1', '')}
                            error={formik.touched.name1 && Boolean(formik.errors.name1)}
                            maxAccess={maxAccess}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <CustomTextField
                            name='flName'
                            label={_labels.ForeignName}
                            value={formik.values?.flName}
                            onChange={formik.handleChange}
                            maxLength='10'
                            readOnly={editMode}
                            onClear={() => formik.setFieldValue('flName', '')}
                            error={formik.touched.flName && Boolean(formik.errors.flName)}
                            maxAccess={maxAccess}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <ResourceComboBox
                            endpointId={SystemRepository.Country.qry}
                            name='nationalityId'
                            label={_labels.nationality}
                            valueField='recordId'
                            displayField={['reference', 'name', 'flName']}
                            columnsInDropDown={[
                              { key: 'reference', value: 'Reference' },
                              { key: 'name', value: 'Name' },
                              { key: 'flName', value: 'Foreign Language Name' }
                            ]}
                            readOnly={editMode}
                            values={formik.values}
                            required
                            onChange={(event, newValue) => {
                              if (newValue) {
                                formik.setFieldValue('nationalityId', newValue?.recordId)
                                formik.setFieldValue('nationalityName', newValue?.name)
                              } else {
                                formik.setFieldValue('nationalityId', '')
                                formik.setFieldValue('nationalityName', '')
                              }
                            }}
                            error={formik.touched.nationalityId && Boolean(formik.errors.nationalityId)}
                            maxAccess={maxAccess}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <ResourceComboBox
                            name='status'
                            label={_labels.status}
                            datasetId={DataSets.ACTIVE_STATUS}
                            values={formik.values}
                            valueField='key'
                            displayField='value'
                            readOnly={true}
                            onChange={(event, newValue) => {
                              if (newValue) {
                                formik.setFieldValue('status', newValue?.key)
                              } else {
                                formik.setFieldValue('status', newValue?.key)
                              }
                            }}
                            error={formik.touched.status && Boolean(formik.errors.status)}
                            maxAccess={maxAccess}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <CustomTextField
                            name='oldReference'
                            label={_labels.oldReference}
                            value={formik.values?.oldReference}
                            readOnly={editMode}
                            onChange={formik.handleChange}
                            maxLength='10'
                            onClear={() => formik.setFieldValue('oldReference', '')}
                            error={formik.touched.oldReference && Boolean(formik.errors.oldReference)}
                            maxAccess={maxAccess}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <ResourceComboBox
                            endpointId={BusinessPartnerRepository.LegalStatus.qry}
                            parameters='_pagesize=30&_startAt=0&_filter'
                            name='lgsId'
                            label={_labels.legalStatus}
                            valueField='recordId'
                            displayField={['reference', 'name']}
                            columnsInDropDown={[
                              { key: 'reference', value: 'Reference' },
                              { key: 'name', value: 'Name' }
                            ]}
                            readOnly={editMode}
                            values={formik.values}
                            required
                            onChange={(event, newValue) => {
                              if (newValue) {
                                formik.setFieldValue('lgsId', newValue?.recordId)
                              } else {
                                formik.setFieldValue('lgsId', '')
                              }
                            }}
                            error={formik.touched.lgsId && Boolean(formik.errors.lgsId)}
                            maxAccess={maxAccess}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <ResourceComboBox
                            datasetId={DataSets.INDUSTRY}
                            name='industry'
                            label={_labels.industry}
                            valueField='key'
                            displayField='value'
                            readOnly={editMode}
                            values={formik.values}
                            required
                            onChange={(event, newValue) => {
                              if (newValue) {
                                formik.setFieldValue('industry', newValue?.key)
                              } else {
                                formik.setFieldValue('industry', '')
                              }
                            }}
                            error={formik.touched.industry && Boolean(formik.errors.industry)}
                            maxAccess={maxAccess}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <ResourceComboBox
                            endpointId={CurrencyTradingSettingsRepository.Activity.qry}
                            name='activityId'
                            label={_labels.activity}
                            valueField='recordId'
                            displayField={['reference', 'name']}
                            columnsInDropDown={[
                              { key: 'reference', value: 'Reference' },
                              { key: 'name', value: 'Name' }
                            ]}
                            readOnly={editMode}
                            values={formik.values}
                            required
                            onChange={(event, newValue) => {
                              if (newValue) {
                                formik.setFieldValue('activityId', newValue?.recordId)
                              } else {
                                formik.setFieldValue('activityId', '')
                              }
                            }}
                            error={formik.touched.activityId && Boolean(formik.errors.activityId)}
                            maxAccess={maxAccess}
                          />
                        </Grid>
                        <Grid item xs={12} sx={{ position: 'relative', width: '100%' }}>
                          <CustomNumberField
                            name='capital'
                            label={_labels.capital}
                            value={formik.values?.capital}
                            readOnly={editMode}
                            required
                            onChange={formik.handleChange}
                            onClear={() => formik.setFieldValue('capital', '')}
                            maxAccess={maxAccess}
                            error={formik.touched.capital && Boolean(formik.errors.capital)}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <CustomCheckBox
                            name='trading'
                            value={formik.values?.trading}
                            onChange={event => formik.setFieldValue('trading', event.target.checked)}
                            label={_labels?.trading}
                            maxAccess={maxAccess}
                            disabled={editMode}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <CustomCheckBox
                            name='inward'
                            value={formik.values?.inward}
                            onChange={event => formik.setFieldValue('inward', event.target.checked)}
                            label={_labels?.inward}
                            maxAccess={maxAccess}
                            disabled={editMode}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <CustomCheckBox
                            name='outward'
                            value={formik.values?.outward}
                            onChange={event => formik.setFieldValue('outward', event.target.checked)}
                            label={_labels?.outward}
                            maxAccess={maxAccess}
                            disabled={editMode}
                          />
                        </Grid>
                      </Grid>
                    </FieldSet>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <FieldSet title={_labels.address}>
                <AddressTab
                  labels={_labels}
                  access={maxAccess}
                  addressValidation={formik}
                  datasetId={ResourceIds.ADDClientCorporate}
                  setFormik={setFormik}
                  readOnly={editMode}
                />
              </FieldSet>
              <Grid item xs={12}>
                <CustomCheckBox
                  name='OTPVerified'
                  value={formik.values?.OTPVerified}
                  onChange={event => formik.setFieldValue('OTPVerified', event.target.checked)}
                  label={_labels?.OTPVerified}
                  maxAccess={maxAccess}
                  disabled={true}
                  readOnly={editMode}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

ClientCorporateForm.width = 1100

export default ClientCorporateForm
