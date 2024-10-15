import { Grid, FormControlLabel, Checkbox, Button } from '@mui/material'
import { useEffect, useState, useContext } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import AddressTab from 'src/components/Shared/AddressTab'
import FieldSet from 'src/components/Shared/FieldSet'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { TextFieldReference } from 'src/components/Shared/TextFieldReference'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import UseIdType from 'src/hooks/useIdType'
import FormShell from 'src/components/Shared/FormShell'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { RequestsContext } from 'src/providers/RequestsContext'
import OTPPhoneVerification from 'src/components/Shared/OTPPhoneVerification'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { useWindow } from 'src/windows'
import Confirmation from 'src/components/Shared/Confirmation'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import BeneficiaryWindow from '../Windows/BeneficiaryWindow'
import { useInvalidate } from 'src/hooks/resource'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useError } from 'src/error'
import { ControlContext } from 'src/providers/ControlContext'
import CustomDatePickerHijri from 'src/components/Inputs/CustomDatePickerHijri'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import MoreDetails from './MoreDetails'

const ClientTemplateForm = ({ recordId, labels, plantId, maxAccess, allowEdit = false }) => {
  const { stack } = useWindow()
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [showAsPassword, setShowAsPassword] = useState(false)
  const [showAsPasswordPhone, setShowAsPasswordPhone] = useState(false)
  const [showAsPasswordPhoneRepeat, setShowAsPasswordPhoneRepeat] = useState(false)
  const [referenceRequired, setReferenceRequired] = useState(true)
  const [address, setAddress] = useState([])
  const [editMode, setEditMode] = useState(!!recordId)
  const [otpShow, setOtpShow] = useState(false)
  const [newProf, setNewProf] = useState(false)
  const [idTypes, setIdTypes] = useState({})
  const [nationalities, setNationalities] = useState({})

  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)

  const initialValues = {
    //clientIDView
    reference: '',
    clientId: null,
    expiryDate: null,
    issueDate: null,
    idCountry: '',
    idCity: '',
    idNo: '',
    idNoRepeat: '',
    idNoEncrypt: '',
    idNoRepeatEncrypt: '',
    idtId: '',
    idtName: '',
    cityName: '',

    //address
    countryId: '',
    cityId: '',
    city: '',
    stateId: '',
    cityDistrictId: '',
    cityDistrict: '',
    email1: '',
    email2: '',
    name: '',
    phone: '',
    phone2: '',
    phone3: '',
    postalCode: '',
    street1: '',
    street2: '',
    subNo: '',
    unitNo: '',
    bldgNo: '',
    poBox: '',

    //end address
    //clientIndividual
    birthDate: null,
    firstName: '',
    lastName: '',
    middleName: '',
    familyName: '',
    fl_firstName: '',
    fl_lastName: '',
    fl_middleName: '',
    fl_familyName: '',
    isResident: false,
    incomeSourceId: '',

    // end clientIndividual

    //clientMaster
    masterRecordId: '',
    addressId: '',
    category: '',
    nationalityId: '',
    nationality: '',
    cellPhone: '',
    cellPhoneEncrypt: '',
    cellPhoneRepeatEncrypt: '',
    cellPhoneRepeat: '',
    createdDate: null,
    isDiplomatReadOnly: false,
    flName: '',
    keyword: '',
    otp: '',
    status: -1,
    plantId: plantId || '',
    name: '',
    oldReference: '',
    bankId: '',
    iban: '',

    //clientRemittance
    remittanceRecordId: '',
    trxCountPerYear: '',
    trxAmountPerYear: '',
    otpVerified: false,
    govCellVerified: false,
    addressId: '',
    batchId: '',
    civilStatus: '',

    // clientId: "",
    coveredFace: false,
    date: null,
    dtId: '',
    educationLevel: '',
    gender: '',
    idNo: '',
    isDiplomat: false,
    isEmployee: false,
    cobId: null,
    relativeDiplomatInfo: '',
    releaseStatus: '',
    riskLevel: '',
    salary: '',
    salaryRange: '',
    smsLanguage: '',
    sponsorName: '',

    // status: "",
    whatsAppNo: '',
    wip: '',
    workAddressId: '',
    title: '',
    mobileVerified: '',
    isRelativeDiplomat: false,
    professionId: '',
    cltRemReference: '',
    idIssuePlaceCode: ''
  }

  const handleCopy = event => {
    event.preventDefault()
  }

  const [getValue] = UseIdType()

  const invalidate = useInvalidate({
    endpointId: CTCLRepository.CtClientIndividual.snapshot
  })

  async function checkTypes(value) {
    if (!value) {
      clientIndividualFormik.setFieldValue('idtId', '')
      clientIndividualFormik.setFieldValue('idtName', '')
    }
    const idType = await getValue(value)
    if (idType) {
      clientIndividualFormik.setFieldValue('idtId', idType.recordId)
      clientIndividualFormik.setFieldValue('idtName', idType.name)
      const res = idTypes.list.filter(item => item.recordId === idType.recordId)?.[0]
      if (res['type'] && (res['type'] === 1 || res['type'] === 2)) {
        getCountry()
      }
    }
  }

  const dir = JSON.parse(window.localStorage.getItem('settings'))?.direction

  async function getCountry() {
    var parameters = `_filter=&_key=countryId`

    const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: parameters
    })
    const countryId = res.record.value

    clientIndividualFormik.setFieldValue('idCountry', parseInt(countryId))
  }

  useEffect(() => {
    if (recordId) {
      getClient(recordId)
    }
  }, [])

  async function getClient(recordId) {
    const defaultParams = `_clientId=${recordId}`
    var parameters = defaultParams
    await getRequest({
      extension: RTCLRepository.CtClientIndividual.get2,
      parameters: parameters
    })
      .then(res => {
        const obj = res?.record

        obj?.workAddressView && setAddress(obj?.workAddressView)
        clientIndividualFormik.setValues({
          //clientIDView
          functionId: SystemFunction.KYC,
          masterRecordId: obj.clientMaster?.recordId,
          reference: obj.clientMaster?.reference,
          clientId: obj.clientIDView?.clientId,
          expiryDate: formatDateFromApi(obj.clientMaster?.expiryDate),
          issueDate: obj.clientIDView?.idIssueDate && formatDateFromApi(obj.clientIDView?.idIssueDate),
          idCountry: obj.clientIDView?.idCountryId,
          idCity: obj.clientIDView?.idCityId,
          idNo: obj.clientIDView?.idNo,
          idNoRepeat: obj.clientIDView?.idNo,
          idNoEncrypt: obj.clientIDView?.idNo && obj.clientIDView?.idNo,
          idNoRepeatEncrypt: obj.clientIDView?.idNo && obj.clientIDView?.idNo,
          idtId: obj.clientIDView?.idtId,
          isDiplomat: obj.clientIDView?.isDiplomat,
          cityName: obj.clientIDView?.idCityName,
          idIssuePlaceCode: obj.clientIDView?.extraInfo,

          //address
          addressRecordId: obj.addressView?.recordId,
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

          //clientIndividual
          birthDate: obj.clientIndividual?.birthDate && formatDateFromApi(obj.clientIndividual.birthDate),
          firstName: obj.clientIndividual?.firstName,
          lastName: obj.clientIndividual?.lastName,
          middleName: obj.clientIndividual?.middleName,
          familyName: obj.clientIndividual?.familyName,
          fl_firstName: obj.clientIndividual?.fl_firstName,
          fl_lastName: obj.clientIndividual?.fl_lastName,
          fl_middleName: obj.clientIndividual?.fl_middleName,
          fl_familyName: obj.clientIndividual?.fl_familyName,
          isResident: obj.clientIndividual?.isResident,
          incomeSourceId: obj.clientIndividual?.incomeSourceId,
          sponsorName: obj.clientIndividual?.sponsorName,

          // end clientIndividual

          //clientMaster
          addressId: obj.clientMaster.addressId,
          category: obj.clientMaster?.category,
          nationalityId: obj.clientMaster?.nationalityId,
          nationality: obj.clientMaster?.nationality,
          cellPhone: obj.clientMaster?.cellPhone,
          cellPhoneEncrypt: obj.clientMaster?.cellPhone && obj.clientMaster?.cellPhone,
          cellPhoneRepeatEncrypt: obj.clientMaster?.cellPhone && obj.clientMaster?.cellPhone,
          cellPhoneRepeat: obj.clientMaster?.cellPhone,
          createdDate: obj.clientMaster?.createdDate,
          flName: obj.clientMaster?.flName,
          keyword: obj.clientMaster?.keyword,
          otp: obj.clientMaster?.otp,
          plantId: obj.clientRemittance?.plantId,
          name: obj.clientMaster?.name,
          oldReference: obj.clientMaster?.oldReference,
          status: obj.clientMaster?.status,
          professionId: obj.clientMaster?.professionId,
          extraIncome: obj.clientMaster?.extraIncome,
          extraIncomeId: obj.clientMaster?.extraIncomeId,
          bankId: obj.clientMaster?.bankId,
          iban: obj.clientMaster?.iban,

          //clientRemittance
          recordId: recordId,
          remittanceRecordId: obj.clientRemittance?.recordId,
          otpVerified: obj.clientRemittance?.otpVerified,
          govCellVerified: obj.clientRemittance?.govCellVerified,
          addressId: obj.clientRemittance?.addressId,
          batchId: obj.clientRemittance?.batchId,
          civilStatus: obj.clientRemittance?.civilStatus,
          clientId: obj.clientRemittance?.clientId,
          coveredFace: obj.clientRemittance?.coveredFace,
          date: obj.clientRemittance?.date,
          dtId: obj.clientRemittance?.dtId,
          educationLevel: obj.clientRemittance?.educationLevel,
          gender: obj.clientRemittance?.gender,
          isEmployee: obj.clientRemittance?.isEmployee,
          cobId: obj.clientRemittance?.cobId,
          relativeDiplomatInfo: obj.clientRemittance?.relativeDiplomatInfo,
          releaseStatus: obj.clientRemittance?.releaseStatus,
          riskLevel: obj.clientRemittance?.riskLevel,
          salaryRangeId: obj.clientRemittance?.salaryRangeId,
          smsLanguage: obj.clientRemittance?.smsLanguage,
          whatsAppNo: obj.clientRemittance?.whatsAppNo,
          wip: obj.clientRemittance?.wip,
          workAddressId: obj.clientRemittance?.workAddressId,
          title: obj.clientRemittance?.title,
          mobileVerified: obj.clientRemittance?.mobileVerificationStatus,
          isRelativeDiplomat: obj.clientRemittance?.isRelativeDiplomat,
          trxAmountPerYear: obj.clientRemittance?.trxAmountPerYear,
          trxCountPerYear: obj.clientRemittance?.trxCountPerYear,
          cltRemReference: obj.clientRemittance?.reference
        })

        setEditMode(true)
      })
      .catch(error => {})
  }

  const checkIdNumber = id => {
    var parameters = `_idNo=` + id
    if (id)
      getRequest({
        extension: CTCLRepository.IDNumber.get,
        parameters: parameters
      })
        .then(res => {
          if (res.record) {
            stackError({ message: 'the ID number exists.' })
          }
        })
        .catch(error => {})
  }

  const otpForm = () => {
    stack({
      Component: OTPPhoneVerification,
      props: {
        recordId: clientIndividualFormik.values.recordId,
        formValidation: clientIndividualFormik,
        functionId: clientIndividualFormik.values.functionId,
        setEditMode: setEditMode,
        getData: getClient
      },
      width: 400,
      height: 400,
      title: labels.OTPVerification
    })
  }

  const clientIndividualFormik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    validate: values => {
      const errors = {}

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (values.isRelativeDiplomat && !values.relativeDiplomatInfo) {
        errors.relativeDiplomatInfo = 'Relative Diplomat Info is required'
      }

      if (values.email1 && !emailRegex.test(values.email1)) {
        errors.email1 = 'Invalid email format'
      }

      if (values.email2 && !emailRegex.test(values.email2)) {
        errors.email2 = 'Invalid email format'
      }

      return errors
    },
    validationSchema: yup.object({
      reference: referenceRequired && yup.string().required(),
      isResident: yup.string().required(),
      birthDate: yup.date().required(),
      idtId: yup.string().required(),
      idNo: yup.string().required(),
      expiryDate: yup.date().required(),
      countryId: yup.string().required(),
      cityId: yup.string().required(),
      idCountry: yup.string().required(),
      name: yup.string().required(),
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      nationalityId: yup.string().required(),
      professionId: yup.string().required(),
      cellPhone: yup.string().required(),
      cellPhoneRepeat: yup
        .string()
        .required('Repeat Password is required')
        .oneOf([yup.ref('cellPhone'), null], 'Cell phone must match'),
      smsLanguage: yup.string().required(),
      incomeSourceId: yup.string().required(),
      gender: yup.string().required(),
      street1: yup.string().required()
    }),
    onSubmit: async values => {
      await postRtDefault(values)
    }
  })

  const isClosed = !(
    editMode &&
    clientIndividualFormik.values.status === -1 &&
    !clientIndividualFormik.values.otpVerified
  )

  const wip = clientIndividualFormik.values.wip === 2

  const postRtDefault = async obj => {
    const date = new Date()

    //CTCL

    const obj1 = {
      recordId: obj.masterRecordId,
      reference: obj.reference,
      category: 1,
      name: obj.firstName,
      flName: obj.fl_firstName,
      keyword: obj.keyword,
      nationalityId: obj.nationalityId,
      status: obj.status,
      addressId: null,
      cellPhone: obj.cellPhone,
      oldReference: obj.oldReference,
      otp: obj?.otp,
      plantId: clientIndividualFormik.values.plantId,
      createdDate: formatDateToApi(date.toISOString()),
      expiryDate: formatDateToApi(obj.expiryDate),
      professionId: obj.professionId,
      categoryName: obj.categoryName,
      extraIncomeId: obj.extraIncomeId,
      bankId: obj.bankId,
      iban: obj.iban
    }

    //CCTD
    const obj2 = {
      idNo: obj.idNo,
      clientId: obj.clientId || 0,
      idCountryId: obj.idCountry,
      idtId: obj.idtId,
      idExpiryDate: formatDateToApi(obj.expiryDate),
      idIssueDate: obj.issueDate && formatDateToApi(obj.issueDate),
      idCityId: obj.idCity,
      isDiplomat: obj.isDiplomat,
      extraInfo: obj.idIssuePlaceCode
    }

    //CTCLI
    const obj3 = {
      clientId: obj.clientId || 0,
      firstName: obj.firstName,
      lastName: obj.lastName,
      middleName: obj.middleName,
      familyName: obj.familyName,
      fl_firstName: obj.fl_firstName,
      fl_lastName: obj.fl_lastName,
      fl_middleName: obj.fl_middleName,
      fl_familyName: obj.fl_familyName,
      birthDate: formatDateToApi(obj.birthDate),
      isResident: obj.isResident,
      sponsorName: obj.sponsorName,
      incomeSourceId: obj.incomeSourceId
    }

    const obj4 = {
      recordId: obj.remittanceRecordId,
      clientId: obj.clientId || 0,
      plantId: clientIndividualFormik.values.plantId,
      reference: '', // obj.reference,
      salaryRangeId: obj.salaryRangeId,
      riskLevel: obj.riskLevel,
      smsLanguage: obj.smsLanguage,
      whatsAppNo: obj.whatsAppNo,
      gender: obj.gender,
      title: obj.title,
      civilStatus: obj.civilStatus,
      mobileVerificationStatus: 0,
      educationLevel: obj.educationLevel,
      isDiplomat: obj.isDiplomat,
      isRelativeDiplomat: obj.isRelativeDiplomat,
      relativeDiplomatInfo: obj.relativeDiplomatInfo,
      idNo: obj.idNo,
      otpVerified: obj.otpVerified,
      coveredFace: obj.coveredFace,
      isEmployee: obj.isEmployee,
      wip: 1,
      addressId: obj.addressId,
      workAddressId: address?.recordId,
      cobId: obj.cobId,
      trxCountPerYear: obj.trxCountPerYear,
      trxAmountPerYear: obj.trxAmountPerYear,
      govCellVerified: obj.govCellVerified
    }

    const obj5 = {
      recordId: obj.addressRecordId,
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

    const obj6 = {
      recordId: address.recordId,
      name: address.name,
      countryId: address.countryId,
      stateId: address.stateId,
      cityId: address.cityId,
      cityName: address.cityName,
      street1: address.street1,
      street2: address.street2,
      email1: address.email1,
      email2: address.email2,
      phone: address.phone,
      phone2: address.phone2,
      phone3: address.phone3,
      addressId: address.addressId,
      postalCode: address.postalCode,
      cityDistrictId: address.cityDistrictId,
      bldgNo: address.bldgNo,
      poBox: address.poBox,
      unitNo: address.unitNo,
      subNo: address.subNo
    }

    if (allowEdit) {
      obj1.status = -1

      const updateData = {
        plantId: clientIndividualFormik.values.plantId,
        clientID: obj2, //CTID
        ClientIndividual: obj3, //CTCLI
        clientRemittance: obj4,
        clientMaster: obj1, //CTCL
        address: obj5,
        workAddress: obj6.name && obj6.countryId && obj6.cityId && obj6.phone && obj6.street1 ? obj6 : null
      }

      await postRequest({
        extension: RTCLRepository.CtClientIndividual.update,
        record: JSON.stringify(updateData)
      })
        .then(res => {
          if (res) {
            toast.success(platformLabels.Edited)
            otpForm()
            getClient(obj.recordId)
          }
        })
        .catch(error => {})
    } else {
      const data = {
        plantId: clientIndividualFormik.values.plantId,
        clientMaster: obj1, //CTCL
        clientID: obj2, //CTID
        ClientIndividual: obj3, //CTCLI
        clientRemittance: obj4,
        address: obj5,
        workAddress: obj6.name && obj6.countryId && obj6.cityId && obj6.phone && obj6.street1 ? obj6 : null
      }

      postRequest({
        extension: RTCLRepository.CtClientIndividual.set2,
        record: JSON.stringify(data)
      })
        .then(res => {
          if (res) {
            toast.success(platformLabels.Submit)
            setOtpShow(true)
            getClient(res.recordId)
            setEditMode(true)
          }
        })
        .catch(error => {})
    }
  }

  useEffect(() => {
    if (clientIndividualFormik.values.clientId && otpShow) otpForm()
  }, [clientIndividualFormik.values.clientId, otpShow])

  const fillFilterProfession = value => {
    if (value) {
      clientIndividualFormik.setFieldValue('isDiplomat', true)
      clientIndividualFormik.setFieldValue('isDiplomatReadOnly', true)
    } else {
      clientIndividualFormik.setFieldValue('isDiplomat', false)
      clientIndividualFormik.setFieldValue('isDiplomatReadOnly', false)
    }
  }

  const onClose = async () => {
    const values = clientIndividualFormik.values
    try {
      const data = {
        recordId: values?.remittanceRecordId
      }

      const res = await postRequest({
        extension: RTCLRepository.CtClientIndividual.close,
        record: JSON.stringify(data)
      })
      if (res.recordId) {
        toast.success(platformLabels.Closed)
        invalidate()
        getClient(res.recordId)
      }
    } catch {}
  }

  const actions = [
    !allowEdit && {
      key: 'Client Relation',
      condition: true,
      onClick: 'onClientRelation',
      disabled: !editMode
    },
    !allowEdit && {
      key: 'Add Client Relation',
      condition: true,
      onClick: 'onAddClientRelation',
      disabled: !editMode
    },
    !allowEdit && {
      key: 'BeneficiaryList',
      condition: true,
      onClick: () => openBeneficiaryWindow(),
      disabled: !editMode
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !(isClosed || wip)
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,

      // onClick: onReopen,
      disabled: true
    },
    !allowEdit && {
      key: 'Client Balance',
      condition: true,
      onClick: 'onClientBalance',
      disabled: !editMode
    }
  ]

  function openBeneficiaryWindow() {
    stack({
      Component: BeneficiaryWindow,
      props: { clientId: recordId },
      width: 1300,
      height: 500,
      title: labels.beneficiaries
    })
  }

  const refreshProf = () => {
    setNewProf(!newProf)
  }

  useEffect(() => {
    if (clientIndividualFormik.values.nationalityId) {
      const languageId = nationalities?.list?.filter(
        item => item.recordId === clientIndividualFormik.values.nationalityId
      )?.[0]?.languageId

      languageId && clientIndividualFormik.setFieldValue('smsLanguage', languageId)
    }
  }, [clientIndividualFormik?.values?.nationalityId])

  return (
    <FormShell
      actions={actions}
      resourceId={ResourceIds.UpdateClientRemittance}
      form={clientIndividualFormik}
      maxAccess={maxAccess}
      editMode={editMode}
      isClosed={allowEdit ? false : isClosed}
      onClose={onClose}
      disabledSubmit={editMode && !allowEdit && true}
    >
      <VertLayout>
        <Grow>
          <Grid container xs={12} spacing={2} sx={{ padding: '20px' }}>
            <Grid item xs={6} sx={{ padding: '30px' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextFieldReference
                    endpointId={CurrencyTradingSettingsRepository.Defaults.get}
                    param={'ct-nra-individual'}
                    name='reference'
                    label={labels.reference}
                    editMode={editMode}
                    value={clientIndividualFormik.values?.reference}
                    setReferenceRequired={setReferenceRequired}
                    onChange={clientIndividualFormik.handleChange}
                    onClear={() => clientIndividualFormik.setFieldValue('reference', '')}
                    error={clientIndividualFormik.touched.reference && Boolean(clientIndividualFormik.errors.reference)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='isResident'
                        checked={clientIndividualFormik.values?.isResident}
                        onChange={clientIndividualFormik.handleChange}
                        disabled={editMode && !allowEdit}
                      />
                    }
                    label={labels.isResident}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='cltRemReference'
                    label={labels.lastKYC}
                    value={clientIndividualFormik?.values?.cltRemReference}
                    maxAccess={maxAccess}
                    maxLength='30'
                    readOnly
                    error={
                      clientIndividualFormik.touched.cltRemReference &&
                      Boolean(clientIndividualFormik.errors.cltRemReference)
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomDatePicker
                    name='birthDate'
                    label={labels.birthDate}
                    value={clientIndividualFormik.values?.birthDate}
                    required={true}
                    onChange={clientIndividualFormik.setFieldValue}
                    onClear={() => clientIndividualFormik.setFieldValue('birthDate', '')}
                    focus={!editMode}
                    disabledDate={'>='}
                    readOnly={editMode && !allowEdit && true}
                    error={clientIndividualFormik.touched.birthDate && Boolean(clientIndividualFormik.errors.birthDate)}
                    maxAccess={maxAccess}
                  />
                </Grid>

                <Grid item xs={6}>
                  <CustomDatePickerHijri
                    name='birthDateHijri'
                    label={labels.birthDateHijri}
                    value={clientIndividualFormik.values?.birthDate}
                    onChange={(name, value) => {
                      clientIndividualFormik.setFieldValue('birthDate', value)
                    }}
                    onClear={() => clientIndividualFormik.setFieldValue('birthDate', '')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FieldSet title={labels.id}>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='idNo'
                        label={labels.id_number}
                        type={showAsPassword && 'password'}
                        value={clientIndividualFormik.values?.idNo}
                        required
                        onChange={e => {
                          clientIndividualFormik.handleChange(e)
                        }}
                        onCopy={handleCopy}
                        onPaste={handleCopy}
                        onBlur={e => {
                          checkTypes(e.target.value), setShowAsPassword(true)
                          !editMode && checkIdNumber(e.target.value)
                        }}
                        readOnly={editMode}
                        maxLength='15'
                        onFocus={e => {
                          setShowAsPassword(false)
                        }}
                        onClear={() => {
                          clientIndividualFormik.setFieldValue('idNo', '')
                        }}
                        error={clientIndividualFormik.touched.idNo && Boolean(clientIndividualFormik.errors.idNo)}
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={CurrencyTradingSettingsRepository.IdTypes.qry}
                        name='idtId'
                        label={labels.id_type}
                        valueField='recordId'
                        displayField='name'
                        readOnly={editMode && !allowEdit && true}
                        values={clientIndividualFormik.values}
                        setData={setIdTypes}
                        required
                        onChange={(event, newValue) => {
                          if (newValue) {
                            fillFilterProfession(newValue.isDiplomat)

                            if (newValue['type'] && (newValue['type'] === 1 || newValue['type'] === 2)) {
                              getCountry()
                            }
                          } else {
                            fillFilterProfession('')
                          }

                          clientIndividualFormik.setFieldValue('idtId', newValue?.recordId || '')
                          clientIndividualFormik.setFieldValue('idtName', newValue?.name || '')
                        }}
                        error={clientIndividualFormik.touched.idtId && Boolean(clientIndividualFormik.errors.idtId)}
                        maxAccess={maxAccess}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant='contained'
                        onClick={() =>
                          stack({
                            Component: Confirmation,
                            props: {
                              formik: clientIndividualFormik,
                              labels: labels,
                              refreshProf
                            },
                            title: labels.fetch,
                            width: 400,
                            height: 350
                          })
                        }
                        disabled={
                          !clientIndividualFormik?.values?.idtId ||
                          !clientIndividualFormik?.values?.birthDate ||
                          !clientIndividualFormik.values.idNo ||
                          (editMode && new Date(clientIndividualFormik.values?.expiryDate) >= new Date())
                            ? true
                            : false
                        }
                      >
                        {labels.fetch}
                      </Button>
                    </Grid>

                    <Grid item xs={12}>
                      <CustomDatePicker
                        name='expiryDate'
                        label={labels.expiryDate}
                        value={clientIndividualFormik.values?.expiryDate}
                        readOnly={editMode && !allowEdit && true}
                        required={true}
                        onChange={clientIndividualFormik.setFieldValue}
                        onClear={() => clientIndividualFormik.setFieldValue('expiryDate', '')}
                        disabledDate={!editMode && '<'}
                        error={
                          clientIndividualFormik.touched.expiryDate && Boolean(clientIndividualFormik.errors.expiryDate)
                        }
                        maxAccess={maxAccess}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <CustomDatePicker
                        name='issueDate'
                        label={labels.issueDate}
                        value={clientIndividualFormik.values?.issueDate}
                        readOnly={editMode && !allowEdit && true}
                        onChange={clientIndividualFormik.setFieldValue}
                        onClear={() => clientIndividualFormik.setFieldValue('issueDate', '')}
                        disabledDate={!editMode && '>'}
                        error={
                          clientIndividualFormik.touched.issueDate && Boolean(clientIndividualFormik.errors.issueDate)
                        }
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CustomDatePickerHijri
                        name='issueDateHijri'
                        label={labels.issueDateHijri}
                        value={clientIndividualFormik.values?.issueDate}
                        onChange={(name, value) => {
                          clientIndividualFormik.setFieldValue('issueDate', value)
                        }}
                        disabledDate={!editMode && '>'}
                        onClear={() => clientIndividualFormik.setFieldValue('issueDate', '')}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={SystemRepository.Country.qry}
                        name='idCountry'
                        label={labels.issusCountry}
                        valueField='recordId'
                        displayField={['reference', 'name', 'flName']}
                        readOnly={editMode && !allowEdit && true}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' },
                          { key: 'flName', value: 'Foreign Language Name' }
                        ]}
                        values={clientIndividualFormik.values}
                        required
                        onChange={(event, newValue) => {
                          if (newValue) {
                            clientIndividualFormik.setFieldValue('idCountry', newValue?.recordId)

                            clientIndividualFormik.setFieldValue('idCity', '')
                            clientIndividualFormik.setFieldValue('cityName', '')
                          } else {
                            clientIndividualFormik.setFieldValue('idCountry', '')

                            clientIndividualFormik.setFieldValue('idCity', '')
                            clientIndividualFormik.setFieldValue('cityName', '')
                          }
                        }}
                        error={
                          clientIndividualFormik.touched.idCountry && Boolean(clientIndividualFormik.errors.idCountry)
                        }
                        maxAccess={maxAccess}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <ResourceLookup
                        endpointId={SystemRepository.City.snapshot}
                        parameters={{
                          _countryId: clientIndividualFormik.values.idCountry,
                          _stateId: 0
                        }}
                        name='idCity'
                        label={labels.issueCity}
                        form={clientIndividualFormik}
                        valueField='name'
                        displayField='name'
                        firstValue={clientIndividualFormik.values.cityName}
                        secondDisplayField={false}
                        readOnly={((editMode && !allowEdit) || !clientIndividualFormik.values.idCountry) && true}
                        maxAccess={maxAccess}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            clientIndividualFormik.setFieldValue('idCity', newValue?.recordId)
                            clientIndividualFormik.setFieldValue('cityName', newValue?.name)
                          } else {
                            clientIndividualFormik.setFieldValue('idCity', null)
                            clientIndividualFormik.setFieldValue('cityName', null)
                          }
                        }}
                        error={clientIndividualFormik.touched.idCity && Boolean(clientIndividualFormik.errors.idCity)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='idIssuePlaceCode'
                        label={labels.issusPlace}
                        value={clientIndividualFormik.values?.idIssuePlaceCode}
                        onChange={clientIndividualFormik.handleChange}
                        readOnly={editMode && !allowEdit && true}
                        onClear={() => clientIndividualFormik.setFieldValue('idIssuePlaceCode', '')}
                        error={
                          clientIndividualFormik.touched.idIssuePlaceCode &&
                          Boolean(clientIndividualFormik.errors.idIssuePlaceCode)
                        }
                        maxAccess={maxAccess}
                      />
                    </Grid>
                  </FieldSet>
                  <Grid item xs={12} sx={{ marginTop: '20px' }}>
                    <FieldSet title={labels.address}>
                      <AddressTab
                        labels={labels}
                        defaultReadOnly={{ countryId: true }}
                        addressValidation={clientIndividualFormik}
                        readOnly={editMode && !allowEdit && true}
                        access={maxAccess}
                      />
                    </FieldSet>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <Grid container xs={12} spacing={2}>
                <Grid container xs={12}>
                  <FieldSet title={labels.customerInformation}>
                    <Grid item xs={6} sx={{ position: 'relative', width: '100%' }}>
                      <CustomTextField
                        name='cellPhone'
                        type={showAsPasswordPhone && clientIndividualFormik.values?.cellPhone ? 'password' : 'text'}
                        label={labels.cellPhone}
                        value={clientIndividualFormik.values?.cellPhone}
                        readOnly={editMode && !allowEdit && true}
                        required
                        phone={true}
                        onChange={e => {
                          clientIndividualFormik.handleChange(e)
                          clientIndividualFormik.values?.cellPhoneRepeat === e.target.value &&
                            clientIndividualFormik.setFieldValue('whatsAppNo', e.target.value)
                        }}
                        maxLength='15'
                        autoComplete='off'
                        onCopy={handleCopy}
                        onPaste={handleCopy}
                        onBlur={e => {
                          setShowAsPasswordPhone(true), clientIndividualFormik.handleBlur(e)
                        }}
                        onFocus={e => {
                          setShowAsPasswordPhone(false)
                        }}
                        onClear={() => clientIndividualFormik.setFieldValue('cellPhone', '')}
                        error={
                          clientIndividualFormik.touched.cellPhone && Boolean(clientIndividualFormik.errors.cellPhone)
                        }
                        helperText={clientIndividualFormik.touched.cellPhone && clientIndividualFormik.errors.cellPhone}
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={6} sx={{ position: 'relative', width: '100%' }}>
                      <CustomTextField
                        name='cellPhoneRepeat'
                        type={
                          showAsPasswordPhoneRepeat && clientIndividualFormik.values?.cellPhoneRepeat
                            ? 'password'
                            : 'text'
                        }
                        label={labels.confirmCell}
                        value={clientIndividualFormik.values?.cellPhoneRepeat}
                        required
                        readOnly={editMode && !allowEdit && true}
                        maxLength='15'
                        autoComplete='off'
                        phone={true}
                        onChange={e => {
                          clientIndividualFormik.handleChange(e)
                          clientIndividualFormik.values?.cellPhone === e.target.value &&
                            clientIndividualFormik.setFieldValue('whatsAppNo', e.target.value)
                        }}
                        onBlur={e => {
                          setShowAsPasswordPhoneRepeat(true), clientIndividualFormik.handleBlur(e)
                        }}
                        onFocus={e => {
                          setShowAsPasswordPhoneRepeat(false)
                        }}
                        onCopy={handleCopy}
                        onPaste={handleCopy}
                        onClear={() => clientIndividualFormik.setFieldValue('cellPhoneRepeat', '')}
                        error={
                          clientIndividualFormik.touched.cellPhoneRepeat &&
                          Boolean(clientIndividualFormik.errors.cellPhoneRepeat)
                        }
                        helperText={
                          clientIndividualFormik.touched.cellPhoneRepeat &&
                          clientIndividualFormik.errors.cellPhoneRepeat
                        }
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid container spacing={2} sx={{ paddingTop: '20px', direction: dir }}>
                      <Grid item xs={3}>
                        <CustomTextField
                          name='firstName'
                          label={labels.first}
                          value={clientIndividualFormik.values?.firstName}
                          required
                          onChange={e => {
                            clientIndividualFormik.handleChange(e)
                            clientIndividualFormik.setFieldValue(
                              'name',
                              e.target.value + ' ' + clientIndividualFormik.values?.lastName
                            )
                          }}
                          language='english'
                          maxLength='10'
                          readOnly={editMode && !allowEdit && true}
                          onClear={() => clientIndividualFormik.setFieldValue('firstName', '')}
                          error={
                            clientIndividualFormik.touched.firstName && Boolean(clientIndividualFormik.errors.firstName)
                          }
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <CustomTextField
                          name='middleName'
                          label={labels.middle}
                          value={clientIndividualFormik.values?.middleName}
                          onChange={clientIndividualFormik.handleChange}
                          language='english'
                          maxLength='10'
                          readOnly={editMode && !allowEdit && true}
                          onClear={() => clientIndividualFormik.setFieldValue('middleName', '')}
                          error={
                            clientIndividualFormik.touched.middleName &&
                            Boolean(clientIndividualFormik.errors.middleName)
                          }
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <CustomTextField
                          name='lastName'
                          label={labels.last}
                          value={clientIndividualFormik.values?.lastName}
                          required
                          onChange={e => {
                            clientIndividualFormik.handleChange(e),
                              clientIndividualFormik.setFieldValue(
                                'name',
                                clientIndividualFormik.values?.firstName + ' ' + e.target.value
                              )
                          }}
                          language='english'
                          maxLength='10'
                          readOnly={editMode && !allowEdit && true}
                          onClear={() => clientIndividualFormik.setFieldValue('lastName', '')}
                          error={
                            clientIndividualFormik.touched.lastName && Boolean(clientIndividualFormik.errors.lastName)
                          }
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <CustomTextField
                          name='familyName'
                          label={labels.family}
                          value={clientIndividualFormik.values?.familyName}
                          onChange={clientIndividualFormik.handleChange}
                          language='english'
                          maxLength='10'
                          readOnly={editMode && !allowEdit && true}
                          onClear={() => clientIndividualFormik.setFieldValue('familyName', '')}
                          error={
                            clientIndividualFormik.touched.familyName &&
                            Boolean(clientIndividualFormik.errors.familyName)
                          }
                          maxAccess={maxAccess}
                        />
                      </Grid>
                    </Grid>

                    <Grid
                      container
                      spacing={2}
                      sx={{ flexDirection: 'row-reverse', paddingTop: '5px', direction: dir }}
                    >
                      <Grid item xs={3}>
                        <CustomTextField
                          name='fl_firstName'
                          label={labels.fl_first}
                          value={clientIndividualFormik.values?.fl_firstName}
                          onChange={clientIndividualFormik.handleChange}
                          maxLength='10'
                          readOnly={editMode && !allowEdit && true}
                          dir='rtl'
                          language='arabic'
                          onClear={() => clientIndividualFormik.setFieldValue('fl_firstName', '')}
                          error={
                            clientIndividualFormik.touched.fl_firstName &&
                            Boolean(clientIndividualFormik.errors.fl_firstName)
                          }
                          helperText={
                            clientIndividualFormik.touched.fl_firstName && clientIndividualFormik.errors.fl_firstName
                          }
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <CustomTextField
                          name='fl_middleName'
                          label={labels.fl_middle}
                          value={clientIndividualFormik.values?.fl_middleName}
                          onChange={clientIndividualFormik.handleChange}
                          readOnly={editMode && !allowEdit && true}
                          dir='rtl'
                          language='arabic'
                          onClear={() => clientIndividualFormik.setFieldValue('fl_familyName', '')}
                          error={
                            clientIndividualFormik.touched.fl_middleName &&
                            Boolean(clientIndividualFormik.errors.fl_middleName)
                          }
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <CustomTextField
                          name='fl_lastName'
                          label={labels.fl_last}
                          value={clientIndividualFormik.values?.fl_lastName}
                          onChange={clientIndividualFormik.handleChange}
                          maxLength='10'
                          dir='rtl'
                          language='arabic'
                          readOnly={editMode && !allowEdit && true}
                          onClear={() => clientIndividualFormik.setFieldValue('fl_lastName', '')}
                          error={
                            clientIndividualFormik.touched.fl_lastName &&
                            Boolean(clientIndividualFormik.errors.fl_lastName)
                          }
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <CustomTextField
                          name='fl_familyName'
                          label={labels.fl_family}
                          value={clientIndividualFormik.values?.fl_familyName}
                          onChange={clientIndividualFormik.handleChange}
                          readOnly={editMode && !allowEdit && true}
                          dir='rtl'
                          language='arabic'
                          onClear={() => clientIndividualFormik.setFieldValue('fl_familyName', '')}
                          error={
                            clientIndividualFormik.touched.fl_familyName &&
                            Boolean(clientIndividualFormik.errors.fl_familyName)
                          }
                          maxAccess={maxAccess}
                        />
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={SystemRepository.Country.qry}
                        name='cobId'
                        label={labels.cob}
                        valueField='recordId'
                        displayField={['reference', 'name', 'flName']}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' },
                          { key: 'flName', value: 'Foreign Language Name' }
                        ]}
                        readOnly={editMode && !allowEdit && true}
                        values={clientIndividualFormik.values}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            clientIndividualFormik.setFieldValue('cobId', newValue?.recordId)
                          } else {
                            clientIndividualFormik.setFieldValue('cobId', '')
                          }
                        }}
                        error={clientIndividualFormik.touched.cobId && Boolean(clientIndividualFormik.errors.cobId)}
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={SystemRepository.Country.qry}
                        name='nationalityId'
                        label={labels.nationality}
                        setData={setNationalities}
                        valueField='recordId'
                        displayField={['reference', 'name', 'flName']}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' },
                          { key: 'flName', value: 'Foreign Language Name' }
                        ]}
                        readOnly={editMode && !allowEdit && true}
                        values={clientIndividualFormik.values}
                        required
                        onChange={(event, newValue) => {
                          if (newValue) {
                            clientIndividualFormik.setFieldValue('nationalityId', newValue?.recordId)
                            clientIndividualFormik.setFieldValue('smsLanguage', newValue?.languageId)
                          } else {
                            clientIndividualFormik.setFieldValue('nationalityId', '')
                            clientIndividualFormik.setFieldValue('smsLanguage', '')
                          }
                        }}
                        error={
                          clientIndividualFormik.touched.nationalityId &&
                          Boolean(clientIndividualFormik.errors.nationalityId)
                        }
                        maxAccess={maxAccess}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <ResourceComboBox
                        datasetId={DataSets.GENDER}
                        name='gender'
                        label={labels.gender}
                        valueField='key'
                        displayField='value'
                        required
                        readOnly={editMode && !allowEdit && true}
                        values={clientIndividualFormik.values}
                        onChange={(event, newValue) => {
                          clientIndividualFormik.setFieldValue('coveredFace', false)
                          if (newValue) {
                            clientIndividualFormik.setFieldValue('gender', newValue?.key)
                          } else {
                            clientIndividualFormik.setFieldValue('gender', '')
                          }
                        }}
                        error={clientIndividualFormik.touched.gender && Boolean(clientIndividualFormik.errors.gender)}
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        datasetId={DataSets.EDUCATION_LEVEL}
                        name='educationLevel'
                        label={labels.educationLevel}
                        valueField='key'
                        displayField='value'
                        readOnly={editMode && !allowEdit && true}
                        values={clientIndividualFormik.values}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            clientIndividualFormik.setFieldValue('educationLevel', newValue?.key)
                          } else {
                            clientIndividualFormik.setFieldValue('educationLevel', null)
                          }
                        }}
                        error={
                          clientIndividualFormik.touched.educationLevel &&
                          Boolean(clientIndividualFormik.errors.educationLevel)
                        }
                        maxAccess={maxAccess}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={RemittanceSettingsRepository.SourceOfIncome.qry}
                        name='incomeSourceId'
                        label={labels.incomeSource}
                        valueField='recordId'
                        readOnly={editMode && !allowEdit && true}
                        displayField={['reference', 'name', 'flName']}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' },
                          { key: 'flName', value: 'Foreign Language Name' }
                        ]}
                        values={clientIndividualFormik.values}
                        required
                        onChange={(event, newValue) => {
                          if (newValue) {
                            clientIndividualFormik.setFieldValue('incomeSourceId', newValue?.recordId)
                          } else {
                            clientIndividualFormik.setFieldValue('incomeSourceId', '')
                          }
                        }}
                        error={
                          clientIndividualFormik.touched.incomeSourceId &&
                          Boolean(clientIndividualFormik.errors.incomeSourceId)
                        }
                        maxAccess={maxAccess}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <CustomTextField
                        name='sponsorName'
                        label={labels.sponsorName}
                        value={clientIndividualFormik.values?.sponsorName}
                        readOnly={editMode && !allowEdit && true}
                        onChange={clientIndividualFormik.handleChange}
                        maxLength='200'
                        onClear={() => clientIndividualFormik.setFieldValue('sponsorName', '')}
                        error={
                          clientIndividualFormik.touched.sponsorName &&
                          Boolean(clientIndividualFormik.errors.sponsorName)
                        }
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={12} key={newProf}>
                      <ResourceComboBox
                        endpointId={RemittanceSettingsRepository.Profession.qry}
                        filter={
                          idTypes?.list?.filter(item => item.recordId == clientIndividualFormik.values.idtId)?.[0]
                            ?.isDiplomat
                            ? item => item.diplomatStatus === 2
                            : undefined
                        }
                        name='professionId'
                        label={labels.profession}
                        valueField='recordId'
                        displayField={['reference', 'name', 'flName']}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' },
                          { key: 'flName', value: 'Foreign Language Name' }
                        ]}
                        values={clientIndividualFormik.values}
                        required
                        onChange={(event, newValue) => {
                          if (newValue) {
                            clientIndividualFormik.setFieldValue('professionId', newValue?.recordId)
                          } else {
                            clientIndividualFormik.setFieldValue('professionId', '')
                          }
                        }}
                        error={
                          clientIndividualFormik.touched.professionId &&
                          Boolean(clientIndividualFormik.errors.professionId)
                        }
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={RemittanceSettingsRepository.SalaryRange.qry}
                        name='salaryRangeId'
                        label={labels.salaryRange}
                        valueField='recordId'
                        displayField={['min', '->', 'max']}
                        columnsInDropDown={[
                          { key: 'min', value: 'min' },
                          { key: 'max', value: 'max' }
                        ]}
                        readOnly={editMode && !allowEdit && true}
                        values={clientIndividualFormik.values}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            clientIndividualFormik.setFieldValue('salaryRangeId', newValue?.recordId)
                          } else {
                            clientIndividualFormik.setFieldValue('salaryRangeId', '')
                          }
                        }}
                        error={
                          clientIndividualFormik.touched.salaryRangeId &&
                          Boolean(clientIndividualFormik.errors.salaryRangeId)
                        }
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        datasetId={DataSets.LANGUAGE}
                        name='smsLanguage'
                        label={labels.smsLanguage}
                        valueField='key'
                        displayField='value'
                        values={clientIndividualFormik.values}
                        required
                        readOnly={editMode && !allowEdit && true}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            clientIndividualFormik.setFieldValue('smsLanguage', newValue?.key)
                          } else {
                            clientIndividualFormik.setFieldValue('smsLanguage', '')
                          }
                        }}
                        error={
                          clientIndividualFormik.touched.smsLanguage &&
                          Boolean(clientIndividualFormik.errors.smsLanguage)
                        }
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='whatsAppNo'
                        label={labels.whatsapp}
                        value={clientIndividualFormik.values?.whatsAppNo}
                        readOnly={editMode && !allowEdit && true}
                        onChange={clientIndividualFormik.handleChange}
                        maxLength='15'
                        phone={true}
                        onClear={() => clientIndividualFormik.setFieldValue('whatsAppNo', '')}
                        error={
                          clientIndividualFormik.touched.whatsAppNo && Boolean(clientIndividualFormik.errors.whatsAppNo)
                        }
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        name='status'
                        label={labels.status}
                        datasetId={DataSets.ACTIVE_STATUS}
                        values={clientIndividualFormik.values}
                        valueField='key'
                        displayField='value'
                        onChange={(event, newValue) => {
                          if (newValue) {
                            clientIndividualFormik.setFieldValue('status', newValue?.key)
                          } else {
                            clientIndividualFormik.setFieldValue('status', newValue?.key)
                          }
                        }}
                        readOnly={true}
                        error={clientIndividualFormik.touched.status && Boolean(clientIndividualFormik.errors.status)}
                        maxAccess={maxAccess}
                      />
                    </Grid>
                  </FieldSet>
                  <Grid item xs={12}>
                    <Button
                      variant='contained'
                      onClick={() =>
                        stack({
                          Component: AddressFormShell,
                          props: {
                            readOnly: editMode && !allowEdit,
                            optional: true,
                            labels: labels,
                            setAddress: setAddress,
                            address: address,
                            maxAccess: maxAccess,
                            isCleared: false
                          },
                          width: 500,
                          height: 400,
                          title: labels.workAddress
                        })
                      }
                    >
                      {labels.workAddress}
                    </Button>
                    <Button
                      sx={{ ml: 2 }}
                      variant='contained'
                      onClick={() =>
                        stack({
                          Component: MoreDetails,
                          props: {
                            readOnly: editMode && !allowEdit,
                            labels: labels,
                            clientFormik: clientIndividualFormik,
                            maxAccess: maxAccess,
                            editMode: editMode,
                            allowEdit
                          },
                          width: 500,
                          height: 400,
                          title: labels.moreDetails
                        })
                      }
                    >
                      {labels.moreDetails}
                    </Button>
                  </Grid>

                  <Grid container xs={12} sx={{ pt: 5 }}>
                    <FieldSet title={labels.diplomat}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name='isDiplomat'
                              checked={clientIndividualFormik.values?.isDiplomat}
                              disabled={
                                (clientIndividualFormik.values?.isDiplomatReadOnly || (editMode && !allowEdit)) && true
                              }
                              onChange={clientIndividualFormik.handleChange}
                            />
                          }
                          label={labels?.isDiplomat}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name='isRelativeDiplomat'
                              checked={clientIndividualFormik.values?.isRelativeDiplomat}
                              disabled={editMode && !allowEdit}
                              onChange={e => {
                                clientIndividualFormik.handleChange(e),
                                  clientIndividualFormik.setFieldValue('relativeDiplomatInfo', '')
                              }}
                            />
                          }
                          label={labels?.isDiplomatRelative}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomTextField
                          name='relativeDiplomatInfo'
                          label={labels.relativeDiplomatInfo}
                          onBlur={clientIndividualFormik.handleBlur}
                          value={clientIndividualFormik.values?.relativeDiplomatInfo}
                          readOnly={editMode || (!clientIndividualFormik.values?.isRelativeDiplomat && true)}
                          onChange={clientIndividualFormik.handleChange}
                          maxLength='10'
                          required={clientIndividualFormik.values.isRelativeDiplomat ? true : false}
                          onClear={() => clientIndividualFormik.setFieldValue('relativeDiplomatInfo', '')}
                          error={
                            clientIndividualFormik.touched.relativeDiplomatInfo &&
                            Boolean(clientIndividualFormik.errors.relativeDiplomatInfo)
                          }
                          maxAccess={maxAccess}
                        />
                      </Grid>
                    </FieldSet>
                    <Grid container xs={12} sx={{ p: 5 }}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name='otpVerified'
                              disabled={true}
                              readOnly={editMode && true}
                              checked={clientIndividualFormik.values?.otpVerified}
                              onChange={clientIndividualFormik.handleChange}
                            />
                          }
                          label={labels?.OTPVerified}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name='govCellVerified'
                              disabled={editMode && !allowEdit}
                              checked={clientIndividualFormik.values?.govCellVerified}
                              onChange={clientIndividualFormik.handleChange}
                            />
                          }
                          label={labels?.govCellVerified}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              disabled={
                                clientIndividualFormik.values.gender === '2' && !editMode
                                  ? false
                                  : editMode && allowEdit
                                  ? false
                                  : true
                              }
                              name='coveredFace'
                              checked={clientIndividualFormik.values.coveredFace}
                              onChange={clientIndividualFormik.handleChange}
                            />
                          }
                          label={labels?.coveredFace}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name='isEmployee'
                              disabled={editMode && !allowEdit && true}
                              checked={clientIndividualFormik.values?.isEmployee}
                              onChange={clientIndividualFormik.handleChange}
                            />
                          }
                          label={labels?.isEmployed}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                sx={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  padding: 3,
                  textAlign: 'center'
                }}
              ></Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ClientTemplateForm
