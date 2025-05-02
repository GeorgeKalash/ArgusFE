import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

const DesignRoutingSequence = ({ store, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const editMode = !!recordId

  const { formik } = useForm({
    validateOnChange: true,
    maxAccess,
    initialValues: {
      designId: recordId,
      items: [
        {
          id: 1,
          designId: recordId,
          operationId: null,
          rmSeqNo: null,
          itemId: null,
          designQty: null,
          designPcs: null
        }
      ]
    },
    validationSchema: yup.object({
      items: yup.array().of(
        yup.object({
          operationId: yup.number().required(),
          itemId: yup.number().required(),
          designQty: yup.number().required()
        })
      )
    }),
    onSubmit: async values => {
      const item = formik.values.items.map((item, index) => ({
        ...item,
        rmSeqNo: index + 1,
        id: index + 1
      }))

      const data = { ...values, data: item }

      await postRequest({
        extension: ManufacturingRepository.DesignRawMaterial.set2,
        record: JSON.stringify(data)
      }).then(res => {
        toast.success(platformLabels.Edited)
      })
      getData(recordId)
    }
  })

  const getData = recordId => {
    getRequest({
      extension: ManufacturingRepository.DesignRawMaterial.qry,
      parameters: `_designId=${recordId}`
    }).then(res => {
      if (res?.list?.length > 0) {
        const items = res.list.map((item, index) => ({
          ...item,
          id: index + 1
        }))
        formik.setValues({ ...formik.values, items: items })
      }
    })
  }

  useEffect(() => {
    if (recordId) {
      getData(recordId)
    }
  }, [])

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
      name: 'itemId',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        displayField: 'sku',
        valueField: 'recordId',
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
      },
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'designPcs',
      props: {
        decimalScale: 0,
        maxLength: 10
      },
    }
  ]

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Designs}
      maxAccess={maxAccess}
      infoVisible={false}
      isSavedClear={false}
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
      </VertLayout>
    </FormShell>
  )
}

export default DesignRoutingSequence
