import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useState, useEffect, useContext } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import AddressTab from 'src/components/Shared/AddressTab'
import FieldSet from 'src/components/Shared/FieldSet'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { TextFieldReference } from 'src/components/Shared/TextFieldReference'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import FormShell from 'src/components/Shared/FormShell'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

const ClientTemplateForm = ({ recordId, _labels, maxAccess, setErrorMessage }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [referenceRequired, setReferenceRequired] = useState(true)
  const [editMode, setEditMode] = useState(!!recordId)
  const { platformLabels } = useContext(ControlContext)

  const [initialValues, setInitialData] = useState({
    //ClientCorporate

    clientId: null,
    lgsId: null,
    industry: null,
    activityId: null,
    capital: null,
    trading: false,
    outward: false,
    inward: false,

    //address

    cityName: null,
    countryId: null,
    cityId: null,
    city: null,
    stateId: null,
    cityDistrictId: null,
    cityDistrict: null,

    email1: null,
    email2: null,
    name1: null,
    phone: null,
    phone2: null,
    phone3: null,
    postalCode: null,
    street1: null,
    street2: null,
    subNo: null,
    unitNo: null,
    bldgNo: '',
    poBox: null,

    //end address

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
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {
      const errors = {}

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (values.email1 && !emailRegex.test(values.email1)) {
        errors.email1 = 'Invalid email format'
      }

      if (values.email2 && !emailRegex.test(values.email2)) {
        errors.email2 = 'Invalid email format'
      }

      return errors
    },
    validationSchema: yup.object({
      reference: referenceRequired && yup.string().required(' '),
      expiryDate: yup.date().required(' '),
      countryId: yup.string().required(' '),
      cityId: yup.string().required(' '),
      name1: yup.string().required(' '),

      // name: yup.string().required(' '),

      nationalityId: yup.string().required(' '),
      cellPhone: yup.string().required(' '),
      capital: yup.string().required(' '),
      lgsId: yup.string().required(' '),
      industry: yup.string().required(' '),
      activityId: yup.string().required(' '),
      street1: yup.string().required(' '),
      phone: yup.string().required(' ')
    }),
    onSubmit: values => {
      postRtDefault(values)
    }
  })

  const postRtDefault = obj => {
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
    postRequest({
      extension: CTCLRepository.ClientCorporate.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        toast.success(platformLabels.Submit)
        setEditMode(true)
        getClient(res.recordId)
      })
      .catch(error => {})
  }

  async function getClient(_recordId) {
    try {
      if (_recordId) {
        setEditMode(true)

        const res = await getRequest({
          extension: CTCLRepository.ClientCorporate.get,
          parameters: `_clientId=${_recordId}`
        })
        if (res) {
          const obj = res?.record
          setInitialData({
            clientId: obj.clientCorporate?.clientId,
            lgsId: obj.clientCorporate?.lgsId,
            industry: obj.clientCorporate?.industry,
            activityId: obj.clientCorporate?.activityId,
            capital: obj.clientCorporate?.capital,
            trading: obj.clientCorporate?.trading,
            outward: obj.clientCorporate?.outward,
            inward: obj.clientCorporate?.inward,

            //address
            countryId: obj.addressView?.countryId,
            cityId: obj.addressView?.cityId,
            city: obj.addressView?.city,
            stateId: obj.addressView?.stateId,
            cityDistrictId: obj.addressView?.cityDistrictId,
            cityDistrict: obj.addressView?.cityDistrict,
            email1: obj.addressView?.email1,
            email2: obj.addressView?.email2,
            name: obj.addressView?.name,
            phone: obj.addressView?.phone,
            phone2: obj.addressView?.phone2,
            phone3: obj.addressView?.phone3,
            postalCode: obj.addressView?.postalCode,
            street1: obj.addressView?.street1,
            street2: obj.addressView?.street2,
            subNo: obj.addressView?.subNo,
            unitNo: obj.addressView?.unitNo,
            bldgNo: obj.addressView?.bldgNo,
            poBox: obj.addressView?.poBox,

            //end address

            //clientMaster
            oldReference: obj.clientMaster.oldReference,
            category: obj.clientMaster?.category,
            reference: obj.clientMaster?.reference,
            name1: obj.clientMaster?.name,
            flName: obj.clientMaster?.flName,
            keyword: obj.clientMaster?.keyword,
            nationalityId: obj.clientMaster?.nationalityId,
            expiryDate: obj.clientMaster?.expiryDate && formatDateFromApi(obj.clientMaster?.expiryDate),
            createdDate: obj.clientMaster?.createdDate && formatDateFromApi(obj.clientMaster?.createdDate),
            status: obj.clientMaster?.status,
            addressId: obj.clientMaster?.addressId,
            plantId: obj.clientMaster?.plantId,
            cellPhone: obj.clientMaster?.cellPhone,
            otp: obj.clientMaster?.otp
          })
        }
      }
    } catch (error) {}
  }

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
              <Grid container spacing={3}>
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
                    readOnly={editMode && true}
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
                      <Grid container xs={12} spacing={3}>
                        <Grid item xs={12}>
                          <CustomTextField
                            name='cellPhone'
                            phone={true}
                            label={_labels.cellPhone}
                            value={formik.values?.cellPhone}
                            readOnly={editMode && true}
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
                            readOnly={editMode && true}
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
                            readOnly={editMode && true}
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
                            readOnly={editMode && true}
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
                            readOnly={editMode && true}
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
                            readOnly={editMode && true}
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
                            readOnly={editMode && true}
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
                            readOnly={editMode && true}
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
                            readOnly={editMode && true}
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
                            disabled={editMode && true}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <CustomCheckBox
                            name='inward'
                            value={formik.values?.inward}
                            onChange={event => formik.setFieldValue('inward', event.target.checked)}
                            label={_labels?.inward}
                            maxAccess={maxAccess}
                            disabled={editMode && true}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <CustomCheckBox
                            name='outward'
                            value={formik.values?.outward}
                            onChange={event => formik.setFieldValue('outward', event.target.checked)}
                            label={_labels?.outward}
                            maxAccess={maxAccess}
                            disabled={editMode && true}
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
                  readOnly={editMode && true}
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
                  readOnly={editMode && true}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ClientTemplateForm
