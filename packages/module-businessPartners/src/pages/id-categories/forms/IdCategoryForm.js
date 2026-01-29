import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { BusinessPartnerRepository } from '@argus/repositories/src/repositories/BusinessPartnerRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function IdCategoryForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: BusinessPartnerRepository.CategoryID.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      org: false,
      person: false,
      group: false,
      isUnique: false
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: BusinessPartnerRepository.CategoryID.set,
        record: JSON.stringify(obj)
      })

      !obj.recordId &&
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: BusinessPartnerRepository.CategoryID.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.IdCategories} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                rows={2}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='org'
                value={formik.values?.org}
                onChange={event => formik.setFieldValue('org', event.target.checked)}
                label={labels.organization}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='person'
                value={formik.values?.person}
                onChange={event => formik.setFieldValue('person', event.target.checked)}
                label={labels.person}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='group'
                value={formik.values?.group}
                onChange={event => formik.setFieldValue('group', event.target.checked)}
                label={labels.group}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isUnique'
                value={formik.values?.isUnique}
                onChange={event => formik.setFieldValue('isUnique', event.target.checked)}
                label={labels.unique}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
