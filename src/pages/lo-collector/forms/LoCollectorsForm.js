// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'

export default function LoCollectorsForms({ labels, maxAccess, recordId }) {
  const [editMode, setEditMode] = useState(!!recordId)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: LogisticsRepository.LoCollector.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      name: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(' '),
      name: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: LogisticsRepository.LoCollector.set,
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
            extension: LogisticsRepository.LoCollector.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.LoCollectors} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                maxAccess={maxAccess}
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
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='30'
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
