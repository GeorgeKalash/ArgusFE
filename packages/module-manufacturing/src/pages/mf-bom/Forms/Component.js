import { useContext, useEffect, useRef, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import toast from 'react-hot-toast'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { Grid } from '@mui/material'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'

const ComponentBOM = ({ store, labels, maxAccess }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [measurements, setMeasurements] = useState([])
  const [reCalc, setRecalc] = useState([])
  const filteredMeasurements = useRef([])

  const conditions = {
    sku: row => row?.sku,
    itemName: row => row?.itemName,
    qty: row => row?.qty,
    pcs: row => {
      return {
        valid: row?.pcs <= 2147483647,
        optional: true
      }
    }
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'components')

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      bomId: recordId,
      components: [{
        bomId: recordId,
        id: 1,
        seqNo: 1,
        itemId: null,
        sku: null,
        itemName: '',
        costTypeId: null,
        qty: null,
        muId: null,
        muQty: null,
        msId: null,
        currentCost: 0,
        variationLimit: null
      }]
    },
    conditionSchema: ['components'],
    validationSchema: yup.object({
      components: yup.array().of(schema)
    }),
    onSubmit: async ({ components }) => {
      const parsePct = pct => (typeof pct === 'string' ? parseFloat(pct.replace('%', '')) : pct)

      const res = {
        bomId: recordId,
        components: components
          .filter(row => Object.values(requiredFields).every(fn => fn(row)))
          .map((row, index) => ({
            ...row,
            bomId: recordId,
            seqNo: index++,
            costPct: reCalc
              ? totalCost === 0
                ? 0
                : (row.currentCost * row.baseQty * 100) / totalCost
              : parsePct(row.costPct)
          }))
      }

      await postRequest({
        extension: ManufacturingRepository.Component.set2,
        record: JSON.stringify(res)
      })

      toast.success(platformLabels.Updated)
      setRecalc(false)
    }
  })

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Items.snapshot,
        parameters: {
          _startAt: 0,
          _size: 50
        },
        valueField: 'sku',
        displayField: 'sku',
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' },
          { from: 'msId', to: 'msId' },
          { from: 'categoryName', to: 'categoryName' },
          { from: 'groupName', to: 'groupName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 4
      },
      async onChange({ row: { update, newRow } }) {
        setRecalc(true)
        getFilteredMU(newRow?.msId)
        const currentCost = await getUnitCost(newRow?.itemId)
        const productionInfo = await getItemProductionInfo(newRow?.itemId)

        update({
          msId: newRow?.msId,
          rmCategoryName: productionInfo?.rmcName || '',
          currentCost
        })
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.measurementUnit,
      name: 'muId',
      props: {
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'muId' },
          { from: 'reference', to: 'muRef' },
          { from: 'name', to: 'muName' },
          { from: 'qty', to: 'muQty' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 3
      },
      async onChange({ row: { update, newRow } }) {
        setRecalc(true)
        const baseQty = (newRow?.muId ? (newRow.qty || 0) * (newRow.muQty || 0) : (newRow?.qty || 0))
        update({ muId: newRow?.muId || null, muQty: newRow?.muQty || 0, baseQty })
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: !row.msId, store: filteredMeasurements?.current }
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.site,
      name: 'siteId',
      props: {
        endpointId: InventoryRepository.Site.qry,
        displayField: 'reference',
        valueField: 'recordId',
        displayFieldWidth: 3,
        mapping: [
          { from: 'recordId', to: 'siteId' },
          { from: 'name', to: 'siteName' },
          { from: 'reference', to: 'siteRef' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.itemGroup,
      name: 'groupName',
      props: { readOnly: true },
      flex: 2
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
      label: labels.pcs,
      name: 'pcs',
      props: {
        decimalScale: 0,
        maxLength: 10
      }
    },
    {
      component: 'numberfield',
      label: labels.size,
      name: 'size',
      props: {
        decimalScale: 0,
        maxLength: 3
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      props: { decimalScale: 4, maxLength: 11, allowNegative: false },
      onChange: ({ row: { update, newRow } }) => {
        setRecalc(true)
        const baseQty = (newRow?.muId ? (newRow.qty || 0) * (newRow.muQty || 0) : (newRow?.qty || 0))
        update({ baseQty })
      }
    },
    {
      component: 'numberfield',
      label: labels.variationLimit,
      name: 'variationLimit',
      props: { decimalScale: 2, maxLength: 5 }
    },
    {
      component: 'numberfield',
      label: labels.currentCost,
      name: 'currentCost',
      props: { readOnly: true }
    }
  ]

  const getUnitCost = async itemId => {
    if (!itemId) return 0

    const res = await getRequest({
      extension: InventoryRepository.CurrentCost.get,
      parameters: `_itemId=${itemId}`
    })

    return res?.record?.currentCost || 0
  }

  const getItemProductionInfo = async itemId => {
    if (!itemId) return 

    const res = await getRequest({
      extension: InventoryRepository.ItemProduction.get,
      parameters: `_recordId=${itemId}`
    })

    return res?.record || {}
  }
  
  async function getFilteredMU(msId) {
    if (!msId) return

    const arrayMU = measurements?.filter(item => item.msId === msId) || []
    filteredMeasurements.current = arrayMU
  }

  async function getMeasurements() {
    const response = await getRequest({
      extension: InventoryRepository.MeasurementUnit.qry,
      parameters: `_msId=0`
    })
    setMeasurements(response?.list || [])
  }

  async function fetchGridData() {
    if (!recordId) return

    const response = await getRequest({
      extension: ManufacturingRepository.Component.qry,
      parameters: `_bomId=${recordId}`
    })

    if (!response.list) return response

    const totalQty = response.list.reduce((sum, row) => sum + (parseFloat(row.baseQty) || 0), 0)

    const components = response.list.map((row, index) => ({
      ...row,
      percentage: totalQty > 0 ? `%${((row.baseQty * 100) / totalQty).toFixed(3)}` : '0%',
      costPct: row.costPct ? `%${row.costPct.toFixed(5)}` : null,
      id: index + 1,
      seqNo: index + 1
    }))

    if (components.length) formik.resetForm({ values: { ...formik.values, components } })
  }

  const totalQty = formik.values?.components.reduce((qtySum, row) => {
    const qtyValue = parseFloat(row.qty) || 0

    return qtySum + qtyValue
  }, 0)

  const totalCost = formik.values?.components.reduce((sum, row) => {
    const currentCost = row.currentCost ? parseFloat(row.currentCost) : 0
    const baseQty = row.baseQty ? parseFloat(row.baseQty) : 0

    return sum + currentCost * baseQty
  }, 0)

  useEffect(() => {
    ;(async function () {
      await getMeasurements()
      await fetchGridData()
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} fullSize>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('components', value)}
            columns={columns}
            value={formik.values.components}
            error={formik.errors.components}
            name='components'
            maxAccess={maxAccess}
            onSelectionChange={(row, update, field) => {
              if (field == 'muId') getFilteredMU(row?.msId)
            }}
          />
        </Grow>
        <Fixed>
          <Grid container sx={{ p: 2 }}>
            <Grid item xs={3}>
              <CustomNumberField name='totalQty' label={labels.totalQty} value={totalQty} readOnly maxAccess={maxAccess}/>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </Form>
  )
}

export default ComponentBOM