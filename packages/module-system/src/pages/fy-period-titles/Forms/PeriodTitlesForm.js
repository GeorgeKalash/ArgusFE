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
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function PeriodTitlesForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.FiscalPeriod.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      periodId: null,
      name: ''
    },
    maxAccess,
    validationSchema: yup.object({
      periodId: yup.number().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: SystemRepository.FiscalPeriod.set,
        record: JSON.stringify(obj)
      })
      formik.setFieldValue('recordId', obj.periodId)
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })
  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SystemRepository.FiscalPeriod.get,
          parameters: `_periodId=${recordId}`
        })
        formik.setValues({
          ...res.record,
          recordId: res.record.periodId
        })
      }
    })()
  }, [])
  const editMode = !!formik.values.recordId

  return (
    <FormShell resourceId={ResourceIds.FiscalPeriod} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomNumberField
                name='periodId'
                label={labels.periodId}
                value={formik.values.periodId}
                required
                maxLength={5}
                decimalScale={0}
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('periodId', null)}
                error={formik.touched.periodId && Boolean(formik.errors.periodId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values?.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
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
