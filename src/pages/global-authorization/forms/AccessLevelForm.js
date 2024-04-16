// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useState } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { useForm } from 'src/hooks/form.js'

import { SystemRepository } from 'src/repositories/SystemRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function AccessLevelForm({ labels, maxAccess, data, moduleId }) {
  const [initialValues, setInitialData] = useState({
    accessLevel: '',
    accessLevelName: ''
  })

  const { postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.ModuleClassRES.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async obj => {
      const updatedData = data.list.map(item => ({
        moduleId: moduleId,
        resourceId: item.key,
        accessLevel: obj.accessLevel
      }))

      updatedData.forEach(async item => {
        item.accessLevel = item.accessLevel || 0
        await postRequest({
          extension: AccessControlRepository.AuthorizationResourceGlobal.set,
          record: JSON.stringify(item)
        })
      })

      toast.success('Record Edited Successfully')
      invalidate()
    }
  })

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
              formik.setFieldValue('accessLevel', newValue?.key)
            }}
            error={formik.touched.accessLevel && Boolean(formik.errors.accessLevel)}
            editable={false}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
