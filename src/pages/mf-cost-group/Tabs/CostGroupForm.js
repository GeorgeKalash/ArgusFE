import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'

export default function CostGroupForm({ labels, access: maxAccess, setStore, store }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.CostGroup.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      name: '',
      reference: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: ManufacturingRepository.CostGroup.set,
        record: JSON.stringify(obj)
      })

      toast.success(recordId ? platformLabels.Edited : platformLabels.Added)
      refetchForm(res?.recordId)
      invalidate()
    }
  })
  const editMode = formik.values.recordId

  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: ManufacturingRepository.CostGroup.get,
      parameters: `_recordId=${recordId}`
    })

    formik.setValues(res?.record)

    setStore(prevStore => ({
      ...prevStore,
      recordId: res?.record?.recordId
    }))
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) refetchForm(recordId)
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.CostGroup} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.reference}
                maxAccess={maxAccess}
                required
                maxLength='10'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik?.values?.name}
                maxAccess={maxAccess}
                required
                maxLength='40'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
