import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function MetalsForm({ labels, maxAccess, setStore, store }) {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Metals.page
  })

  const { formik } = useForm({
    initialValues: { recordId: store.recordId, reference: '', purity: '', reportingPurity: '', currencyId: null },
    maxAccess,
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
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: InventoryRepository.Metals.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Metals} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                maxLength='10'
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
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
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
