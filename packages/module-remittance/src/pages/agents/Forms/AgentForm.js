import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const AgentForm = ({ labels, maxAccess, recordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.CorrespondentAgents.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      countryId: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      countryId: yup.string().required()
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: RemittanceSettingsRepository.CorrespondentAgents.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RemittanceSettingsRepository.CorrespondentAgents.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.CorrespondentAgents} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxLength='50'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='countryId'
                label={labels.country}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('countryId', newValue?.recordId)
                }}
                error={formik.touched.countryId && Boolean(formik.errors.countryId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default AgentForm
