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

    const filteredList = defaultsData?.list?.filter(obj => {
      return (
        obj.key === 'GLDOEGainAccountId' ||
        obj.key === 'GLDOELossAccountId' ||
        obj.key === 'GLRoundingAccountDb' ||
        obj.key === 'GLRoundingAccountCr' ||
        obj.key === 'GLDOESeg0Start' ||
        obj.key === 'GLDOESeg0End' ||
        obj.key === 'GLDOEDTId' ||
        obj.key === 'GLFYCGainAccountId' ||
        obj.key === 'GLFYCLossAccountId' ||
        obj.key === 'GLFYCSeg0Start' ||
        obj.key === 'GLFYCSeg0End' ||
        obj.key === 'GLFYCDTId' ||
        obj.key === 'GLFYCDOECheck'
      )
    })

    filteredList?.forEach(obj => {
      if (obj.key === 'GLFYCDOECheck') {
        myObject[obj.key] = obj.value === 'true' || obj.value === true
      } else if (
        obj.key === 'GLDOESeg0End' ||
        obj.key === 'GLDOESeg0Start' ||
        obj.key === 'GLFYCSeg0Start' ||
        obj.key === 'GLFYCSeg0End'
      ) {
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
        const response = await getRequest({
          extension: GeneralLedgerRepository.ChartOfAccounts.get,
          parameters: `_recordId=${myObject[key]}`
        })
        formik.setFieldValue(refField, response.record.accountRef)
        formik.setFieldValue(nameField, response.record.name)
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
                  formik.setFieldValue('GLDOEGainAccountId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('GLDOEGainAccountref', newValue ? newValue.accountRef : '')
                  formik.setFieldValue('GLDOEGainAccountname', newValue ? newValue.name : '')
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
                  formik.setFieldValue('GLDOELossAccountId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('GLDOELossAccountref', newValue ? newValue.accountRef : '')
                  formik.setFieldValue('GLDOELossAccountname', newValue ? newValue.name : '')
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
                  formik.setFieldValue('GLRoundingAccountDb', newValue ? newValue.recordId : '')
                  formik.setFieldValue('GLRoundingAccountDbref', newValue ? newValue.accountRef : '')
                  formik.setFieldValue('GLRoundingAccountDbname', newValue ? newValue.name : '')
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
                  formik.setFieldValue('GLRoundingAccountCr', newValue ? newValue.recordId : '')
                  formik.setFieldValue('GLRoundingAccountCrref', newValue ? newValue.accountRef : '')
                  formik.setFieldValue('GLRoundingAccountCrname', newValue ? newValue.name : '')
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
                  formik.setFieldValue('GLFYCGainAccountId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('GLFYCGainAccountref', newValue ? newValue.accountRef : '')
                  formik.setFieldValue('GLFYCGainAccountname', newValue ? newValue.name : '')
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
                  formik.setFieldValue('GLFYCLossAccountId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('GLFYCLossAccountref', newValue ? newValue.accountRef : '')
                  formik.setFieldValue('GLFYCLossAccountname', newValue ? newValue.name : '')
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
