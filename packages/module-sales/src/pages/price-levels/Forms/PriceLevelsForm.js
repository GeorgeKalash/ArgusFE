import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function PriceLevelsForm({ labels, maxAccess, recordId }) {
  const [editMode, setEditMode] = useState(!!recordId)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.PriceLevel.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: null,
      name: ''
    },
    maxAccess: maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: SaleRepository.PriceLevel.set,
        record: JSON.stringify(obj)
      })
      if (!obj.recordId) {
        formik.setFieldValue('recordId', response.recordId)
        setEditMode(true)
      }
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })
  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SaleRepository.PriceLevel.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.PriceLevels} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                type='text'
                label={labels.reference}
                value={formik.values.reference}
                required
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('reference', e.target.value)}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                maxLength={10}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                type='text'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('name', e.target.value)}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                maxLength={30}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
