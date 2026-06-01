import * as yup from 'yup'
import { useEffect, useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'

const SFItemForm = ({ labels, maxAccess, store }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.ProductionClassSemiFinished.qry
  })


  const { formik } = useForm({
    maxAccess,
    initialValues: {
      classId: recordId || null,
      items: [{
        id: 1,
        classId: recordId || null,
        sfItemId: null,
        itemName: '',
        sku: ''
      }]
    },
    validationSchema: yup.object({
      items: yup.array().of(
        yup.object({
          sfItemId: yup.number().required()
        })
      )
    }),
    onSubmit: async values => {
      await postRequest({
        extension: ManufacturingRepository.ProductionClassSemiFinished.set2,
        record: JSON.stringify({
          classId: recordId,
          items: values.items
            ?.filter(row => row.sfItemId)
            ?.map(row => ({
              ...row,
              classId: recordId
            }))
        })
      })

      toast.success(platformLabels.Edited)
      invalidate()
    }
  })

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.semiFinishedItemRef,
      name: 'sku',
      flex: 1,
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        parameters: { _categoryId: 0, _msId: 0, _startAt: 0, _size: 1000 },
        displayField: 'sku',
        valueField: 'sku',
        mapping: [
          { from: 'recordId', to: 'sfItemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 2
      }
    },
    {
      component: 'textfield',
      label: labels.semiFinishedItemName,
      name: 'itemName',
      flex: 1,
      props: {
        readOnly: true
      }
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (!recordId) return

      const res = await getRequest({
        extension: ManufacturingRepository.ProductionClassSemiFinished.qry,
        parameters: `_classId=${recordId}`
      })

      const items =
        res.list?.length > 0
          ? res.list.map((row, index) => ({
              ...row,
              id: row.id || row.seqNo || index + 1,
              classId: recordId
            }))
          : formik.initialValues.items

      formik.setValues({
        classId: recordId,
        items
      })
    })()
  }, [recordId])

  return (
    <FormShell resourceId={ResourceIds.ProductionClass} form={formik} editMode={true} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <DataGrid
            name='items'
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            initialValues={formik?.initialValues?.items?.[0]}
            onChange={value => {
              formik.setFieldValue(
                'items', value?.map(row => ({
                  ...row,
                  classId: recordId
                }))
              )
            }}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SFItemForm