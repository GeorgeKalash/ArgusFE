import { useState } from 'react'

// ** MUI Imports
import { Grid, FormControlLabel, Checkbox, Button } from '@mui/material'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { getFormattedNumberMax } from 'src/lib/numberField-helper'
import { useFormik } from 'formik'
import * as yup from 'yup'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomLookup from 'src/components/Inputs/CustomLookup'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'

export default function OutwardsTab({ labels, recordId, maxAccess, setProductsWindowOpen }) {
  const [position, setPosition] = useState()
  const [countryStore, setCountryStore] = useState([])
  const [agentsStore, setAgentsStore] = useState([])
  const [dispersalTypeStore, setDispersalTypeStore] = useState([])
  const [correspondentStore, setCorrespondentStore] = useState([])
  const [productsStore, setProductsStore] = useState([])
  const [currencyStore, setCurrencyStore] = useState([])
  const [editMode, setEditMode] = useState(false)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    plantId: '',
    countryId: '',
    dispersalType: '',
    currencyId: '',
    agentId: '',
    idNo: '',
    cl_reference: '',
    cl_name: '',
    idType: '',
    nationalityId: '',
    amount: '',
    corId: '',
    fees: '',
    baseAmount: '',
    net: ''
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      plantId: yup.string().required('This field is required'),
      countryId: yup.string().required('This field is required'),
      dispersalType: yup.string().required('This field is required'),
      currencyId: yup.string().required('This field is required'),
      agentId: yup.string().required('This field is required'),
      idNo: yup.string().required('This field is required'),
      amount: yup.string().required('This field is required'),
      productId: yup.string().required('This field is required'),
      fees: yup.string().required('This field is required'),
      baseAmount: yup.string().required('This field is required')
    }),
    onSubmit: values => {}
  })

  const onCountrySelection = countryId => {
    //get dispersals list
    var parameters = `_countryId=${countryId}`
    getRequest({
      extension: RemittanceOutwardsRepository.DispersalType.qry,
      parameters: parameters
    })
      .then(res => {
        setDispersalTypeStore(res)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const onDispersalSelection = (countryId, dispersalType) => {
    //get currencies list
    var parameters = `_countryId=${countryId}&_dispersalType=${dispersalType}`
    getRequest({
      extension: RemittanceOutwardsRepository.Currency.qry,
      parameters: parameters
    })
      .then(res => {
        setCurrencyStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const onCurrencySelection = (countryId, dispersalType, currencyId) => {
    //get agents list
    var parameters = `_countryId=${countryId}&_dispersalType=${dispersalType}&_currencyId=${currencyId}`
    getRequest({
      extension: RemittanceOutwardsRepository.Agent.qry,
      parameters: parameters
    })
      .then(res => {
        setAgentsStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const onAmountDataFill = formFields => {
    //get products list
    var type = 2
    var functionId = 1
    var plant = formFields?.plantId
    var countryId = formFields?.countryId
    var currencyId = formFields?.currencyId
    var dispersalType = formFields?.dispersalType
    var agentId = formFields?.agentId ?? 0
    var amount = formFields?.amount ?? 0

    var parameters = `_type=${type}&_functionId=${functionId}&_plantId=${plant}&_countryId=${countryId}&_dispersalType=${dispersalType}&_currencyId=${currencyId}&_agentId=${agentId}&_amount=${amount}`

    getRequest({
      extension: RemittanceOutwardsRepository.ProductDispersalEngine.qry,
      parameters: parameters
    })
      .then(res => {
        setProductsStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const onIdNoBlur = idNo => {
    var parameters = `_idNo=${idNo}`

    getRequest({
      extension: CurrencyTradingClientRepository.Identity.get,
      parameters: parameters
    })
      .then(res => {
        if (res?.record?.clientId) {
          var clientParameters = `_recordId=${res?.record?.clientId}`
          getRequest({
            extension: CurrencyTradingClientRepository.Client.get,
            parameters: clientParameters
          }).then(clientRes => {
            console.log(clientRes)
            if (clientRes?.record) {
              formik.setFieldValue('cl_reference', clientRes?.record?.reference)
              formik.setFieldValue('cl_name', clientRes?.record?.name)
              formik.setFieldValue('idType', res?.record?.idtId)
              formik.setFieldValue('nationalityId', clientRes?.record?.nationalityId)
            }
          })
        } //clear the id field or show a message that there isn't any client with this ID
        else {
          formik.setFieldValue('idNo', '')
          formik.setFieldValue('cl_reference', '')
          formik.setFieldValue('cl_name', '')
          formik.setFieldValue('idType', '')
          formik.setFieldValue('nationalityId', '')
        }
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const lookupCorrespondent = searchQry => {
    setCorrespondentStore([])
    if (searchQry) {
      var parameters = `_filter=${searchQry}`
      getRequest({
        extension: RemittanceSettingsRepository.Correspondent.snapshot,
        parameters: parameters
      })
        .then(res => {
          setCorrespondentStore(res.list)
        })
        .catch(error => {
          setErrorMessage(error)
        })
    }
  }

  return (
    <FormShell resourceId={ResourceIds.Currencies} form={formik} height={480} maxAccess={maxAccess} editMode={editMode}>
      <Grid container>
        {/* First Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Plant.qry}
              name='plantId'
              label='Plant'
              required
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField={['reference', 'name']}
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('plantId', newValue?.recordId)
              }}
              error={formik.touched.plantId && Boolean(formik.errors.plantId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={RemittanceOutwardsRepository.Country.qry}
              name='countryId'
              label='Country'
              required
              displayField={['countryRef', 'countryName']}
              columnsInDropDown={[
                { key: 'countryRef', value: 'Reference' },
                { key: 'countryName', value: 'Name' }
              ]}
              valueField='recordId'
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('countryId', newValue?.countryId)
                if (newValue) onCountrySelection(newValue?.countryId)
              }}
              error={formik.touched.countryId && Boolean(formik.errors.countryId)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='dispersalType'
              label='dispersal type'
              valueField='dispersalType'
              displayField='dispersalTypeName'
              required
              readOnly={formik.values.countryId == ''}
              store={dispersalTypeStore}
              value={dispersalTypeStore?.filter(item => item.dispersalType === formik.values.dispersalType)[0]}
              onChange={(event, newValue) => {
                formik.setFieldValue('dispersalType', newValue?.dispersalType)
                if (newValue) onDispersalSelection(formik.values.countryId, newValue?.dispersalType)
              }}
              error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
              helperText={formik.touched.dispersalType && formik.errors.dispersalType}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='currencyId'
              label='Currency'
              valueField='currencyId'
              displayField={['currencyRef', 'currencyName']}
              columnsInDropDown={[
                { key: 'currencyRef', value: 'Reference' },
                { key: 'currencyName', value: 'Name' }
              ]}
              required
              readOnly={formik.values.dispersalType == ''}
              store={currencyStore}
              value={currencyStore?.filter(item => item.currencyId === formik.values.currencyId)[0]}
              onChange={(event, newValue) => {
                formik.setFieldValue('currencyId', newValue?.currencyId)
                if (newValue)
                  onCurrencySelection(formik.values.countryId, formik.values.dispersalType, newValue?.currencyId)
              }}
              error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              helperText={formik.touched.currencyId && formik.errors.currencyId}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomComboBox
              name='agentId'
              label='Agent'
              valueField='agentId'
              displayField='agentName'
              required={formik.values.dispersalType === 2}
              readOnly={formik.values.dispersalType !== 2}
              store={agentsStore}
              value={agentsStore?.filter(item => item.agentId === formik.values.agentId)[0]}
              onChange={(event, newValue) => {
                formik.setFieldValue('agentId', newValue?.agentId)
              }}
              error={formik.touched.agentId && Boolean(formik.errors.agentId)}
              helperText={formik.touched.agentId && formik.errors.agentId}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='idNo'
              label='Id No'
              value={formik.values.idNo}
              readOnly={editMode}
              required
              onChange={formik.handleChange}
              onBlur={() => {
                if (formik.values.idNo) onIdNoBlur(formik.values.idNo)
              }}
              onClear={() => formik.setFieldValue('idNo', '')}
              error={formik.touched.idNo && Boolean(formik.errors.idNo)}
              helperText={formik.touched.idNo && formik.errors.idNo}
              maxLength='15'
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='cl_reference'
              label='Client reference'
              value={formik.values.cl_reference}
              readOnly
              onChange={formik.handleChange}
              error={formik.touched.cl_reference && Boolean(formik.errors.cl_reference)}
              helperText={formik.touched.cl_reference && formik.errors.cl_reference}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='cl_name'
              label='Client Name'
              value={formik.values.cl_name}
              readOnly
              onChange={formik.handleChange}
              error={formik.touched.cl_name && Boolean(formik.errors.cl_name)}
              helperText={formik.touched.cl_name && formik.errors.cl_name}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='idType'
              label='ID type'
              value={formik.values.idType}
              readOnly
              onChange={formik.handleChange}
              error={formik.touched.idType && Boolean(formik.errors.idType)}
              helperText={formik.touched.idType && formik.errors.idType}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='nationalityId'
              label='Nationality'
              value={formik.values.nationalityId}
              readOnly
              onChange={formik.handleChange}
              error={formik.touched.nationalityId && Boolean(formik.errors.nationalityId)}
              helperText={formik.touched.nationalityId && formik.errors.nationalityId}
              maxAccess={maxAccess}
            />
          </Grid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomTextField
              position={position}
              name='amount'
              type='text'
              label='amount'
              value={formik.values.amount}
              required
              readOnly={
                (formik.values.dispersalType == 2 && formik.values.agentId != null) ||
                (formik.values.dispersalType == 1 && formik.values.agentId === null)
                  ? false
                  : true
              }
              maxAccess={maxAccess}
              onChange={e => {
                const input = e.target
                const formattedValue = input.value ? getFormattedNumberMax(input.value, 8, 2) : input.value

                // Save current cursor position
                const currentPosition = input.selectionStart

                // Update field value
                formik.setFieldValue('amount', formattedValue)

                // Calculate the new cursor position based on the formatted value
                const newCursorPosition =
                  currentPosition + (formattedValue && formattedValue.length - input.value.length)

                setPosition(newCursorPosition)
              }}
              onBlur={() => {
                if (formik.values.amount) onAmountDataFill(formik.values)
              }}
              onClear={() => formik.setFieldValue('amount', '')}
              error={formik.touched.amount && Boolean(formik.errors.amount)}
              helperText={formik.touched.amount && formik.errors.amount}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomLookup
              name='corId'
              label='Correspondent'
              value={formik.values.corId}
              required={false}
              valueField='reference'
              displayField='name'
              firstFieldWidth='150px'
              store={correspondentStore}
              firstValue={formik.values.corRef}
              secondValue={formik.values.corName}
              setStore={setCorrespondentStore}
              onLookup={lookupCorrespondent}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('corId', newValue?.recordId)
                  formik.setFieldValue('corRef', newValue?.reference)
                  formik.setFieldValue('corName', newValue?.name)
                } else {
                  formik.setFieldValue('corId', null)
                  formik.setFieldValue('corRef', null)
                  formik.setFieldValue('corName', null)
                }
              }}
              error={formik.touched.corId && Boolean(formik.errors.corId)}
              helperText={formik.touched.corId && formik.errors.corId}
              maxAccess={maxAccess}
            />
          </Grid>
          <Button onClick={() => setProductsWindowOpen(true)}>Open Popup</Button>
          <Grid item xs={12}>
            <CustomTextField
              position={position}
              name='fees'
              type='text'
              label='fees'
              value={formik.values.fees}
              required
              readOnly
              maxAccess={maxAccess}
              onChange={e => {
                const input = e.target
                const formattedValue = input.value ? getFormattedNumberMax(input.value, 8, 2) : input.value

                // Save current cursor position
                const currentPosition = input.selectionStart

                // Calculate the new cursor position based on the formatted value
                const newCursorPosition =
                  currentPosition + (formattedValue && formattedValue.length - input.value.length)

                setPosition(newCursorPosition)
              }}
              error={formik.touched.fees && Boolean(formik.errors.fees)}
              helperText={formik.touched.fees && formik.errors.fees}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              position={position}
              name='baseAmount'
              type='text'
              label='Base Amount'
              value={formik.values.baseAmount}
              required
              readOnly
              maxAccess={maxAccess}
              onChange={e => {
                const input = e.target
                const formattedValue = input.value ? getFormattedNumberMax(input.value, 8, 2) : input.value

                // Save current cursor position
                const currentPosition = input.selectionStart

                // Calculate the new cursor position based on the formatted value
                const newCursorPosition =
                  currentPosition + (formattedValue && formattedValue.length - input.value.length)

                setPosition(newCursorPosition)
              }}
              error={formik.touched.baseAmount && Boolean(formik.errors.baseAmount)}
              helperText={formik.touched.baseAmount && formik.errors.baseAmount}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              position={position}
              name='net'
              type='text'
              label='net to pay'
              value={formik.values.net}
              required
              readOnly
              maxAccess={maxAccess}
              onChange={e => {
                const input = e.target
                const formattedValue = input.value ? getFormattedNumberMax(input.value, 8, 2) : input.value

                // Save current cursor position
                const currentPosition = input.selectionStart

                // Calculate the new cursor position based on the formatted value
                const newCursorPosition =
                  currentPosition + (formattedValue && formattedValue.length - input.value.length)

                setPosition(newCursorPosition)
              }}
              error={formik.touched.net && Boolean(formik.errors.net)}
              helperText={formik.touched.net && formik.errors.net}
            />
          </Grid>
        </Grid>
      </Grid>
    </FormShell>
  )
}
