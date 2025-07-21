import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'

export default function TerminationForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.TerminationReasons.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      penaltyStatus: null
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      penaltyStatus: yup.number().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: EmployeeRepository.TerminationReasons.set,
        record: JSON.stringify(obj)
      })

      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)

      if (!obj.recordId) {
        formik?.setFieldValue('recordId', response.recordId)
      }
      invalidate()
    }
  })

  const editMode = !!formik?.values?.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: EmployeeRepository.TerminationReasons.get,
          parameters: `_recordId=${recordId}`
        })
        formik?.setValues(res?.record)
      }
    })()
  }, [recordId])

  return (
    <FormShell resourceId={ResourceIds.TerminationReasons} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels?.Name}
                value={formik?.values?.name ?? ''}
                required
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik?.handleChange}
                onClear={() => formik?.setFieldValue('name', '')}
                error={formik?.touched?.name && Boolean(formik?.errors?.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.PENALTY_STATUS}
                name='penaltyStatus'
                required
                label={labels?.penaltyStatus}
                valueField='key'
                displayField='value'
                values={formik?.values || {}}
                onChange={(event, newValue) => {
                  formik?.setFieldValue('penaltyStatus', newValue?.key || null)
                }}
                maxAccess={maxAccess}
                error={formik?.touched?.penaltyStatus && Boolean(formik?.errors?.penaltyStatus)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
