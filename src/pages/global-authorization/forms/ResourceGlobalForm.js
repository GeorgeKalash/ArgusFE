// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { useForm } from 'src/hooks/form.js'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

import { SystemRepository } from 'src/repositories/SystemRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function ResourceGlobalForm({ labels, maxAccess, resourceName, resourceId, moduleId }) {
  const [initialValues, setInitialData] = useState({
    resourceId: resourceId,
    resourceName: resourceName,
    accessLevel: '',
    moduleId: moduleId,
    accessLevelName: ''
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.ModuleClassRES.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      accessLevel: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: AccessControlRepository.AuthorizationResourceGlobal.set,
        record: JSON.stringify(obj)
      })

      toast.success('Record Edited Successfully')
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (resourceId) {
        const res = await getRequest({
          extension: AccessControlRepository.AuthorizationResourceGlobal.get,
          parameters: `_resourceId=${resourceId}`
        })
        if (res.record) setInitialData(res.record)
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.GlobalAuthorization}
      form={formik}
      height={400}
      maxAccess={maxAccess}
      isInfo={false}
      isCleared={false}
    >
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='resourceId'
            label={labels.resourceId}
            value={resourceId}
            required
            onChange={formik.handleChange}
            maxAccess={maxAccess}
            readOnly={true}
            onClear={() => formik.setFieldValue('resourceId', '')}
            error={formik.touched.resourceId && Boolean(formik.errors.resourceId)}
            helperText={formik.touched.resourceId && formik.errors.resourceId}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='resourceName'
            label={labels.resourceName}
            value={resourceName}
            required
            readOnly={true}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('resourceName', '')}
            error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
            helperText={formik.touched.resourceName && formik.errors.resourceName}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.ACCESS_LEVEL}
            name='accessLevel'
            label={labels.accessLevel}
            valueField='key'
            displayField='value'
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('accessLevel', newValue?.key || '')
            }}
            error={formik.touched.accessLevel && Boolean(formik.errors.accessLevel)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
