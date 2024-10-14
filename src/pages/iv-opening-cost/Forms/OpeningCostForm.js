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
      cost: 0
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
        year: yup.string().required(),
        itemId: yup.string().required(),
        cost: yup.number().min(0).max(999999999),
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
      if (record && record.itemId && record.year && recordId) {
        const res = await getRequest({
          extension: InventoryRepository.OpeningCost.get,
          parameters: `_itemId=${record.itemId}&_year=${year}`
        })

        formik.setValues({
          ...res.record,
          cashAccountId: formik.values.cashAccountId,

          recordId:
            String(res.record.year) +
            String(res.record.itemId)
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
                secondValueShow='itemName'
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
              <CustomNumberField
                name='cost'
                label={labels.cost}
                value={formik.values.cost}
                onChange={formik.handleChange}
                maxLength={999999999}
                decimalScale={3}
                onClear={() => formik.setFieldValue('cost', '')}
                error={formik.touched.cost && Boolean(formik.errors.cost)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
