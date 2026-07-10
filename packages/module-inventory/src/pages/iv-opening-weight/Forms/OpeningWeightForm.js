import { Grid } from '@mui/material'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function OpeningWeightForm({ labels, maxAccess, record, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.OpeningWeight.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      year: null,
      periodId: null,
      itemId: null,
      sku: '',
      itemName: '',
      avgWeight: null
    },
    maxAccess,
    validationSchema: yup.object({
      year: yup.number().required(),
      periodId: yup.number().required(),
      itemId: yup.number().required(),
      avgWeight: yup.number().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: InventoryRepository.OpeningWeight.set,
        record: JSON.stringify(obj)
      })

      toast.success(recordId ? platformLabels.Edited : platformLabels.Added)
      invalidate()
      window.close()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (record && record.year && record.periodId && record.itemId && recordId) {
        const res = await getRequest({
          extension: InventoryRepository.OpeningWeight.get,
          parameters: `_year=${record.year}&_periodId=${record.periodId}&_itemId=${record.itemId}`
        })
        formik.setValues({
          ...res.record,
          recordId
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.OpeningWeight} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='year'
                label={labels.fiscalYear}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('year', newValue?.fiscalYear || null)
                }}
                error={formik.touched.year && Boolean(formik.errors.year)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalPeriod.qry}
                name='periodId'
                label={labels.fiscalPeriod}
                valueField='periodId'
                displayField='name'
                values={formik.values}
                readOnly={editMode}
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('periodId', newValue?.periodId || null)}
                error={formik.touched.periodId && Boolean(formik.errors.periodId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={labels.item}
                valueField='sku'
                displayField='name'
                valueShow='sku'
                secondValueShow='itemName'
                form={formik}
                required
                readOnly={editMode}
                displayFieldWidth={2}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('sku', newValue?.sku || '')
                  formik.setFieldValue('itemName', newValue?.name || '')
                  
                  formik.setFieldValue('itemId', newValue?.recordId || null)
                }}
                error={formik.touched.itemId && Boolean(formik.errors.itemId)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='avgWeight'
                label={labels.avgWeight}
                value={formik.values.avgWeight}
                required
                decimalScale={3}
                maxLength={13}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('avgWeight', null)}
                error={formik.touched.avgWeight && Boolean(formik.errors.avgWeight)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}