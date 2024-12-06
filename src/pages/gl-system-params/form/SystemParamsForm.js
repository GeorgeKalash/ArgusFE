import { useEffect, useContext } from 'react'
import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { SystemFunction } from 'src/resources/SystemFunction'
import { ControlContext } from 'src/providers/ControlContext'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import * as yup from 'yup'

const SystemParamsForm = ({ _labels, access }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      GLDOEGainAccountId: yup.string().required(),
      GLDOELossAccountId: yup.string().required(),
      GLFYCLossAccountId: yup.string().required(),
      GLFYCGainAccountId: yup.string().required()
    }),
    initialValues: {
      GLDOEGainAccountId: null,
      GLDOEGainAccountname: '',
      GLDOEGainAccountref: '',
      GLDOELossAccountId: null,
      GLDOELossAccountref: '',
      GLDOELossAccountname: '',
      GLRoundingAccountDb: null,
      GLRoundingAccountDbname: '',
      GLRoundingAccountDbref: '',
      GLRoundingAccountCr: null,
      GLRoundingAccountCrname: '',
      GLRoundingAccountCrref: '',
      GLDOESeg0Start: null,
      GLDOESeg0End: null,
      GLDOEDTId: '',
      GLFYCGainAccountId: '',
      GLFYCGainAccountname: '',
      GLFYCGainAccountref: '',
      GLFYCLossAccountId: '',
      GLFYCLossAccountref: '',
      GLFYCLossAccountname: '',
      GLFYCSeg0Start: '',
      GLFYCSeg0End: '',
      GLFYCDTId: '',
      GLFYCDOECheck: false
    },
    onSubmit: values => {
      postSystemParams(values)
    }
  })

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = async () => {
    const myObject = {}

    const VALID_OBJ_KEY = [
      'GLDOEGainAccountId',
      'GLDOELossAccountId',
      'GLRoundingAccountDb',
      'GLRoundingAccountCr',
      'GLDOESeg0Start',
      'GLDOESeg0End',
      'GLDOEDTId',
      'GLFYCGainAccountId',
      'GLFYCLossAccountId',
      'GLFYCSeg0Start',
      'GLFYCSeg0End',
      'GLFYCDTId',
      'GLFYCDOECheck'
    ]

    const filteredList = defaultsData?.list?.filter(obj => VALID_OBJ_KEY.includes(obj.key))

    filteredList?.forEach(obj => {
      if (obj.key === 'GLFYCDOECheck') {
        myObject[obj.key] = obj.value === 'true' || obj.value === true
      } else if (['GLDOESeg0End', 'GLDOESeg0Start', 'GLFYCSeg0Start', 'GLFYCSeg0End'].includes(obj.key)) {
        myObject[obj.key] = obj.value || null
      } else {
        myObject[obj.key] = obj.value ? parseInt(obj.value, 10) : null
      }
    })

    formik.setValues(myObject)

    const accountMappings = [
      { key: 'GLDOEGainAccountId', refField: 'GLDOEGainAccountref', nameField: 'GLDOEGainAccountname' },
      { key: 'GLDOELossAccountId', refField: 'GLDOELossAccountref', nameField: 'GLDOELossAccountname' },
      { key: 'GLRoundingAccountDb', refField: 'GLRoundingAccountDbref', nameField: 'GLRoundingAccountDbname' },
      { key: 'GLRoundingAccountCr', refField: 'GLRoundingAccountCrref', nameField: 'GLRoundingAccountCrname' },
      { key: 'GLFYCGainAccountId', refField: 'GLFYCGainAccountref', nameField: 'GLFYCGainAccountname' },
      { key: 'GLFYCLossAccountId', refField: 'GLFYCLossAccountref', nameField: 'GLFYCLossAccountname' }
    ]

    await Promise.all(
      accountMappings.map(async ({ key, refField, nameField }) => {
        const keyValue = myObject[key]
        if (keyValue) {
          const response = await getRequest({
            extension: GeneralLedgerRepository.ChartOfAccounts.get,
            parameters: `_recordId=${keyValue}`
          })
          formik.setFieldValue(refField, response.record.accountRef)
          formik.setFieldValue(nameField, response.record.name)
        } else {
          formik.setFieldValue(refField, null)
          formik.setFieldValue(nameField, null)
        }
      })
    )
  }

  const postSystemParams = obj => {
    var data = []
    Object.entries(obj).forEach(([key, value]) => {
      const newObj = { key: key, value: value }
      data.push(newObj)
    })
    postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ SysDefaults: data })
    }).then(res => {
      if (res) toast.success(platformLabels.Edited)
      updateDefaults(data)
    })
  }

  const handleChange = fieldArray => {
    fieldArray.forEach(({ name, value }) => {
      formik.setFieldValue(name, value)
    })
  }

  return (
    <FormShell
      resourceId={ResourceIds.SystemParams}
      form={formik}
      maxAccess={access}
      infoVisible={false}
      isSavedClear={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={GeneralLedgerRepository.ChartOfAccounts.snapshot}
                valueField='accountRef'
                displayField='name'
                name='GLDOEGainAccountId'
                label={_labels.glDoeGain}
                form={formik}
                required
                displayFieldWidth={2}
                valueShow='GLDOEGainAccountref'
                secondValueShow='GLDOEGainAccountname'
                maxAccess={access}
                onChange={(event, newValue) => {
                  const { recordId = '', accountRef = '', name = '' } = newValue || {}
                  handleChange([
                    { name: 'GLDOEGainAccountId', value: recordId },
                    { name: 'GLDOEGainAccountref', value: accountRef },
                    { name: 'GLDOEGainAccountname', value: name }
                  ])
                }}
                error={formik.touched.GLDOEGainAccountId && Boolean(formik.errors.GLDOEGainAccountId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={GeneralLedgerRepository.ChartOfAccounts.snapshot}
                valueField='accountRef'
                displayField='name'
                name='GLDOELossAccountId'
                label={_labels.glDoeLoss}
                form={formik}
                required
                displayFieldWidth={2}
                valueShow='GLDOELossAccountref'
                secondValueShow='GLDOELossAccountname'
                maxAccess={access}
                onChange={(event, newValue) => {
                  const { recordId = '', accountRef = '', name = '' } = newValue || {}
                  handleChange([
                    { name: 'GLDOELossAccountId', value: recordId },
                    { name: 'GLDOELossAccountref', value: accountRef },
                    { name: 'GLDOELossAccountname', value: name }
                  ])
                }}
                error={formik.touched.GLDOELossAccountId && Boolean(formik.errors.GLDOELossAccountId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={GeneralLedgerRepository.ChartOfAccounts.snapshot}
                valueField='accountRef'
                displayField='name'
                name='GLRoundingAccountDb'
                label={_labels.glRounding}
                form={formik}
                displayFieldWidth={2}
                valueShow='GLRoundingAccountDbref'
                secondValueShow='GLRoundingAccountDbname'
                maxAccess={access}
                onChange={(event, newValue) => {
                  const { recordId = '', accountRef = '', name = '' } = newValue || {}
                  handleChange([
                    { name: 'GLRoundingAccountDb', value: recordId },
                    { name: 'GLRoundingAccountDbref', value: accountRef },
                    { name: 'GLRoundingAccountDbname', value: name }
                  ])
                }}
                error={formik.touched.GLRoundingAccountDb && Boolean(formik.errors.GLRoundingAccountDb)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={GeneralLedgerRepository.ChartOfAccounts.snapshot}
                valueField='accountRef'
                displayField='name'
                name='GLRoundingAccountCr'
                label={_labels.glRoundingC}
                form={formik}
                displayFieldWidth={2}
                valueShow='GLRoundingAccountCrref'
                secondValueShow='GLRoundingAccountCrname'
                maxAccess={access}
                onChange={(event, newValue) => {
                  const { recordId = '', accountRef = '', name = '' } = newValue || {}
                  handleChange([
                    { name: 'GLRoundingAccountCr', value: recordId },
                    { name: 'GLRoundingAccountCrref', value: accountRef },
                    { name: 'GLRoundingAccountCrname', value: name }
                  ])
                }}
                error={formik.touched.GLRoundingAccountCr && Boolean(formik.errors.GLRoundingAccountCr)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                onClear={() => formik.setFieldValue('GLDOESeg0Start', '')}
                name='GLDOESeg0Start'
                onChange={formik.handleChange}
                label={_labels.glDoeSegStart}
                value={formik.values.GLDOESeg0Start}
                error={formik.touched.GLDOESeg0Start && Boolean(formik.errors.GLDOESeg0Start)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                onClear={() => formik.setFieldValue('GLDOESeg0End', '')}
                name='GLDOESeg0End'
                onChange={formik.handleChange}
                label={_labels.glDoeSegEnd}
                value={formik.values.GLDOESeg0End}
                error={formik.touched.GLDOESeg0End && Boolean(formik.errors.GLDOESeg0End)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${SystemFunction.JournalVoucher}&_startAt=${0}&_pageSize=${50}`}
                name='GLDOEDTId'
                label={_labels.glDoeDt}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('GLDOEDTId', newValue?.recordId)
                }}
                error={formik.touched.GLDOEDTId && Boolean(formik.errors.GLDOEDTId)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={GeneralLedgerRepository.ChartOfAccounts.snapshot}
                valueField='accountRef'
                displayField='name'
                name='GLFYCGainAccountId'
                label={_labels.glFycGain}
                form={formik}
                required
                displayFieldWidth={2}
                valueShow='GLFYCGainAccountref'
                secondValueShow='GLFYCGainAccountname'
                maxAccess={access}
                onChange={(event, newValue) => {
                  const { recordId = '', accountRef = '', name = '' } = newValue || {}
                  handleChange([
                    { name: 'GLFYCGainAccountId', value: recordId },
                    { name: 'GLFYCGainAccountref', value: accountRef },
                    { name: 'GLFYCGainAccountname', value: name }
                  ])
                }}
                error={formik.touched.GLFYCGainAccountId && Boolean(formik.errors.GLFYCGainAccountId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={GeneralLedgerRepository.ChartOfAccounts.snapshot}
                valueField='accountRef'
                displayField='name'
                name='GLFYCLossAccountId'
                label={_labels.glFycLoss}
                form={formik}
                required
                displayFieldWidth={2}
                valueShow='GLFYCLossAccountref'
                secondValueShow='GLFYCLossAccountname'
                maxAccess={access}
                onChange={(event, newValue) => {
                  const { recordId = '', accountRef = '', name = '' } = newValue || {}
                  handleChange([
                    { name: 'GLFYCLossAccountId', value: recordId },
                    { name: 'GLFYCLossAccountref', value: accountRef },
                    { name: 'GLFYCLossAccountname', value: name }
                  ])
                }}
                error={formik.touched.GLFYCLossAccountId && Boolean(formik.errors.GLFYCLossAccountId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                onClear={() => formik.setFieldValue('GLFYCSeg0Start', '')}
                name='GLFYCSeg0Start'
                onChange={formik.handleChange}
                label={_labels.glFycStart}
                value={formik.values.GLFYCSeg0Start}
                error={formik.touched.GLFYCSeg0Start && Boolean(formik.errors.GLFYCSeg0Start)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                onClear={() => formik.setFieldValue('GLFYCSeg0End', '')}
                name='GLFYCSeg0End'
                onChange={formik.handleChange}
                label={_labels.glFycEnd}
                value={formik.values.GLFYCSeg0End}
                error={formik.touched.GLFYCSeg0End && Boolean(formik.errors.GLFYCSeg0End)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${SystemFunction.JournalVoucher}&_startAt=${0}&_pageSize=${50}`}
                name='GLFYCDTId'
                label={_labels.glFycDt}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('GLFYCDTId', newValue?.recordId)
                }}
                error={formik.touched.GLFYCDTId && Boolean(formik.errors.GLFYCDTId)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='GLFYCDOECheck'
                    maxAccess={access}
                    checked={formik.values?.GLFYCDOECheck}
                    onChange={formik.handleChange}
                  />
                }
                label={_labels.check}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SystemParamsForm
