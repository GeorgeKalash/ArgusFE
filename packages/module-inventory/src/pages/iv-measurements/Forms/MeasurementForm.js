import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function MeasurementForm({ labels, maxAccess, setStore, store }) {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const editMode = !!store.recordId

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Measurement.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: '',
      reference: '',
      name: '',
      type: 0,
      decimals: 0,
      serialItems: false
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required(),
      decimals: yup.number().required().min(0).max(5)
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: InventoryRepository.Measurement.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        setStore(prevStore => ({
          ...prevStore,
          recordId: response.recordId,
          decimals: formik.values.decimals
        }))
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: InventoryRepository.Measurement.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
        setStore(prevStore => ({
          ...prevStore,
          decimals: res.record.decimals
        }))
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Measurement} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                maxAccess={maxAccess}
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
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='serialItems'
                value={formik.values?.serialItems}
                onChange={event => formik.setFieldValue('serialItems', event.target.checked)}
                label={labels.serialItem}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='decimals'
                label={labels.decimals}
                value={formik.values.decimals}
                decimalScale={0}
                required
                allowNegative={false}
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('decimals', e.target.value)}
                onClear={() => formik.setFieldValue('decimals', 0)}
                error={formik.touched.decimals && Boolean(formik.errors.decimals)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
