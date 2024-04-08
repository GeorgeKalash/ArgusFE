// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

import { SystemRepository } from 'src/repositories/SystemRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function ResourceGlobalForm ({
  labels,
  maxAccess,
  resourceName,
  resourceId,
  moduleId
})
{

    const [isLoading, setIsLoading] = useState(false)

    //const [editMode, setEditMode] = useState(!!recordId)

    const [initialValues, setInitialData] = useState({
      resourceId: resourceId,
      resourceName: resourceName,
      accessLevel: '',
      moduleId: moduleId,
      accessLevelName: ''
   })

    const { getRequest, postRequest } = useContext(RequestsContext)

    //const editMode = !!recordId

    const invalidate = useInvalidate({
        endpointId: SystemRepository.ModuleClassRES.qry
      })

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validateOnChange: true,
        validationSchema: yup.object({
          accessLevel: yup.string().required(' ')
        }),
        onSubmit: async obj => {
          console.log('data')
          console.log(obj)
          
          const response = await postRequest({
            extension: AccessControlRepository.AuthorizationResourceGlobal.set,
            record: JSON.stringify(obj)
          })

          toast.success('Record Edited Successfully')
          invalidate()
        }
      })

      console.log('formik')
      console.log(formik)

      useEffect(() => {
        ;(async function () {
          try {

            if (resourceId) {
              setIsLoading(true)

              const res = await getRequest({
                extension: AccessControlRepository.AuthorizationResourceGlobal.get,
                parameters: `_resourceId=${resourceId}`
              })
              console.log('data')
              console.log(res.record)
              if(res.record) setInitialData(res.record)
            }
          } catch (exception) {
            setErrorMessage(error)
          }
          setIsLoading(false)
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

    //editMode={editMode}
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
            formik && formik.setFieldValue('accessLevel', newValue?.key || '')
          }}
          error={formik.touched.accessLevel && Boolean(formik.errors.accessLevel)}
          editable = {false}

          //helperText={formik.touched.accessLevel && formik.errors.accessLevel}
        />
      </Grid>
    </Grid>
    </FormShell>
  )
}

