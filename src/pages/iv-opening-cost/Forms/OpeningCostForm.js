import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'

export default function OpeningCostForm({ labels, maxAccess, recordId, record }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.OpeningCost.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      itemId: null,
      year: '',
      avgCost: 0
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      year: yup.string().required(),
      itemId: yup.string().required(),
      avgCost: yup.number().min(0).max(999999999)
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: InventoryRepository.OpeningCost.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)

        formik.setValues({
          ...obj,
          recordId: String(obj.year) + String(obj.itemId)
        })
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (record && record?.itemId && record?.year && recordId) {
        const res = await getRequest({
          extension: InventoryRepository.OpeningCost.get,
          parameters: `_itemId=${record?.itemId}&_fiscalYear=${record?.year}`
        })

        formik.setValues({
          ...res.record,
          recordId: String(res.record.year) + String(res.record.itemId)
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.InventoryOpeningCosts} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
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
                onChange={(event, newValue) => {
                  formik.setFieldValue('year', newValue?.fiscalYear)
                }}
                error={formik.touched.year && Boolean(formik.errors.year)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={labels?.sku}
                readOnly={editMode}
                valueField='recordId'
                displayField='sku'
                valueShow='sku'
                form={formik}
                columnsInDropDown={[
                  { key: 'sku', value: 'SKU' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={(event, newValue) => {
                  formik.setFieldValue('itemId', newValue?.recordId)
                  formik.setFieldValue('itemName', newValue?.name)
                  formik.setFieldValue('sku', newValue?.sku)
                }}
                maxAccess={maxAccess}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='itemName'
                label={labels.name}
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
                decimalScale={3}
                onClear={() => formik.setFieldValue('avgCost', '')}
                error={formik.touched.avgCost && Boolean(formik.errors.avgCost)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
