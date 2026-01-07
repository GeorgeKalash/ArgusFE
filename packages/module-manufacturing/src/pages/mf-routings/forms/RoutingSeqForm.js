import * as yup from 'yup'
import { useEffect, useContext, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const RoutingSeqForm = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store
  const editMode = !!recordId
  const [operations, setOperations] = useState([])

  const filteredOperations = useRef([])

  const conditions = {
    seqNo: row => row.seqNo,
    name: row => row.name,
    workCenterId: row => row.workCenterId,
    operationId: row => row.operationId
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'data')

  const { formik } = useForm({
    maxAccess,
    validateOnChange: true,
    conditionSchema: ['data'],
    validationSchema: yup.object({
      data: yup.array().of(schema)
    }),
    initialValues: {
      data: [{ id: 1, seqNo: 0 }]
    },
    onSubmit: async data => {
      const updatedRows = data?.data
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        .map(itemDetails => {
          return {
            ...itemDetails,
            routingId: recordId
          }
        })

      await postRequest({
        extension: ManufacturingRepository.RoutingSequence.set2,
        record: JSON.stringify({ routingId: recordId, data: updatedRows })
      })

      toast.success(platformLabels.Edited)
    }
  })

  async function getFilteredOperations(workCenterId) {
    const array = operations?.filter(item => item?.workCenterId == workCenterId) || []
    filteredOperations.current = array
  }

  const getOperations = async () => {
    return await getRequest({
      extension: ManufacturingRepository.Operation.qry,
      parameters: `_filter=&_workCenterId=0`
    })
  }

  const columns = [
    {
      component: 'numberfield',
      label: labels.seqNo,
      name: 'seqNo',
      props: {
        maxLength: 5,
        decimalScale: 0
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'name'
    },
    {
      component: 'resourcecombobox',
      label: labels.workCenter,
      name: 'workCenterId',
      props: {
        endpointId: ManufacturingRepository.WorkCenter.qry,
        displayField: 'name',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'workCenterId' },
          { from: 'name', to: 'workCenterName' },
          { from: 'reference', to: 'workCenterRef' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        getFilteredOperations(newRow?.workCenterId)
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.operation,
      name: 'operationId',
      props: {
        store: filteredOperations?.current,
        displayField: 'name',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'operationId' },
          { from: 'name', to: 'operationName' },
          { from: 'reference', to: 'operationRef' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      },
      propsReducer({ row, props }) {
        return { ...props, store: filteredOperations?.current }
      }
    }
  ]

  useEffect(() => {
    ;(async function () {
      const operationsList = await getOperations()
      setOperations(operationsList?.list)
      if (recordId) {
        const res = await getRequest({
          extension: ManufacturingRepository.RoutingSequence.qry,
          parameters: `_routingId=${recordId}`
        })

        const updateItemsList =
          res?.list?.length != 0
            ? await Promise.all(
                res?.list?.map(async (item, index) => {
                  return {
                    ...item,
                    id: index + 1
                  }
                })
              )
            : [{ id: 1 }]
        formik.setFieldValue('data', updateItemsList)
      }
    })()
  }, [])

  return (
    <>
      <Form onSave={formik.handleSubmit} editMode={editMode} maxAccess={maxAccess} isParentWindow={false}>
        <VertLayout>
          <Grow>
            <DataGrid
              name='routingSequence'
              maxAccess={maxAccess}
              onChange={value => formik.setFieldValue('data', value)}
              onSelectionChange={(row, update, field) => {
                if (field == 'operationId') getFilteredOperations(row?.workCenterId)
              }}
              value={formik.values?.data}
              error={formik.errors?.data}
              columns={columns}
            />
          </Grow>
        </VertLayout>
      </Form>
    </>
  )
}

export default RoutingSeqForm
