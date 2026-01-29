import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { SCRepository } from '@argus/repositories/src/repositories/SCRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function ItemProductionForm({ labels, editMode, maxAccess, store }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId, productionLevel } = store
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      itemId: recordId,
      lineId: '',
      spfId: '',
      ltId: '',
      classId: '',
      designName: '',
      designRef: '',
      designId: '',
      standardCost: '',
      standardId: '',
      cgId: '',
      rmcId: '',
      bomId: null,
      wipItemId: null,
      wipItemSku: '',
      wipItemName: ''
    },
    maxAccess,
    validateOnChange: true,
    onSubmit: async obj => {
      await postRequest({
        extension: InventoryRepository.ItemProduction.set,
        record: JSON.stringify({
          ...obj,
          itemId: recordId
        })
      })

      formik.setValues(obj)
      toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: InventoryRepository.ItemProduction.get,
          parameters: `_recordId=${recordId}`
        })

        if (res?.record) {
          const newValues = Object.keys(formik.initialValues).reduce((acc, key) => {
            acc[key] = res.record[key] !== null ? res.record[key] : formik.initialValues[key]

            return acc
          }, {})

          formik.setValues(newValues)
        }
      }
    })()
  }, [recordId])

  return (
    <FormShell
      resourceId={ResourceIds.Items}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
      isInfo={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionLine.qry}
                name='lineId'
                label={labels.productionLine}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('lineId', newValue?.recordId || '')
                  formik.setFieldValue('ltId', '')
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionClass.qry}
                values={formik.values}
                name='classId'
                label={labels.productionClass}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('classId', newValue?.recordId || '')
                }}
                error={formik.touched.classId && Boolean(formik.errors.classId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionStandard.qry}
                values={formik.values}
                name='standardId'
                label={labels.productionStandard}
                valueField='recordId'
                displayField='reference'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('standardId', newValue?.recordId || '')
                }}
                error={formik.touched.standardId && Boolean(formik.errors.standardId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.SerialsProfile.qry}
                values={formik.values}
                name='spfId'
                label={labels.sprofile}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('spfId', newValue?.recordId || '')
                }}
                error={formik.touched.spfId && Boolean(formik.errors.spfId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={ManufacturingRepository.Design.snapshot}
                valueField='reference'
                displayField='name'
                name='designId'
                label={labels.design}
                form={formik}
                secondDisplayField={true}
                firstValue={formik.values.designRef}
                secondValue={formik.values.designName}
                errorCheck={'designId'}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('designId', newValue?.recordId || '')
                  formik.setFieldValue('designRef', newValue?.reference || '')
                  formik.setFieldValue('designName', newValue?.name || '')
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='standardCost'
                label={labels.standardCost}
                value={formik.values.standardCost}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('standardCost', '')}
                error={formik.touched.grossWgt && Boolean(formik.errors.grossWgt)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.CostGroup.qry}
                name='cgId'
                label={labels.cg}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('cgId', newValue?.recordId)
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SCRepository.LabelTemplate.qry}
                name='ltId'
                label={labels.template}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('ltId', newValue ? newValue.recordId : '')
                }}
                error={formik.touched.ltId && Boolean(formik.errors.ltId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.RawMaterialCategory.qry}
                name='rmcId'
                label={labels.rmc}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('rmcId', newValue?.recordId)
                }}
                error={formik.touched.rmcId && Boolean(formik.errors.rmcId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={formik.values.itemId && ManufacturingRepository.BillOfMaterials.qry2}
                parameters={`_itemId=${formik?.values?.itemId}`}
                name='bomId'
                label={labels.bom}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('bomId', newValue?.recordId || '')
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot3}
                parameters={{
                  _productionLevel: 4
                }}
                name='wipItemId'
                label={labels.wipItem}
                valueField='sku'
                displayField='name'
                valueShow='wipItemSku'
                secondValueShow='wipItemName'
                form={formik}
                readOnly={productionLevel == 4}
                onChange={(_, newValue) => {
                  formik.setFieldValue('wipItemSku', newValue?.sku || null)
                  formik.setFieldValue('wipItemName', newValue?.name || '')
                  formik.setFieldValue('wipItemId', newValue?.recordId || '')
                }}
                errorCheck={'wipItemId'}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
