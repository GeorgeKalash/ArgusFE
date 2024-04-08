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

import { SystemRepository } from 'src/repositories/SystemRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function AccessLevelForm ({
  labels,
  maxAccess,
  data,
  moduleId
})
{

    const [isLoading, setIsLoading] = useState(false)

    const [initialValues, setInitialData] = useState({
      accessLevel: '',
      accessLevelName: ''
   })

    const { getRequest, postRequest } = useContext(RequestsContext)

    const invalidate = useInvalidate({
        endpointId: SystemRepository.ModuleClassRES.qry
      })

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validateOnChange: true,
        validationSchema: yup.object({
          //accessLevel: yup.string().required('')

        }),
        onSubmit: async obj => {

          const updatedData = data.list.map(item => ({
                moduleId:moduleId,
                resourceId: item.key,
                accessLevel: obj.accessLevel
            })
          )

          updatedData.forEach(item => {
            item.accessLevel != "" ? item.accessLevel = item.accessLevel : item.accessLevel = 0
            postRequest({
              extension: AccessControlRepository.AuthorizationResourceGlobal.set,
              record: JSON.stringify(item)
            })
          });

          toast.success('Record Edited Successfully')
          invalidate()
        }
      })

      useEffect(() => {
        ;(async function () {
          try {

            setIsLoading(true)

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
    >
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <ResourceComboBox
          datasetId={DataSets.ACCESS_LEVEL}
          name='accessLevel'
          label={labels.accessLevel}
          valueField='key'
          displayField='value'
          values={formik.values}
          
          maxAccess={maxAccess}
          onChange={(event, newValue) => {
            formik && formik.setFieldValue('accessLevel', newValue?.key)
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

