import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { getFormattedNumber } from '@argus/shared-domain/src/lib/numberField-helper'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'

const DesignRoutingSequence = ({ store, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const conditions = {
    workCenterId: row => row?.workCenterId,
    operationId: row => row?.operationId,
    sku: row => row?.sku,
    designQty: row => row?.designQty
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'data')

  const { formik } = useForm({
    maxAccess,
    conditionSchema: ['data'],
    initialValues: {
      designId: recordId,
      data: [
        {
          id: 1,
          workCenterId: null,
          designId: recordId,
          operationId: '',
          rmSeqNo: 1,
          itemId: '',
          designQty: null,
          designPcs: null
        }
      ]
    },
    validationSchema: yup.object({
      data: yup.array().of(schema)
    }),
    onSubmit: async values => {
      const modifiedItems = values?.data
        .map((details, index) => {
          return {
            ...details,
            id: index + 1,
            rmSeqNo: index + 1,
            designId: recordId
          }
        })
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))

      await postRequest({
        extension: ManufacturingRepository.DesignRawMaterial.set2,
        record: JSON.stringify({ designId: recordId, data: modifiedItems })
      }).then(() => {
        fetchGridData()
        toast.success(platformLabels.Edited)
      })
    }
  })

  const editMode = !!recordId

  async function fetchGridData() {
    const res = await getRequest({
      extension: ManufacturingRepository.DesignRawMaterial.qry,
      parameters: `_designId=${recordId}`
    })

    const updateItemsList =
      res?.list && res?.list?.length !== 0
        ? await Promise.all(
            res.list.map(async (item, index) => {
              return {
                ...item,
                id: index + 1
              }
            })
          )
        : formik.initialValues.data

    formik.setValues({
      designId: recordId,
      recordId,
      data: updateItemsList
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) await fetchGridData()
    })()
  }, [])

  const totalQty = formik.values.data.reduce((qty, row) => qty + (Number(row.designQty) || 0), 0)
  const totalPcs = formik.values.data.reduce((pcs, row) => pcs + (Number(row.designPcs) || 0), 0)

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.workCenter,
      name: 'workCenterId',
      flex: 2,
      props: {
        endpointId: ManufacturingRepository.WorkCenter.snapshot,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'workCenterId' },
          { from: 'reference', to: 'workCenterRef' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 3
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.workCenterId) {
          update({
            operationId: null,
            operationName: ''
          })

          return
        }
        update({
          workCenterId: newRow?.workCenterId || null,
          workCenterRef: newRow?.workCenterRef || ''
        })
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.operation,
      name: 'operationId',
      variableParameters: [{ key: 'workCenterId', value: 'workCenterId' }],
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
        return { ...props, readOnly: !row.workCenterId }
      }
    },
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.RMSKU.snapshot,
        displayField: 'sku',
        valueField: 'sku',
        columnsInDropDown: [
          { key: 'sku', value: 'Sku' },
          { key: 'name', value: 'Name' }
        ],
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'name', to: 'itemName' },
          { from: 'sku', to: 'sku' },
          { from: 'categoryName', to: 'categoryName' }
        ],
        displayFieldWidth: 3
      },
      async onChange({ row: { update, newRow } }) {
        if (newRow?.itemId) {
          const res = await getRequest({
            extension: InventoryRepository.ItemProduction.get,
            parameters: `_recordId=${newRow.itemId}`
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
      name: 'itemName',
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

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Design}
      maxAccess={maxAccess}
      isCleared={false}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('data', value)}
            value={formik.values.data}
            error={formik.errors.data}
            columns={columns}
            name='data'
            maxAccess={maxAccess}
          />
        </Grow>
        <Fixed>
          <Grid container direction='row' wrap='nowrap' sx={{ pt: 5, justifyContent: 'flex-end' }}>
            <Grid item xs={3} sx={{ pl: 3 }}>
              <CustomTextField
                name='totalQty'
                maxAccess={maxAccess}
                value={getFormattedNumber(totalQty)}
                label={labels.totalQty}
                readOnly={true}
              />
            </Grid>
            <Grid item xs={3} sx={{ pl: 3 }}>
              <CustomTextField
                name='totalPcs'
                maxAccess={maxAccess}
                value={getFormattedNumber(totalPcs.toFixed(2))}
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

export default DesignRoutingSequence
