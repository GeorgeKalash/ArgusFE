import { Grid, FormControlLabel, Checkbox, Button, CircularProgress } from '@mui/material'
import { useEffect, useState, useContext } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
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
import { useForm } from 'src/hooks/form'
import ConfirmationDialog from 'src/components/ConfirmationDialog'
import { SystemChecks } from 'src/resources/SystemChecks'
import CustomButton from 'src/components/Inputs/CustomButton'
import MoreDetails from './MoreDetails'

const ClientTemplateForm = ({ recordId, labels, plantId, maxAccess, allowEdit = false }) => {
  const { stack } = useWindow()
  const { getRequestFullEndPoint, getRequest, postRequest } = useContext(RequestsContext)
  const { systemChecks, defaultsData } = useContext(ControlContext)
  const [showAsPassword, setShowAsPassword] = useState(!!recordId)
  const [showAsPasswordPhone, setShowAsPasswordPhone] = useState(!!recordId)
  const [showAsPasswordPhoneRepeat, setShowAsPasswordPhoneRepeat] = useState(!!recordId)
  const [referenceRequired, setReferenceRequired] = useState(true)
  const [address, setAddress] = useState([])
  const [editMode, setEditMode] = useState(!!recordId)
  const [otpShow, setOtpShow] = useState(false)
  const [newProf, setNewProf] = useState(false)
  const [idTypes, setIdTypes] = useState({})
  const [nationalities, setNationalities] = useState({})
  const [isValidatePhoneClicked, setIsValidatePhoneClicked] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(null)
  const [idScanner, setIdScanner] = useState(null)

  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)

  const trialDays = defaultsData?.list?.find(({ key }) => key === 'ct-client-trial-days')?.value

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
    trialDays: null,
    idScanMode: null,

    //clientRemittance
    remittanceRecordId: '',
    trxCountPerYear: '',
    trxAmountPerYear: '',
    otpVerified: false,
    govCellVerified: false,
    addressId: '',
    batchId: '',
    civilStatus: '',
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
      formik.setFieldValue('idtId', '')
      formik.setFieldValue('idtName', '')
      formik.setFieldValue('isResident', false)
    }
    const idType = await getValue(value)
    if (idType) {
      formik.setFieldValue('idtId', idType.recordId)
      formik.setFieldValue('idtName', idType.name)
      formik.setFieldValue('isResident', idType.isResident || false)
    }
  }

  async function getCountry() {
    var parameters = `_filter=&_key=countryId`

    const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: parameters
    })
    const countryId = res.record.value

    countryId && formik.setFieldValue('idCountry', parseInt(countryId))
  }

  useEffect(() => {
    if (recordId) {
      getClient(recordId, true)
    }
  }, [])

  function getClient(recordId, requestImage = false) {
    const defaultParams = `_clientId=${recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RTCLRepository.CtClientIndividual.get2,
      parameters: parameters
    }).then(async res => {
      const obj = res?.record

      obj?.workAddressView && setAddress(obj?.workAddressView)
      formik.setValues({
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
        trialDays: obj.clientMaster?.trialDays,
        idScanMode: obj.clientMaster?.idScanMode,

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

      setIdScanner(obj.clientMaster?.idScanMode)
      setEditMode(true)

      if (
        requestImage === true &&
        obj.clientRemittance?.clientId &&
        obj.clientIDView?.idNo &&
        obj.clientIDView?.idtId &&
        obj.clientMaster?.idScanMode &&
        (obj.clientMaster?.idScanMode == 1 || obj.clientMaster?.idScanMode == 2)
      ) {
        setLoading(true)

        const parameters = `_number=${obj.clientIDView?.idNo}&_clientId=${obj.clientRemittance?.clientId}&_idType=${obj.clientIDView?.idtId}&_idScanMode=${obj.clientMaster?.idScanMode}`

        const res = await getRequest({
          extension: CurrencyTradingSettingsRepository.PreviewImageID.get,
          parameters: parameters
        })

        setImageUrl(res?.record?.imageContent ?? null)

        setLoading(false)
      }
    })
  }

  const checkIdNumber = id => {
    var parameters = `_idNo=` + id
    if (id)
      getRequest({
        extension: CTCLRepository.IDNumber.get,
        parameters: parameters
      }).then(res => {
        if (res.record) {
          stackError({ message: 'the ID number exists.' })
        }
      })
  }

  const handleConfirmFetchMobileOwner = async () => {
    setIsValidatePhoneClicked(true)
    formik.setFieldTouched('cellPhone', false)
    formik.setFieldTouched('cellPhoneRepeat', false)
    formik.setFieldTouched('idNo', false)
    formik.setFieldValue('trialDays', trialDays)
    stack({
      Component: ConfirmationDialog,
      props: {
        fullScreen: false,
        okButtonAction: handleFetchMobileOwner,
        DialogText: platformLabels.PhoneVerificationConfirmation
      },
      width: 450,
      height: 170,
      title: platformLabels.Confirmation
    })
  }

  const otpForm = () => {
    stack({
      Component: OTPPhoneVerification,
      props: {
        recordId: formik.values.recordId,
        values: formik.values,
        functionId: formik.values.functionId,
        setEditMode: setEditMode,
        getData: getClient
      },
      width: 400,
      height: 400,
      title: labels.OTPVerification
    })
  }

  const { formik } = useForm({
    maxAccess,
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
      shouldValidateOnSubmit ? handleConfirmFetchMobileOwner() : await postRtDefault(values)
    }
  })

  const isClosed = !(editMode && formik.values.status === -1 && !formik.values.otpVerified && formik.values.wip !== 2)

  const wip = formik.values.wip === 2

  async function saveImage(obj) {
    if (imageUrl)
      return await postRequest({
        extension: CurrencyTradingSettingsRepository.ScannerImage.set,
        record: JSON.stringify({ base64Image: imageUrl, clientId: obj.clientId, numberID: obj.numberID })
      })
  }

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
      plantId: formik.values.plantId,
      createdDate: formatDateToApi(date.toISOString()),
      expiryDate: formatDateToApi(obj.expiryDate),
      professionId: obj.professionId,
      categoryName: obj.categoryName,
      extraIncomeId: obj.extraIncomeId,
      bankId: obj.bankId,
      iban: obj.iban,
      trialDays: obj.trialDays,
      idScanMode: obj.idScanMode
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
      middleName: obj.familyName ? obj.middleName + '' + obj.familyName : obj.middleName,
      familyName: null,
      fl_firstName: obj.fl_firstName,
      fl_lastName: obj.fl_lastName,
      fl_middleName: obj.fl_familyName ? obj.fl_middleName + ' ' + obj.fl_familyName : obj.fl_middleName,
      fl_familyName: null,
      birthDate: formatDateToApi(obj.birthDate),
      isResident: obj.isResident,
      sponsorName: obj.sponsorName,
      incomeSourceId: obj.incomeSourceId
    }

    const obj4 = {
      recordId: obj.remittanceRecordId,
      clientId: obj.clientId || 0,
      plantId: formik.values.plantId,
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
        plantId: formik.values.plantId,
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
      }).then(res => {
        if (res) {
          if (imageUrl && obj?.idScanMode == 1 && idScanner !== obj?.idScanMode)
            saveImage({ clientId: obj.clientId, numberID: obj.idNo })

          toast.success(platformLabels.Edited)
          otpForm()
          getClient(obj.recordId)
        }
      })
    } else {
      const data = {
        plantId: formik.values.plantId,
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
      }).then(res => {
        if (res) {
          if (imageUrl && obj?.idScanMode == 1) saveImage({ clientId: res.recordId, numberID: obj.idNo })

          toast.success(platformLabels.Submit)
          setOtpShow(true)
          getClient(res.recordId)
          setEditMode(true)
        }
      })
    }
  }

  useEffect(() => {
    if (formik.values.idtId) {
      const res = idTypes.list?.filter(item => item.recordId === formik.values.idtId)?.[0]
      if (res && res['type'] && (res['type'] === 1 || res['type'] === 2)) {
        getCountry()
      }
    }
  }, [formik.values.idtId])

  useEffect(() => {
    if (formik.values.clientId && otpShow) otpForm()
  }, [formik.values.clientId, otpShow])

  const fillFilterProfession = value => {
    if (value) {
      formik.setFieldValue('isDiplomat', true)
      formik.setFieldValue('isDiplomatReadOnly', true)
    } else {
      formik.setFieldValue('isDiplomat', false)
      formik.setFieldValue('isDiplomatReadOnly', false)
    }
  }

  const onClose = async () => {
    const values = formik.values

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
      disabled: !wip
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

  const handleClickDigitalId = async confirmWindow => {
    setLoading(true)

    const parameters = `_number=${formik.values.idNo}&_idType=${formik.values.idtId}`

    const res = await getRequest({
      extension: CurrencyTradingSettingsRepository.Absher.get,
      parameters
    })

    const result = res?.record

    if (result) {
      formik.setFieldValue('idScanMode', 2)

      setImageUrl(result?.imageContent)

      confirmWindow.close()
    } else {
      formik.setFieldValue('idScanMode', null)

      setImageUrl(null)
    }

    setLoading(false)
  }

  const handleClickScanner = async confirmWindow => {
    setLoading(true)

    const response = await getRequestFullEndPoint({ endPoint: process.env.NEXT_PUBLIC_SCANNER_URL })

    if (response?.imageContent) {
      formik.setFieldValue('idScanMode', 1)

      setImageUrl(response?.imageContent)

      confirmWindow.close()
    } else {
      formik.setFieldValue('idScanMode', null)

      setImageUrl(null)
    }

    setLoading(false)
  }

  const digitalIdConfirmation = mode => {
    stack({
      Component: ConfirmationDialog,
      props: {
        DialogText: mode === 2 ? platformLabels.AbsherConfirmation : platformLabels.scannerConfirmation,
        okButtonAction: mode === 2 ? handleClickDigitalId : handleClickScanner,
        fullScreen: false
      },
      width: 450,
      height: 170,
      title: platformLabels.Confirmation
    })
  }

  useEffect(() => {
    if (formik.values.nationalityId) {
      const languageId = nationalities?.list?.filter(item => item.recordId === formik.values.nationalityId)?.[0]
        ?.languageId

      languageId && formik.setFieldValue('smsLanguage', languageId)
    }
  }, [formik?.values?.nationalityId])

  const handleFetchMobileOwner = async window => {
    const parameters = `_idNo=${formik.values.idNo}&_mobileNumber=${formik.values.cellPhone}`

    getRequest({
      extension: CurrencyTradingSettingsRepository.Mobile.get,
      parameters: parameters
    })
      .then(res => {
        window.close()
        formik.setFieldValue('govCellVerified', true)
        if (res.record.isOwner) {
          formik.setFieldValue('trialDays', null)
          toast.success(platformLabels.PhoneVerification)
        } else {
          formik.setFieldValue('trialDays', trialDays)
          toast.error(platformLabels.notOwner)
        }
      })
      .catch(() => {
        formik.setFieldValue('govCellVerified', false)
      })
  }

  const isCellPhoneTouched = Boolean(formik.touched.cellPhone && formik.touched.cellPhoneRepeat)
  const isIdNoTouched = Boolean(formik.touched.idNo)

  const shouldValidateOnSubmit =
    (isCellPhoneTouched || isIdNoTouched) &&
    !isValidatePhoneClicked &&
    !formik.values.govCellVerified &&
    !systemChecks?.some(item => item.checkId === SystemChecks.CT_DISABLE_MOBILE_VERIFICATION)

  return (
    <FormShell
      actions={actions}
      resourceId={ResourceIds.UpdateClientRemittance}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      disabledSubmit={editMode && !allowEdit && true}
    >
      <VertLayout>
        <Grow>
          <Grid container xs={12} spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextFieldReference
                    endpointId={CurrencyTradingSettingsRepository.Defaults.get}
                    param={'ct-nra-individual'}
                    name='reference'
                    label={labels.reference}
                    editMode={editMode}
                    value={formik.values?.reference}
                    setReferenceRequired={setReferenceRequired}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomTextField
                    name='cltRemReference'
                    label={labels.lastKYC}
                    value={formik?.values?.cltRemReference}
                    maxAccess={maxAccess}
                    maxLength='30'
                    readOnly
                    error={formik.touched.cltRemReference && Boolean(formik.errors.cltRemReference)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='isResident'
                        checked={formik.values?.isResident}
                        onChange={formik.handleChange}
                        disabled={editMode && !allowEdit}
                      />
                    }
                    label={labels.isResident}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomDatePicker
                    name='birthDate'
                    label={labels.birthDate}
                    value={formik.values?.birthDate}
                    required={true}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('birthDate', '')}
                    autoFocus={!editMode}
                    disabledDate={'>='}
                    readOnly={editMode && !allowEdit && true}
                    error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomDatePickerHijri
                    name='birthDateHijri'
                    label={labels.birthDateHijri}
                    value={formik.values?.birthDate}
                    readOnly={editMode && !allowEdit}
                    onChange={(name, value) => {
                      formik.setFieldValue('birthDate', value)
                    }}
                    onClear={() => formik.setFieldValue('birthDate', '')}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FieldSet title={labels.id}>
                    <Grid container spacing={2}>
                      <Grid item xs={5}>
                        <CustomTextField
                          name='idNo'
                          label={labels.idNo}
                          type={showAsPassword ? 'password' : ''}
                          value={formik.values?.idNo}
                          required
                          onChange={e => {
                            setIsValidatePhoneClicked(false)
                            formik.setFieldTouched('idNo', true)
                            formik.handleChange(e)
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
                            formik.setFieldValue('idNo', '')
                          }}
                          error={formik.touched.idNo && Boolean(formik.errors.idNo)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <ResourceComboBox
                          endpointId={CurrencyTradingSettingsRepository.IdTypes.qry}
                          name='idtId'
                          label={labels.id_type}
                          valueField='recordId'
                          displayField='name'
                          readOnly={editMode && !allowEdit && true}
                          values={formik.values}
                          setData={setIdTypes}
                          required
                          onChange={(event, newValue) => {
                            if (newValue) {
                              fillFilterProfession(newValue.isDiplomat)
                            } else {
                              fillFilterProfession('')
                            }

                            formik.setFieldValue('idtId', newValue?.recordId || '')
                            formik.setFieldValue('idtName', newValue?.name || '')
                            formik.setFieldValue('isResident', newValue?.isResident || false)
                          }}
                          error={formik.touched.idtId && Boolean(formik.errors.idtId)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Button
                          variant='contained'
                          sx={{
                            '&:hover': {
                              opacity: 0.8
                            },
                            width: 'auto',
                            height: '33px',
                            objectFit: 'contain',
                            minWidth: 'auto'
                          }}
                          onClick={() =>
                            stack({
                              Component: Confirmation,
                              props: {
                                clientformik: formik,
                                labels: labels,
                                idTypes,
                                refreshProf
                              },
                              title: labels.fetch,
                              width: 400,
                              height: 400
                            })
                          }
                          disabled={
                            !formik?.values?.idtId ||
                            !formik?.values?.birthDate ||
                            !formik.values.idNo ||
                            (editMode && new Date(formik.values?.expiryDate) >= new Date()) ||
                            (editMode && !allowEdit)
                              ? true
                              : false
                          }
                        >
                          {labels.fetch}
                        </Button>
                      </Grid>
                      <Grid item xs={4}>
                        <CustomDatePicker
                          name='expiryDate'
                          label={labels.expiryDate}
                          value={formik.values?.expiryDate}
                          readOnly={editMode && !allowEdit && true}
                          required={true}
                          onChange={formik.setFieldValue}
                          onClear={() => formik.setFieldValue('expiryDate', '')}
                          disabledDate={!editMode && '<'}
                          error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <CustomDatePicker
                          name='issueDate'
                          label={labels.issueDate}
                          value={formik.values?.issueDate}
                          readOnly={editMode && !allowEdit && true}
                          onChange={formik.setFieldValue}
                          onClear={() => formik.setFieldValue('issueDate', '')}
                          disabledDate={!editMode && '>'}
                          error={formik.touched.issueDate && Boolean(formik.errors.issueDate)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <CustomDatePickerHijri
                          name='issueDateHijri'
                          label={labels.issueDateHijri}
                          value={formik.values?.issueDate}
                          onChange={(name, value) => {
                            formik.setFieldValue('issueDate', value)
                          }}
                          readOnly={editMode && !allowEdit && true}
                          disabledDate={!editMode && '>'}
                          onClear={() => formik.setFieldValue('issueDate', '')}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <ResourceComboBox
                          endpointId={SystemRepository.Country.qry}
                          name='idCountry'
                          label={labels.issusCountry}
                          valueField='recordId'
                          displayField={['reference', 'name', 'flName']}
                          readOnly={editMode && !allowEdit && true}
                          displayFieldWidth={1.5}
                          columnsInDropDown={[
                            { key: 'reference', value: 'Reference' },
                            { key: 'name', value: 'Name' },
                            { key: 'flName', value: 'Foreign Language Name' }
                          ]}
                          values={formik.values}
                          required
                          onChange={(event, newValue) => {
                            if (newValue) {
                              formik.setFieldValue('idCountry', newValue?.recordId)
                              formik.setFieldValue('idCity', '')
                              formik.setFieldValue('cityName', '')
                            } else {
                              formik.setFieldValue('idCountry', '')
                              formik.setFieldValue('idCity', '')
                              formik.setFieldValue('cityName', '')
                            }
                          }}
                          error={formik.touched.idCountry && Boolean(formik.errors.idCountry)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <ResourceLookup
                          endpointId={SystemRepository.City.snapshot}
                          parameters={{
                            _countryId: formik.values.idCountry,
                            _stateId: 0
                          }}
                          name='idCity'
                          label={labels.issueCity}
                          form={formik}
                          valueField='name'
                          displayField='name'
                          firstValue={formik.values.cityName}
                          secondDisplayField={false}
                          readOnly={((editMode && !allowEdit) || !formik.values.idCountry) && true}
                          maxAccess={maxAccess}
                          onChange={(event, newValue) => {
                            if (newValue) {
                              formik.setFieldValue('idCity', newValue?.recordId)
                              formik.setFieldValue('cityName', newValue?.name)
                            } else {
                              formik.setFieldValue('idCity', null)
                              formik.setFieldValue('cityName', null)
                            }
                          }}
                          error={formik.touched.idCity && Boolean(formik.errors.idCity)}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <CustomTextField
                          name='idIssuePlaceCode'
                          label={labels.issusPlace}
                          value={formik.values?.idIssuePlaceCode}
                          onChange={formik.handleChange}
                          readOnly={editMode && !allowEdit && true}
                          onClear={() => formik.setFieldValue('idIssuePlaceCode', '')}
                          error={formik.touched.idIssuePlaceCode && Boolean(formik.errors.idIssuePlaceCode)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <CustomTextField
                              name='firstName'
                              label={labels.first}
                              value={formik.values?.firstName}
                              required
                              onChange={e => {
                                formik.handleChange(e)
                                formik.setFieldValue('name', e.target.value + ' ' + formik.values?.lastName)
                              }}
                              language='english'
                              maxLength='10'
                              readOnly={editMode && !allowEdit && true}
                              onClear={() => formik.setFieldValue('firstName', '')}
                              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <CustomTextField
                              name='middleName'
                              label={labels.middle}
                              value={formik.values?.middleName}
                              onChange={formik.handleChange}
                              language='english'
                              maxLength='10'
                              readOnly={editMode && !allowEdit && true}
                              onClear={() => formik.setFieldValue('middleName', '')}
                              error={formik.touched.middleName && Boolean(formik.errors.middleName)}
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <CustomTextField
                              name='lastName'
                              label={labels.last}
                              value={formik.values?.lastName}
                              required
                              onChange={e => {
                                formik.handleChange(e),
                                  formik.setFieldValue('name', formik.values?.firstName + ' ' + e.target.value)
                              }}
                              language='english'
                              maxLength='10'
                              readOnly={editMode && !allowEdit && true}
                              onClear={() => formik.setFieldValue('lastName', '')}
                              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          {/* <Grid item xs={3}>
                            <CustomTextField
                              name='familyName'
                              label={labels.family}
                              value={formik.values?.familyName}
                              onChange={formik.handleChange}
                              language='english'
                              maxLength='10'
                              readOnly={editMode && !allowEdit && true}
                              onClear={() => formik.setFieldValue('familyName', '')}
                              error={formik.touched.familyName && Boolean(formik.errors.familyName)}
                              maxAccess={maxAccess}
                            />
                          </Grid> */}
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container spacing={2} sx={{ flexDirection: 'row-reverse' }}>
                          <Grid item xs={4}>
                            <CustomTextField
                              name='fl_firstName'
                              label={labels.fl_first}
                              value={formik.values?.fl_firstName}
                              onChange={formik.handleChange}
                              maxLength='10'
                              readOnly={editMode && !allowEdit && true}
                              dir='rtl'
                              language='arabic'
                              onClear={() => formik.setFieldValue('fl_firstName', '')}
                              error={formik.touched.fl_firstName && Boolean(formik.errors.fl_firstName)}
                              helperText={formik.touched.fl_firstName && formik.errors.fl_firstName}
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <CustomTextField
                              name='fl_middleName'
                              label={labels.fl_middle}
                              value={formik.values?.fl_middleName}
                              onChange={formik.handleChange}
                              readOnly={editMode && !allowEdit && true}
                              dir='rtl'
                              language='arabic'
                              onClear={() => formik.setFieldValue('fl_familyName', '')}
                              error={formik.touched.fl_middleName && Boolean(formik.errors.fl_middleName)}
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <CustomTextField
                              name='fl_lastName'
                              label={labels.fl_last}
                              value={formik.values?.fl_lastName}
                              onChange={formik.handleChange}
                              maxLength='10'
                              dir='rtl'
                              language='arabic'
                              readOnly={editMode && !allowEdit && true}
                              onClear={() => formik.setFieldValue('fl_lastName', '')}
                              error={formik.touched.fl_lastName && Boolean(formik.errors.fl_lastName)}
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          {/* <Grid item xs={3}>
                            <CustomTextField
                              name='fl_familyName'
                              label={labels.fl_family}
                              value={formik.values?.fl_familyName}
                              onChange={formik.handleChange}
                              readOnly={editMode && !allowEdit && true}
                              dir='rtl'
                              language='arabic'
                              onClear={() => formik.setFieldValue('fl_familyName', '')}
                              error={formik.touched.fl_familyName && Boolean(formik.errors.fl_familyName)}
                              maxAccess={maxAccess}
                            />
                          </Grid> */}
                        </Grid>
                      </Grid>
                      <Grid item xs={4}>
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
                          displayFieldWidth={1.5}
                          readOnly={editMode && !allowEdit && true}
                          values={formik.values}
                          required
                          onChange={(event, newValue) => {
                            if (newValue) {
                              formik.setFieldValue('nationalityId', newValue?.recordId)
                              formik.setFieldValue('smsLanguage', newValue?.languageId)
                            } else {
                              formik.setFieldValue('nationalityId', '')
                              formik.setFieldValue('smsLanguage', '')
                            }
                          }}
                          error={formik.touched.nationalityId && Boolean(formik.errors.nationalityId)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <ResourceComboBox
                          datasetId={DataSets.GENDER}
                          name='gender'
                          label={labels.gender}
                          valueField='key'
                          displayField='value'
                          required
                          readOnly={editMode && !allowEdit && true}
                          values={formik.values}
                          onChange={(event, newValue) => {
                            formik.setFieldValue('coveredFace', false)
                            if (newValue) {
                              formik.setFieldValue('gender', newValue?.key)
                            } else {
                              formik.setFieldValue('gender', '')
                            }
                          }}
                          error={formik.touched.gender && Boolean(formik.errors.gender)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4} key={newProf}>
                        <ResourceComboBox
                          endpointId={RemittanceSettingsRepository.Profession.qry}
                          filter={
                            idTypes?.list?.filter(item => item.recordId == formik.values.idtId)?.[0]?.isDiplomat
                              ? item => item.diplomatStatus === 2
                              : undefined
                          }
                          name='professionId'
                          label={labels.profession}
                          valueField='recordId'
                          readOnly={editMode && !allowEdit && true}
                          displayField={['reference', 'name', 'flName']}
                          columnsInDropDown={[
                            { key: 'reference', value: 'Reference' },
                            { key: 'name', value: 'Name' },
                            { key: 'flName', value: 'Foreign Language Name' }
                          ]}
                          displayFieldWidth={1.5}
                          values={formik.values}
                          required
                          onChange={(event, newValue) => {
                            if (newValue) {
                              formik.setFieldValue('professionId', newValue?.recordId)
                            } else {
                              formik.setFieldValue('professionId', '')
                            }
                          }}
                          error={formik.touched.professionId && Boolean(formik.errors.professionId)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomTextField
                          name='sponsorName'
                          label={labels.sponsorName}
                          value={formik.values?.sponsorName}
                          readOnly={editMode && !allowEdit && true}
                          onChange={formik.handleChange}
                          maxLength='200'
                          onClear={() => formik.setFieldValue('sponsorName', '')}
                          error={formik.touched.sponsorName && Boolean(formik.errors.sponsorName)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                    </Grid>
                  </FieldSet>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <CustomButton
                        onClick={() => digitalIdConfirmation(1)}
                        label={labels.scanner}
                        color='primary'
                        disabled={loading || (editMode && !allowEdit)}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <CustomButton
                        onClick={() => digitalIdConfirmation(2)}
                        label={labels.digitalId}
                        color='primary'
                        disabled={!formik.values.idNo || !formik.values.idtId || loading || (editMode && !allowEdit)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                {imageUrl && (
                  <Grid item xs={12}>
                    <img
                      src={`data:image/png;base64,${imageUrl}`}
                      alt='Id image'
                      style={{ width: '100%', height: '95%' }}
                    />
                  </Grid>
                )}
                {loading && !imageUrl && (
                  <Grid item xs={12} textAlign={'center'} paddingTop={5}>
                    <CircularProgress />
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container xs={12} spacing={2}>
                <Grid item xs={12}>
                  <FieldSet title={labels.customerInformation}>
                    <Grid container spacing={2}>
                      <Grid item xs={5}>
                        <CustomTextField
                          name='cellPhone'
                          type={showAsPasswordPhone && formik.values?.cellPhone ? 'password' : 'text'}
                          label={labels.cellPhone}
                          value={formik.values?.cellPhone}
                          readOnly={editMode && !allowEdit && true}
                          required
                          phone={true}
                          onChange={e => {
                            formik.setFieldTouched('cellPhone', true)
                            setIsValidatePhoneClicked(false)
                            formik.handleChange(e)
                            formik.values?.cellPhoneRepeat === e.target.value &&
                              formik.setFieldValue('whatsAppNo', e.target.value)
                          }}
                          maxLength='15'
                          autoComplete='off'
                          onCopy={handleCopy}
                          onPaste={handleCopy}
                          onBlur={e => {
                            setShowAsPasswordPhone(true), formik.handleBlur(e)
                          }}
                          onFocus={e => {
                            setShowAsPasswordPhone(false)
                          }}
                          onClear={() => formik.setFieldValue('cellPhone', '')}
                          error={formik.touched.cellPhone && Boolean(formik.errors.cellPhone)}
                          helperText={formik.touched.cellPhone && formik.errors.cellPhone}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <CustomTextField
                          name='cellPhoneRepeat'
                          type={showAsPasswordPhoneRepeat && formik.values?.cellPhoneRepeat ? 'password' : 'text'}
                          label={labels.confirmCell}
                          value={formik.values?.cellPhoneRepeat}
                          required
                          readOnly={editMode && !allowEdit && true}
                          maxLength='15'
                          autoComplete='off'
                          phone={true}
                          onChange={e => {
                            formik.setFieldTouched('cellPhoneRepeat', true)
                            setIsValidatePhoneClicked(false)
                            formik.handleChange(e)
                            formik.values?.cellPhone === e.target.value &&
                              formik.setFieldValue('whatsAppNo', e.target.value)
                          }}
                          onBlur={e => {
                            setShowAsPasswordPhoneRepeat(true), formik.handleBlur(e)
                          }}
                          onFocus={e => {
                            setShowAsPasswordPhoneRepeat(false)
                          }}
                          onCopy={handleCopy}
                          onPaste={handleCopy}
                          onClear={() => formik.setFieldValue('cellPhoneRepeat', '')}
                          error={formik.touched.cellPhoneRepeat && Boolean(formik.errors.cellPhoneRepeat)}
                          helperText={formik.touched.cellPhoneRepeat && formik.errors.cellPhoneRepeat}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <CustomButton
                          onClick={handleConfirmFetchMobileOwner}
                          label={labels.fetch}
                          color='primary'
                          disabled={
                            !formik.values.idNo ||
                            !formik.values.cellPhone ||
                            systemChecks?.some(item => item.checkId === SystemChecks.CT_DISABLE_MOBILE_VERIFICATION) ||
                            (editMode && !allowEdit)
                          }
                        />
                      </Grid>
                      <Grid item xs={4}>
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
                          displayFieldWidth={1.5}
                          values={formik.values}
                          onChange={(event, newValue) => {
                            if (newValue) {
                              formik.setFieldValue('cobId', newValue?.recordId)
                            } else {
                              formik.setFieldValue('cobId', '')
                            }
                          }}
                          error={formik.touched.cobId && Boolean(formik.errors.cobId)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4}>
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
                          displayFieldWidth={1.5}
                          values={formik.values}
                          required
                          onChange={(event, newValue) => {
                            if (newValue) {
                              formik.setFieldValue('incomeSourceId', newValue?.recordId)
                            } else {
                              formik.setFieldValue('incomeSourceId', '')
                            }
                          }}
                          error={formik.touched.incomeSourceId && Boolean(formik.errors.incomeSourceId)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4}>
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
                          values={formik.values}
                          onChange={(event, newValue) => {
                            if (newValue) {
                              formik.setFieldValue('salaryRangeId', newValue?.recordId)
                            } else {
                              formik.setFieldValue('salaryRangeId', '')
                            }
                          }}
                          error={formik.touched.salaryRangeId && Boolean(formik.errors.salaryRangeId)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <ResourceComboBox
                          datasetId={DataSets.LANGUAGE}
                          name='smsLanguage'
                          label={labels.smsLanguage}
                          valueField='key'
                          displayField='value'
                          values={formik.values}
                          required
                          readOnly={editMode && !allowEdit && true}
                          onChange={(event, newValue) => {
                            if (newValue) {
                              formik.setFieldValue('smsLanguage', newValue?.key)
                            } else {
                              formik.setFieldValue('smsLanguage', '')
                            }
                          }}
                          error={formik.touched.smsLanguage && Boolean(formik.errors.smsLanguage)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <CustomTextField
                          name='whatsAppNo'
                          label={labels.whatsapp}
                          value={formik.values?.whatsAppNo}
                          readOnly={editMode && !allowEdit && true}
                          onChange={formik.handleChange}
                          maxLength='15'
                          phone={true}
                          onClear={() => formik.setFieldValue('whatsAppNo', '')}
                          error={formik.touched.whatsAppNo && Boolean(formik.errors.whatsAppNo)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <ResourceComboBox
                          name='status'
                          label={labels.status}
                          datasetId={DataSets.ACTIVE_STATUS}
                          values={formik.values}
                          valueField='key'
                          displayField='value'
                          onChange={(event, newValue) => {
                            if (newValue) {
                              formik.setFieldValue('status', newValue?.key)
                            } else {
                              formik.setFieldValue('status', newValue?.key)
                            }
                          }}
                          readOnly={true}
                          error={formik.touched.status && Boolean(formik.errors.status)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                    </Grid>
                  </FieldSet>
                </Grid>
                <Grid item xs={12}>
                  <FieldSet title={labels.address}>
                    <AddressTab
                      labels={labels}
                      defaultReadOnly={{ countryId: true }}
                      addressValidation={formik}
                      readOnly={editMode && !allowEdit && true}
                      access={maxAccess}
                    />
                  </FieldSet>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={5}>
                      <CustomButton
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
                            width: 800,
                            height: 350,
                            title: labels.workAddress
                          })
                        }
                        label={labels.workAddress}
                        color='primary'
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <CustomButton
                        onClick={() =>
                          stack({
                            Component: MoreDetails,
                            props: {
                              readOnly: editMode && !allowEdit,
                              labels: labels,
                              clientFormik: formik,
                              maxAccess: maxAccess,
                              editMode: editMode,
                              allowEdit
                            },
                            width: 500,
                            height: 400,
                            title: labels.moreDetails
                          })
                        }
                        label={labels.moreDetails}
                        color='primary'
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <FieldSet title={labels.diplomat}>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name='isDiplomat'
                            checked={formik.values?.isDiplomat}
                            disabled={(formik.values?.isDiplomatReadOnly || (editMode && !allowEdit)) && true}
                            onChange={formik.handleChange}
                          />
                        }
                        label={labels?.isDiplomat}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name='isRelativeDiplomat'
                            checked={formik.values?.isRelativeDiplomat}
                            disabled={editMode && !allowEdit}
                            onChange={e => {
                              formik.handleChange(e), formik.setFieldValue('relativeDiplomatInfo', '')
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
                        onBlur={formik.handleBlur}
                        value={formik.values?.relativeDiplomatInfo}
                        readOnly={editMode || (!formik.values?.isRelativeDiplomat && true)}
                        onChange={formik.handleChange}
                        maxLength='10'
                        required={formik.values.isRelativeDiplomat ? true : false}
                        onClear={() => formik.setFieldValue('relativeDiplomatInfo', '')}
                        error={formik.touched.relativeDiplomatInfo && Boolean(formik.errors.relativeDiplomatInfo)}
                        maxAccess={maxAccess}
                      />
                    </Grid>
                  </FieldSet>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name='otpVerified'
                            disabled={true}
                            readOnly={editMode && true}
                            checked={formik.values?.otpVerified}
                            onChange={formik.handleChange}
                          />
                        }
                        label={labels?.OTPVerified}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name='govCellVerified'
                            disabled={editMode && !allowEdit}
                            checked={formik.values?.govCellVerified}
                            onChange={formik.handleChange}
                          />
                        }
                        label={labels?.govCellVerified}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            disabled={
                              formik.values.gender === '2' && !editMode ? false : editMode && allowEdit ? false : true
                            }
                            name='coveredFace'
                            checked={formik.values.coveredFace}
                            onChange={formik.handleChange}
                          />
                        }
                        label={labels?.coveredFace}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name='isEmployee'
                            disabled={editMode && !allowEdit && true}
                            checked={formik.values?.isEmployee}
                            onChange={formik.handleChange}
                          />
                        }
                        label={labels?.isEmployed}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ClientTemplateForm
