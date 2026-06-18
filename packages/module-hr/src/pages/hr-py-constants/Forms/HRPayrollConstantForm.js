import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function HRPayrollConstantForm({ labels, maxAccess, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: PayrollRepository.PayrollConstant.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      value: null,
      reference: ''
    },
    maxAccess,
    validationSchema: yup.object({
      value: yup.number().required(),
      reference: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: PayrollRepository.PayrollConstant.set,
        record: JSON.stringify(obj)
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      window.close()
      
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId 

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: PayrollRepository.PayrollConstant.get,
          parameters: `_reference=${recordId}`
        })

        formik.setValues({
          ...res.record,
          recordId
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.PayrollConstant} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                preventSpace
                maxLength='15'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='value'
                label={labels.value}
                value={formik.values.value}
                onChange={formik.handleChange}
                decimalScale={5}
                maxLength={18}
                required
                onClear={() => formik.setFieldValue('value', null)}
                error={formik.touched.value && Boolean(formik.errors.value)}
                maxAccess={maxAccess}
            />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
