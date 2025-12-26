import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { CurrencyTradingSettingsRepository } from '@argus/repositories/src/repositories/CurrencyTradingSettingsRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function RelationTypesForm({ labels, maxAccess, recordId, setStore }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: CurrencyTradingSettingsRepository.RelationType.page
  })

  const formik = useFormik({
    initialValues: {
      recordId: null,
      reference: '',
      name: '',
      flName: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required(),
      flName: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: CurrencyTradingSettingsRepository.RelationType.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        setStore({
          recordId: response.recordId,
          name: obj.name
        })
        formik.setFieldValue('recordId', response.recordId)
      }
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: CurrencyTradingSettingsRepository.RelationType.get,
          parameters: `_recordId=${recordId}`
        })
        setStore({
          recordId: res.record.recordId,
          name: res.record.name
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.RelationType} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            required
            maxAccess={maxAccess}
            maxLength='30'
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
            rows={2}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='flName'
            label={labels.flName}
            value={formik.values.flName}
            required
            maxLength='50'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('flName', '')}
            error={formik.touched.flName && Boolean(formik.errors.flName)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
