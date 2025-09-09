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
import { PayrollRepository } from 'src/repositories/PayrollRepository'

export default function PayCodesForm({ labels, recordId, maxAccess, window }) {
  const { platformLabels } = useContext(ControlContext)
  const { postRequest, getRequest } = useContext(RequestsContext)

  const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: PayrollRepository.Paycode.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      name: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      recordId: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const data = { ...obj, payCode: obj.recordId }
      await postRequest({
        extension: PayrollRepository.Paycode.set,
        record: JSON.stringify(data)
      })

      toast.success(!obj?.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
      window.close()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: PayrollRepository.Paycode.get,
          parameters: `_payCode=${recordId}`
        })

        formik.setValues({
          ...res.record,
          recordId: res.record.payCode
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.PayCode} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='recordId'
                label={labels.PayCode}
                value={formik.values.recordId}
                readOnly={editMode}
                maxLength='10'
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('recordId', '')}
                error={formik.touched.recordId && formik.errors.recordId}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                maxLength='30'
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
