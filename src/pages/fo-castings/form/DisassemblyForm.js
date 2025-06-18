import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { ResourceIds } from 'src/resources/ResourceIds'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { createConditionalSchema } from 'src/lib/validation'
import { FoundryRepository } from 'src/repositories/FoundryRepository'

export default function DisassemblyForm({ labels, maxAccess, store, setStore, setRecalculateJobs }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const recordId = store?.recordId
  const metalInfo = store?.metalInfo

  const conditions = {
    itemName: row => row.itemName,
    sku: row => row.sku,
    weight: row => row.weight >= 0
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    maxAccess,
    validateOnChange: true,
    initialValues: {
      items: [
        {
          id: 1,
          castingId: recordId,
          seqNo: '',
          itemId: null,
          sku: '',
          itemName: '',
          weight: 0
        }
      ]
    },
    validationSchema: yup.object({
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const modifiedItems = obj?.items
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        .map((itemDetails, index) => {
          return {
            ...itemDetails,
            id: index + 1,
            castingId: recordId
          }
        })

      const payload = { castingId: recordId, items: modifiedItems }
      await postRequest({
        extension: FoundryRepository.CastingDisassembly.set2,
        record: JSON.stringify(payload)
      })
      toast.success(platformLabels.Edited)
    }
  })

  const scrapWgt = formik.values?.items?.reduce((wgt, row) => {
    const wgtValue = parseFloat(row.weight?.toString().replace(/,/g, '')) || 0

    return wgt + wgtValue
  }, 0)

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'sku',
        displayField: 'sku',
        mandatory: true,
        displayFieldWidth: 2,
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        update({
          itemId: newRow?.itemId,
          sku: newRow?.sku,
          itemName: newRow?.itemName,
          unitCost: newRow?.unitCost || 0
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
      component: 'numberfield',
      label: labels.weight,
      name: 'weight',
      async onChange({ row: { update, newRow } }) {
        setRecalculateJobs(true)
      }
    }
  ]

  async function fetchGridData() {
    if (!metalInfo?.metalId && !metalInfo?.metalColorId) return

    const ScrapMetals = await getRequest({
      extension: FoundryRepository.MetalScrap.qry,
      parameters: `_metalId=${metalInfo?.metalId}&_metalColorId=${metalInfo?.metalColorId}`
    })

    const disassemblyItems = await getRequest({
      extension: FoundryRepository.CastingDisassembly.qry,
      parameters: `_castingId=${recordId}`
    })

    if (disassemblyItems?.list.length != 0) {
      ScrapMetals?.list.forEach(metalItem => {
        const match = disassemblyItems?.list.find(r => r.itemId === metalItem.scrapItemId)
        if (match) metalItem.weight = match.weight
      })
    } else {
      ScrapMetals?.list.forEach(metalItem => {
        metalItem.weight = 0
      })
    }

    const updateItemsList =
      ScrapMetals?.list?.length != 0
        ? ScrapMetals?.list?.map((item, index) => {
            return {
              ...item,
              id: index + 1,
              itemId: item.scrapItemId,
              weight: item?.weight || 0
            }
          })
        : formik.initialValues.items
    formik.setFieldValue('items', updateItemsList)
  }

  useEffect(() => {
    setStore(prevStore => ({
      ...prevStore,
      castingInfo: {
        ...prevStore.castingInfo,
        scrapWgt
      }
    }))
  }, [scrapWgt])

  useEffect(() => {
    if (recordId) fetchGridData()
  }, [recordId, metalInfo])

  return (
    <FormShell
      resourceId={ResourceIds.FoCastings}
      form={formik}
      maxAccess={maxAccess}
      editMode={true}
      isInfo={false}
      isCleared={false}
      isSavedClear={false}
      disabledSubmit={store?.isCancelled || store?.isPosted}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            initialValues={formik?.initialValues?.items?.[0]}
            name='items'
            maxAccess={maxAccess}
            allowDelete={false}
            disabled={store?.isCancelled || store?.isPosted}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
