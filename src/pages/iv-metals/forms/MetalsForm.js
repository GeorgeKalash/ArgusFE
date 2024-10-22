import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ControlContext } from 'src/providers/ControlContext'

export default function MetalsForm({ labels, maxAccess, setStore, store }) {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Metals.page
  })

  const { formik } = useForm({
    initialValues: { recordId: store.recordId, reference: '', purity: '', reportingPurity: '', currencyId: '' },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      purity: yup
        .number()
        .nullable()
        .test('is-valid-purity', function (value) {
          if (value >= 0.001 && value <= 1) return true

          return false
        }),
      reportingPurity: yup
        .number()
        .nullable()
        .test('is-valid-reportingPurity', function (value) {
          if ((!value && value !== 0) || (value >= 0.001 && value <= 1)) return true

          return false
        })
    }),

    onSubmit: async obj => {
      try {
        const response = await postRequest({
          extension: InventoryRepository.Metals.set,
          record: JSON.stringify(obj)
        })
        if (!obj.recordId) {
          setStore(prevStore => ({
            ...prevStore,
            recordId: response.recordId
          }))
          toast.success(platformLabels.Added)
          formik.setFieldValue('recordId', response.recordId)
        } else toast.success(platformLabels.Edited)

        invalidate()
      } catch (e) {}
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: InventoryRepository.Metals.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Metals} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                maxLength='3'
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='purity'
                label={labels.purity}
                value={formik.values.purity}
                required
                maxAccess={maxAccess}
                readOnly={editMode}
                maxLength={6}
                decimalScale={5}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('purity', '')}
                error={formik.touched.purity && Boolean(formik.errors.purity)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField='reference'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.key)
                }}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='reportingPurity'
                label={labels.reportingPurity}
                value={formik.values.reportingPurity}
                maxAccess={maxAccess}
                allowNegative={false}
                maxLength={6}
                decimalScale={5}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reportingPurity', '')}
                error={formik.touched.purity && Boolean(formik.errors.reportingPurity)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
