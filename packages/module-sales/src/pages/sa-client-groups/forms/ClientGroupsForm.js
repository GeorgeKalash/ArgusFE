import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'

export default function ClientGroupsForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.ClientGroups.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      reference: '',
      nraId: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: SaleRepository.ClientGroups.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId
  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SaleRepository.ClientGroups.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.ClientGroups} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SystemRepository.NumberRange.snapshot}
                form={formik}
                valueField='reference'
                displayField='description'
                name='nraRef'
                label={labels.numberRange}
                secondDisplayField={true}
                secondValue={formik.values.nraDescription}
                onChange={(event, newValue) => {
                  const { recordId, reference, description } = newValue || {}
                  formik.setValues({
                    ...formik.values,
                    nraId: recordId || null,
                    nraRef: reference || '',
                    nraDescription: description || ''
                  })
                }}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
