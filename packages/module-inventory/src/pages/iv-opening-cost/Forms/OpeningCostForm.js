import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'

export default function OpeningCostForm({ labels, maxAccess, record, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.OpeningCost.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      itemId: null,
      itemName: '',
      year: null,
      periodId: null,
      avgCost: 0
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      year: yup.number().required(),
      itemId: yup.string().required(),
      periodId: yup.number().required(),
      avgCost: yup.number().min(0).max(999999999).required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: InventoryRepository.OpeningCost.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)

        formik.setValues({
          ...obj,
          recordId: String(obj.year) + String(obj.itemId) + String(obj.periodId)
        })
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (record?.itemId && record?.year && record?.periodId && recordId) {
        const res = await getRequest({
          extension: InventoryRepository.OpeningCost.get,
          parameters: `_itemId=${record?.itemId}&_fiscalYear=${record?.year}&_periodId=${record?.periodId}`
        })

        formik.setValues({
          ...res.record,
          recordId: String(res.record.year) + String(res.record.itemId) + String(res.record.periodId)
        })
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.InventoryOpeningCosts}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isInfo={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                readOnly={editMode}
                name='year'
                label={labels.fiscalYear}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('year', newValue?.fiscalYear || null)}
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
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('periodId', newValue?.periodId || null)}
                error={formik.touched.periodId && Boolean(formik.errors.periodId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={labels.sku}
                readOnly={editMode}
                valueField='recordId'
                displayField='sku'
                valueShow='sku'
                secondDisplayField={false}
                form={formik}
                columnsInDropDown={[
                  { key: 'sku', value: 'SKU' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={(_, newValue) => {
                  formik.setFieldValue('itemId', newValue?.recordId || '')
                  formik.setFieldValue('itemName', newValue?.name || '')
                  formik.setFieldValue('sku', newValue?.sku || '')
                }}
                maxAccess={maxAccess}
                required
                errorCheck={'itemId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='itemName'
                label={labels.item}
                value={formik.values.itemName}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='avgCost'
                label={labels.cost}
                value={formik.values.avgCost}
                onChange={formik.handleChange}
                maxLength={12}
                required
                decimalScale={3}
                onClear={() => formik.setFieldValue('avgCost', 0)}
                error={formik.touched.avgCost && Boolean(formik.errors.avgCost)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
