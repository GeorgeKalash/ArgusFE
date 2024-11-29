import { useEffect, useState, useContext } from 'react'
import { Grid } from '@mui/material'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
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

const SystemParamsForm = ({ _labels, access }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
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
      GLFYCLossAccountname: ''
    },
    onSubmit: values => {
      postSystemParams(values)
    }
  })

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const myObject = {}

    const filteredList = defaultsData?.list?.filter(obj => {
      return (
        obj.key === 'GLDOEGainAccountId' ||
        obj.key === 'GLDOELossAccountId' ||
        obj.key === 'GLRoundingAccountDb' ||
        obj.key === 'GLRoundingAccountCr' ||
        obj.key === 'GLDOESeg0Start' ||
        obj.key === 'GLDOESeg0End' ||
        obj.key === 'GLDOEGainAccountname' ||
        obj.key === 'GLDOEGainAccountref' ||
        obj.key === 'GLDOELossAccountname' ||
        obj.key === 'GLDOELossAccountref' ||
        obj.key === 'GLRoundingAccountDbref' ||
        obj.key === 'GLRoundingAccountDbname' ||
        obj.key === 'GLDOEDTId' ||
        obj.key === 'GLRoundingAccountCrref' ||
        obj.key === 'GLRoundingAccountCrname' ||
        obj.key === 'GLFYCGainAccountId' ||
        obj.key === 'GLFYCGainAccountname' ||
        obj.key === 'GLFYCGainAccountref' ||
        obj.key === 'GLFYCLossAccountId' ||
        obj.key === 'GLFYCLossAccountref' ||
        obj.key === 'GLFYCLossAccountname'
      )
    })
    filteredList?.forEach(obj => {
      if (
        obj.key === 'GLDOESeg0End' ||
        obj.key === 'GLDOESeg0Start' ||
        obj.key === 'GLDOEGainAccountname' ||
        obj.key === 'GLDOEGainAccountref' ||
        obj.key === 'GLDOELossAccountref' ||
        obj.key === 'GLDOELossAccountname' ||
        obj.key === 'GLRoundingAccountDbref' ||
        obj.key === 'GLRoundingAccountDbname' ||
        obj.key === 'GLRoundingAccountCrref' ||
        obj.key === 'GLRoundingAccountCrname' ||
        obj.key === 'GLFYCGainAccountname' ||
        obj.key === 'GLFYCGainAccountref' ||
        obj.key === 'GLFYCLossAccountref' ||
        obj.key === 'GLFYCLossAccountname'
      ) {
        myObject[obj.key] = obj.value || null
      } else {
        myObject[obj.key] = obj.value ? parseInt(obj.value, 10) : null
      }
    })
    formik.setValues(myObject)
  }

  console.log(formik.values, 'aaaaaaaaaaa')

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
                label={'1'}
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
                label={'2'}
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
                label={'3'}
                form={formik}
                required
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
                label={'3'}
                form={formik}
                required
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
                label={'5'}
                value={formik.values.GLDOESeg0Start}
                error={formik.touched.GLDOESeg0Start && Boolean(formik.errors.GLDOESeg0Start)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                onClear={() => formik.setFieldValue('GLDOESeg0End', '')}
                name='GLDOESeg0End'
                onChange={formik.handleChange}
                label={'6'}
                value={formik.values.GLDOESeg0End}
                error={formik.touched.GLDOESeg0End && Boolean(formik.errors.GLDOESeg0End)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${SystemFunction.JournalVoucher}&_startAt=${0}&_pageSize=${50}`}
                name='GLDOEDTId'
                label={'7'}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('GLDOEDTId', newValue?.recordId)
                  changeDT(newValue)
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
                label={'8'}
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
                error={formik.touched.GLRoundingAccountCr && Boolean(formik.errors.GLRoundingAccountCr)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={GeneralLedgerRepository.ChartOfAccounts.snapshot}
                valueField='accountRef'
                displayField='name'
                name='GLFYCLossAccountId'
                label={'9'}
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
                error={formik.touched.GLRoundingAccountCr && Boolean(formik.errors.GLRoundingAccountCr)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SystemParamsForm
