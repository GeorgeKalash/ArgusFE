import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

export default function PriceLevelsForm({ labels, maxAccess, recordId }) {
  const [editMode, setEditMode] = useState(!!recordId)
  const { getRequest, postRequest } = useContext(RequestsContext)

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
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: SaleRepository.PriceLevel.set,
        record: JSON.stringify(obj)
      })
      if (!recordId) {
        toast.success('Record Added Successfully')
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success('Record Edited Successfully')
      setEditMode(true)
      invalidate()
    }
  })
  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: SaleRepository.PriceLevel.get,
            parameters: `_recordId=${recordId}`
          })
          formik.setValues(res.record)
        }
      } catch (e) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.PriceLevels} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
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
