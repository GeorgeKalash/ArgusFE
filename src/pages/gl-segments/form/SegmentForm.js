import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'

export default function SegmentForm({ labels, obj, maxAccess, formikSegmentId, fetchGridData }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: GeneralLedgerRepository.Segments.qry
  })

  const { formik } = useForm({
    initialValues: {
      name: '',
      reference: '',
      segmentId: null
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,

    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required()
    }),
    onSubmit: async obj => {
      if (!obj.segmentId) {
        obj.segmentId = formikSegmentId
      }

      await postRequest({
        extension: GeneralLedgerRepository.Segments.set,
        record: JSON.stringify(obj)
      })

      if (!obj.segmentId) {
        toast.success(platformLabels.Added)
        formik.setValues(obj)
      } else {
        toast.success(platformLabels.Edited)
      }

      invalidate()
      fetchGridData()
    }
  })

  const editMode = !!formik.values.segmentId

  useEffect(() => {
    ;(async function () {
      if (obj) {
        const res = await getRequest({
          extension: GeneralLedgerRepository.Segments.get,
          parameters: `_segmentId=${obj.segmentId}&_reference=${obj.reference}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.Segments}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
      infoVisible={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && formik.errors.reference}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && formik.errors.name}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
