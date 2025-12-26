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
import { CurrencyTradingSettingsRepository } from '@argus/repositories/src/repositories/CurrencyTradingSettingsRepository'

export default function PurposeOfExchangeGroupForm({ labels, recordId, maxAccess }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: CurrencyTradingSettingsRepository.PurposeExchangeGroup.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      flName: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: CurrencyTradingSettingsRepository.PurposeExchangeGroup.set,
        record: JSON.stringify(obj)
      })

      !obj.recordId && formik.setFieldValue('recordId', response.recordId)
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: CurrencyTradingSettingsRepository.PurposeExchangeGroup.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.PurposeExchangeGroup} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxLength='30'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='flName'
                label={labels.flName}
                value={formik.values.flName}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('flName', '')}
                error={formik.touched.flName && Boolean(formik.errors.flName)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
