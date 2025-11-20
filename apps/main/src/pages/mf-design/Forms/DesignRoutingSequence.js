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
import { ManufacturingRepository } from '@argus/repositories/repositories/ManufacturingRepository'
import { InventoryRepository } from '@argus/repositories/repositories/InventoryRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { getFormattedNumber } from '@argus/shared-domain/src/lib/numberField-helper'

const DesignRoutingSequence = ({ store, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const requiredIfAny = (otherFields, message, customCheck) => {
    return yup.string().test('required-if-any', message, function (value) {
      const index = this.options.index
      const parent = this.parent

      const isAnyFilled = otherFields.some(field => !!parent[field])
      const isFirst = index === 0

      const isValid = customCheck ? customCheck(value) : !!value

      return isFirst ? !isAnyFilled || isValid : isValid
    })
  }

  const { formik } = useForm({
    validateOnChange: true,
    maxAccess,
    initialValues: {
      designId: recordId,
      items: [
        {
          id: 1,
          designId: recordId,
          operationId: '',
          rmSeqNo: 1,
          itemId: '',
          designQty: 0,
          designPcs: 0
        }
      ]
    },
    validationSchema: yup.object({
      items: yup.array().of(
        yup.object().shape({
          operationId: requiredIfAny(['itemId', 'designQty', 'designPcs'], 'Operation is required'),
          itemId: requiredIfAny(['operationId', 'designQty', 'designPcs'], 'Item is required'),
          designQty: requiredIfAny(
            ['operationId', 'itemId', 'designPcs'],
            'Design Qty is required and must be a number',
            value => !!value && !isNaN(Number(value))
          )
        })
      )
    }),
    onSubmit: async values => {
      const modifiedItems = values?.items
        .map((details, index) => {
          return {
            ...details,
            id: index + 1,
            rmSeqNo: index + 1,
            designId: recordId
          }
        })
        .filter(item => item.operationId || item.itemId || item.designQty)

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
        : formik.initialValues.items

    formik.setValues({
      designId: recordId,
      recordId,
      items: updateItemsList
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) await fetchGridData()
    })()
  }, [])

  const totalQty = formik.values.items.reduce((qty, row) => qty + (Number(row.designQty) || 0), 0)
  const totalPcs = formik.values.items.reduce((pcs, row) => pcs + (Number(row.designPcs) || 0), 0)

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.operation,
      name: 'operationId',
      props: {
        endpointId: ManufacturingRepository.Operation.qry,
        parameters: `_workCenterId=0&_startAt=0&_pageSize=1000&`,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'operationId' },
          { from: 'name', to: 'operationName' },
          { from: 'reference', to: 'operationRef' }
        ],
        columnsInDropDown: [
          { key: 'name', value: 'Name' },
          { key: 'reference', value: 'Reference' }
        ]
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
          { from: 'sku', to: 'sku' }
        ],
        displayFieldWidth: 2
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
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
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
