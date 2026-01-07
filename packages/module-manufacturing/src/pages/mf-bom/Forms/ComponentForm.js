import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function ComponentForm({
  labels,
  maxAccess,
  recordId,
  seqNo,
  bomId,
  msId,
  components,
  calculateCostPct,
  window
}) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({ endpointId: ManufacturingRepository.Component.qry })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: recordId || null,
      costTypeId: null,
      bomId,
      itemId: null,
      qty: null,
      muId: null,
      muQty: null,
      msId,
      currentCost: 0,
      seqNo,
      variationLimit: null
    },
    validateOnChange: false,
    validationSchema: yup.object({
      itemId: yup.number().required(),
      qty: yup.number().required().moreThan(0)
    }),
    onSubmit: obj => {
      const newComponent = {
        ...obj,
        baseQty: obj?.baseQty || (obj?.muId ? obj.qty * obj.muQty : obj.qty)
      }

      const existingIndex = components.findIndex(c => c.seqNo === newComponent.seqNo)

      let updatedComponents
      if (existingIndex !== -1) {
        updatedComponents = components.map((c, i) => (i === existingIndex ? newComponent : c))
      } else {
        updatedComponents = [...components, newComponent]
      }

      updatedComponents = calculateCostPct(updatedComponents)

      postRequest({
        extension: ManufacturingRepository.Component.set2,
        record: JSON.stringify({ components: updatedComponents, bomId })
      }).then(res => {
        toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
        formik.setFieldValue('recordId', res.recordId)

        invalidate()
        window.close()
      })
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: ManufacturingRepository.Component.get,
          parameters: `_bomId=${recordId}&_seqNo=${seqNo}`
        })

        const unitCost = res.record?.itemId && (await getUnitCost(res.record?.itemId))

        formik.setValues({
          ...res.record,
          currentCost: unitCost ?? 0
        })
      }
    })()
  }, [])

  const getUnitCost = async itemId => {
    if (itemId) {
      const res = await getRequest({
        extension: InventoryRepository.CurrentCost.get,
        parameters: `_itemId=${itemId}`
      })

      return res?.record?.currentCost
    }
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                autoFocus={!editMode}
                label={labels?.sku}
                valueField='recordId'
                displayField='sku'
                valueShow='sku'
                secondValueShow='itemName'
                form={formik}
                columnsInDropDown={[
                  { key: 'sku', value: 'SKU' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('itemId', newValue?.recordId || null)
                  formik.setFieldValue('itemName', newValue?.name)
                  formik.setFieldValue('sku', newValue?.sku)
                  formik.setFieldValue('msId', newValue?.msId)
                  const unitCost = (await getUnitCost(newValue?.recordId)) ?? 0
                  formik.setFieldValue('currentCost', unitCost)
                }}
                maxAccess={maxAccess}
                errorCheck={'itemId'}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.MeasurementUnit.qry}
                parameters={formik?.values?.msId ? `_msId=${formik?.values?.msId}` : ''}
                name='muId'
                readOnly={!formik?.values?.msId}
                label={labels.measurementUnit}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('muId', newValue?.recordId || null)
                  formik.setFieldValue('muQty', newValue?.qty || null)
                }}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                label={labels.site}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue?.recordId || null)
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='qty'
                required
                label={labels.qty}
                value={formik?.values?.qty}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('qty', 0)}
                error={formik.touched.qty && Boolean(formik.errors.qty)}
                decimalScale={4}
                allowNegative={false}
                maxLength={11}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='variationLimit'
                label={labels.variationLimit}
                value={formik?.values?.variationLimit}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                decimalScale={2}
                maxLength={5}
                onClear={() => formik.setFieldValue('variationLimit', 0)}
                error={formik.touched.variationLimit && Boolean(formik.errors.variationLimit)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='currentCost'
                label={labels.currentCost}
                value={formik?.values?.currentCost}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
