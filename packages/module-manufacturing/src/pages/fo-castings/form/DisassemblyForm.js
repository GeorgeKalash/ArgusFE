import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import toast from 'react-hot-toast'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { FoundryRepository } from '@argus/repositories/src/repositories/FoundryRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function DisassemblyForm({ labels, maxAccess, store, setStore }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const recordId = store?.recordId
  const metalInfo = store?.metalInfo

  const { formik } = useForm({
    maxAccess,
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
    onSubmit: async obj => {
      const modifiedItems = obj?.items.map((itemDetails, index) => {
        return {
          ...itemDetails,
          id: index + 1,
          castingId: recordId,
          weight: itemDetails?.weight || 0
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
        readOnly: true,
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
      props: {
        maxLength: 11,
        decimals: 4,
        allowNegative: false
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
    <Form
      onSave={formik.handleSubmit}
      maxAccess={maxAccess}
      editMode={true}
      disabledSubmit={store?.isCancelled || store?.isPosted}
      isParentWindow={false}
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
            allowAddNewLine={false}
            disabled={store?.isCancelled || store?.isPosted}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}
