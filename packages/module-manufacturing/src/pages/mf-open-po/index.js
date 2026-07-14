import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'
import { useError } from '@argus/shared-providers/src/providers/error'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'

const OpenProductionOrder = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.OpenProductionOrder
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      items: []
    },
    validateOnChange: true,
    onSubmit: async obj => {

      const itemValues = obj?.items
        .filter(item => item.isChecked)
        .map(({ id, isChecked, ...item }) => item)
      if (itemValues?.length < 1) {
        stackError({
          message: platformLabels.checkItemsBeforeAppend
        })

        return
      }

      await postRequest({
        extension: ManufacturingRepository.ProductionOrder.generate,
        record: JSON.stringify({ items: itemValues })
      })

      toast.success(platformLabels.Generated)
      getData()
      
    }
  })

  async function getData() {
    const result = await getRequest({
      extension: ManufacturingRepository.ProductionOrder.open,
      parameters: `_params=`
    })

    const res = result?.list?.map((item, index) => ({
      ...item,
      id: index + 1,
      date: formatDateFromApi(item.date),
      balance: item.qty - item.producedQty
    }))

    formik.setFieldValue('items', res)
  }

   useEffect(() => {
      ;(async function () {
        getData()
      })()
    }, [])

  const isCheckedAll = formik.values.items?.length > 0 && formik.values.items?.every(item => item?.isChecked)

  const columns = [
    {
      component: 'checkbox',
      name: 'isChecked',
      flex: 0.3,
      checkAll: {
        value: isCheckedAll,
        visible: true,
        onChange({ checked }) {
          const items = formik.values.items.map(({ isChecked, ...item }) => ({
            ...item,
            isChecked: checked,
            producedNow: checked ? item.balance : 0
          }))

          formik.setFieldValue('items', items)
        }
      },

      async onChange({ row: { update, newRow } }) {
        update({ producedNow: newRow.isChecked ? newRow.balance : 0 })
      }
    },
    {
      component: 'image',
      name: 'pictureUrl',
      label: labels.image,
      width: 70,
      onClick: ({ value, row }) => {
        stack({
          Component: ImageViewer,
          props: {
            imageUrl: value
          },
          width: 800,
          height: 600,
          title: row.sku
        })
      }
    },
    {
      component: 'textfield',
      label: labels.poRef,
      name: 'poRef',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.sku,
      name: 'sku',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'itemName',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.itemWeight,
      name: 'itemWeight',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.produced,
      name: 'producedQty',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.balance,
      name: 'balance',
      props: { readOnly: true, decimalScale: 2 }
    },
    {
      component: 'numberfield',
      label: labels.genQty,
      name: 'producedNow',
      updateOn: 'blur',
      defaultValue: 0,
      propsReducer({ row, props }) {
        return { ...props, readOnly: !row.isChecked }
      },
      async onChange({ row: { update, newRow } }) {
        const { producedNow, balance } = newRow
        let value = producedNow
        const maxValue = balance

        if (value > maxValue) 
        value = maxValue

        update({ producedNow: value || 0 })
      }
    }
  ]

  const actions = [
    {
      key: 'generate',
      condition: true,
      onClick: () => formik.handleSubmit()
    }
  ]

  return (
    <Form
      actions={actions}
      onSave={formik.handleSubmit}
      isSaved={false}
      maxAccess={access}
      fullSize
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            allowDelete={false}
            allowAddNewLine={false}
            maxAccess={access}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default OpenProductionOrder
