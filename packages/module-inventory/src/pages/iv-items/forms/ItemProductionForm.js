import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'

export default function ItemProductionForm({ labels, editMode, maxAccess, store }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId, productionLevel, itemProduction, itemRawMaterials } = store
  const { platformLabels } = useContext(ControlContext)

  const conditions = {
    workcenterId: row => row?.workcenterId,
    operationId: row => row?.operationId,
    rmItemSku: row => row?.rmItemSku,
    designQty: row => row?.designQty,
    designPcs: row => row?.designPcs && Number(row.designPcs) <= 2147483647
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    initialValues: {
      header: {
        itemId: recordId,
        lineId: null,
        spfId: null,
        ltId: null,
        classId: null,
        designName: '',
        designRef: '',
        designId: null,
        standardCost: '',
        standardId: null,
        cgId: null,
        rmcId: null,
        bomId: null,
        wipItemId: null,
        wipItemSku: '',
        wipItemName: '',
        routingId: null,
        routingRef: '',
        routingName: ''
      },
      items: [
        {
          id: 1,
          workcenterId: null,
          designId: recordId,
          operationId: null,
          rmSeqNo: 1,
          itemId: null,
          designQty: null,
          designPcs: null
        }
      ]
    },
    conditionSchema: ['items'],
    maxAccess,
    validationSchema: yup.object({
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const modifiedItems = obj?.items
        .map((details, index) => {
          return {
            ...details,
            id: index + 1,
            itemId: recordId,
            designPcs: Number(details.designPcs) || 0,
          }
        })
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))

      await postRequest({
        extension: InventoryRepository.ItemProduction.set,
        record: JSON.stringify({
          header: {
            itemId: recordId,
            ...obj.header          
          },
          items: modifiedItems
        })
      })

      formik.setValues(obj)
      toast.success(platformLabels.Edited)

      invalidate()
      
    }
  })

  async function fetchFormData() {
    const rows = itemRawMaterials?.length
      ? itemRawMaterials.map((row, index) => ({
          ...row,
          id: index + 1
        }))
      : formik.initialValues.items

    formik.setValues({
      header: {
        ...itemProduction
      },
      items: rows
    })
  }

  useEffect(() => {
    if (recordId) fetchFormData()
  }, [recordId, itemRawMaterials, itemProduction])

    const columns = [
      {
        component: 'resourcelookup',
        label: labels.workCenter,
        name: 'workcenterId',
        flex: 2,
        props: {
          endpointId: ManufacturingRepository.WorkCenter.snapshot,
          displayField: 'reference',
          valueField: 'recordId',
          mapping: [
            { from: 'recordId', to: 'workcenterId' },
            { from: 'reference', to: 'workcenterRef' }
          ],
          columnsInDropDown: [
            { key: 'reference', value: 'Reference' },
            { key: 'name', value: 'Name' }
          ],
          displayFieldWidth: 3
        },
        async onChange({ row: { update, newRow } }) {
          if (!newRow?.workcenterId) {
            update({
              operationId: null,
              operationName: ''
            })
  
            return
          }
          update({
            workcenterId: newRow?.workcenterId || null,
            workcenterRef: newRow?.workcenterRef || ''
          })
        }
      },
      {
        component: 'resourcecombobox',
        label: labels.operation,
        name: 'operationId',
        variableParameters: [{ key: 'workcenterId', value: 'workcenterId' }],
        props: {
          endpointId: ManufacturingRepository.Operation.qry,
          valueField: 'recordId',
          displayField: 'name',
          mapping: [
            { from: 'recordId', to: 'operationId' },
            { from: 'name', to: 'operationName' },
            { from: 'reference', to: 'operationRef' }
          ],
          columnsInDropDown: [
            { key: 'reference', value: 'Reference' },
            { key: 'name', value: 'Name' }
          ],
          displayFieldWidth: 4
        },
        propsReducer({ row, props }) {
          return { ...props, readOnly: !row.workcenterId }
        }
      },
      {
        component: 'resourcelookup',
        label: labels.sku,
        name: 'rmItemSku',
        props: {
          endpointId: InventoryRepository.Item.snapshot4,
          displayField: 'sku',
          valueField: 'sku',
          columnsInDropDown: [
            { key: 'sku', value: 'Sku' },
            { key: 'name', value: 'Name' }
          ],
          mapping: [
            { from: 'recordId', to: 'rmItemId' },
            { from: 'name', to: 'rmItemName' },
            { from: 'sku', to: 'rmItemSku' },
            { from: 'categoryName', to: 'categoryName' }
          ],
          displayFieldWidth: 3
        },
        async onChange({ row: { update, newRow } }) {
          if (newRow?.rmItemId) {
            const res = await getRequest({
              extension: InventoryRepository.ItemProduction.get,
              parameters: `_recordId=${newRow.rmItemId}`
            })
            update({ rmCategoryName: res?.record?.rmcName || '' })
          } else {
            update({ rmCategoryName: '' })
          }
        }
      },
      {
        component: 'textfield',
        label: labels.item,
        name: 'rmItemName',
        props: {
          readOnly: true
        }
      },
      {
        component: 'textfield',
        label: labels.category,
        name: 'categoryName',
        props: {
          readOnly: true
        }
      },
      {
        component: 'textfield',
        label: labels.rmCategory,
        name: 'rmCategoryName',
        props: {
          readOnly: true
        }
      },
      {
        component: 'numberfield',
        label: labels.qty,
        name: 'designQty',
        props: {
          decimalScale: 3,
          maxLength: 12
        }
      },
      {
        component: 'numberfield',
        label: labels.pcs,
        name: 'designPcs',
        props: {
          decimalScale: 0,
          maxLength: 10
        }
      }
    ]
  
  const totalQty = formik.values.items.reduce((qty, row) => qty + (parseFloat(row.designQty) || 0), 0)
  const totalPcs = formik.values.items.reduce((pcs, row) => pcs + (Number(row.designPcs) || 0), 0)


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
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ResourceComboBox
                store={store?.productionLines}
                name='header.lineId'
                label={labels.productionLine}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values.header}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('header.lineId', newValue?.recordId || null)
                  formik.setFieldValue('header.ltId', null)
                }}
                error={formik.touched?.header?.lineId && Boolean(formik.errors?.header?.lineId)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                store={store?.productionClasses}
                values={formik.values.header}
                name='header.classId'
                label={labels.productionClass}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.classId', newValue?.recordId || null)
                }}
                error={formik.touched?.header?.classId && Boolean(formik.errors?.header?.classId)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                store={store?.productionStandards}
                values={formik.values.header}
                name='header.standardId'
                label={labels.productionStandard}
                valueField='recordId'
                displayField='reference'
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.standardId', newValue?.recordId || null)
                }}
                error={formik.touched?.header?.standardId && Boolean(formik.errors?.header?.standardId)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                store={store?.serialProfiles}
                values={formik.values.header}
                name='header.spfId'
                label={labels.sprofile}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.spfId', newValue?.recordId || null)
                }}
                error={formik.touched?.header?.spfId && Boolean(formik.errors?.header?.spfId)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceLookup
                endpointId={ManufacturingRepository.Design.snapshot}
                valueField='reference'
                displayField='name'
                name='header.designId'
                label={labels.design}
                form={formik}
                formObject={formik.values.header}
                secondDisplayField={true}
                firstValue={formik.values.header.designRef}
                secondValue={formik.values.header.designName}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.designRef', newValue?.reference || '')
                  formik.setFieldValue('header.designName', newValue?.name || '')
                  formik.setFieldValue('header.designId', newValue?.recordId || null)
                }}
                errorCheck={'header.designId'}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='header.standardCost'
                label={labels.standardCost}
                value={formik.values.header.standardCost}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.standardCost', null)}
                maxAccess={maxAccess}
                error={formik.touched?.header?.standardCost && Boolean(formik.errors?.header?.standardCost)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                store={store?.costGroups}
                name='header.cgId'
                label={labels.cg}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                displayFieldWidth={2}
                values={formik.values.header}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.cgId', newValue?.recordId || null)
                }}
                error={formik.touched?.header?.cgId && Boolean(formik.errors?.header?.cgId)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                store={store?.labelTemplates}
                name='header.ltId'
                label={labels.template}
                valueField='recordId'
                displayField='name'
                values={formik.values.header}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.ltId', newValue?.recordId || null)
                }}
                error={formik.touched?.header?.ltId && Boolean(formik.errors?.header?.ltId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                store={store?.rawMaterialCategories}
                name='header.rmcId'
                label={labels.rmc}
                valueField='recordId'
                displayField='name'
                values={formik.values.header}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.rmcId', newValue?.recordId || null)
                }}
                error={formik.touched?.header?.rmcId && Boolean(formik.errors?.header?.rmcId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceLookup
                endpointId={ManufacturingRepository.Routing.snapshot2}
                parameters={{
                  _lineId: 0
                }}
                valueField='reference'
                displayField='name'
                name='header.routingId'
                label={labels.routing}
                form={formik}
                formObject={formik.values.header}
                minChars={2}
                firstValue={formik.values.header.routingRef}
                secondValue={formik.values.header.routingName}
                errorCheck={'header.routingId'}
                maxAccess={maxAccess}
                displayFieldWidth={2}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.routingRef', newValue?.reference || '')
                  formik.setFieldValue('header.routingName', newValue?.name || '')
                  formik.setFieldValue('header.routingId', newValue?.recordId || null)
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                store={store?.packB?.billOfMaterials ?? []}
                name='header.bomId'
                label={labels.bom}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values.header}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.bomId', newValue?.recordId || null)
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot3}
                parameters={{
                  _productionLevel: 4
                }}
                name='header.wipItemId'
                label={labels.wipItem}
                valueField='sku'
                displayField='name'
                valueShow='wipItemSku'
                secondValueShow='wipItemName'
                form={formik}
                formObject={formik.values.header}
                readOnly={productionLevel == 4}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.wipItemSku', newValue?.sku || '')
                  formik.setFieldValue('header.wipItemName', newValue?.name || '')
                  formik.setFieldValue('header.wipItemId', newValue?.recordId || null)
                }}
                errorCheck={'header.wipItemId'}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            maxAccess={maxAccess}
          />
        </Grow>
        <Fixed>
          <Grid container xs={12} spacing={2} justifyContent='flex-end'>
            <Grid item xs={3}>
              <CustomNumberField
                name='totalQty'
                maxAccess={maxAccess}
                value={totalQty}
                label={labels.totalQty}
                decimalScale={3}
                readOnly={true}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='totalPcs'
                maxAccess={maxAccess}
                value={totalPcs}
                label={labels.totalPcs}
                readOnly={true}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
