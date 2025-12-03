import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'

export default function PayCodesForm({ labels, recordId, maxAccess, window }) {
  const { platformLabels } = useContext(ControlContext)
  const { postRequest, getRequest } = useContext(RequestsContext)

  const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: PayrollRepository.Paycode.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      payCode: null,
      name: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      payCode: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: PayrollRepository.Paycode.set,
        record: JSON.stringify(obj)
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
                name='payCode'
                label={labels.PayCode}
                value={formik.values.payCode}
                readOnly={editMode}
                maxLength='10'
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('payCode', '')}
                error={formik.touched.payCode && formik.errors.payCode}
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
