import { useContext, useEffect } from 'react'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import * as yup from 'yup'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import toast from 'react-hot-toast'
import { RepairAndServiceRepository } from '@argus/repositories/src/repositories/RepairAndServiceRepository'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import { Grid } from '@mui/material'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const PartsForm = ({ access, labels, store: { reference, isPosted, recordId }, data: { seqNo, taskName, status } }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const isCompleted = status === 2

  const conditions = {
    sparePartId: row => row?.sparePartId,
    whId: row => row?.whId,
    qty: row => row?.qty != 0,
    unitPrice: row => row?.unitPrice > 0
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, access, 'parts')

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      parts: [{ id: 1, workOrderId: recordId, seqNo, unitPrice: 0, qty: 0, extendedPrice: 0 }]
    },
    validationSchema: yup.object({
      parts: yup.array().of(schema)
    }),
    onSubmit: async values => {
      const data = {
        workOrderId: recordId,
        seqNo,
        parts: values.parts
          ?.filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
          .map(({ id, partNo, partName, whName, itemId, ...item }, index) => ({
            wopSeqNo: index + 1,
            ...item
          }))
      }

      await postRequest({
        extension: RepairAndServiceRepository.WorkOrderParts.set2,
        record: JSON.stringify(data)
      })

      toast.success(platformLabels.Updated)
    }
  })

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.partNo,
      name: 'sparePartId',
      props: {
        endpointId: RepairAndServiceRepository.SpareParts.snapshot,
        displayField: 'partNo',
        valueField: 'partNo',
        columnsInDropDown: [
          { key: 'partNo', value: 'Part No' },
          { key: 'name', value: 'Name' }
        ],
        mapping: [
          { from: 'partNo', to: 'partNo' },
          { from: 'name', to: 'partName' },
          { from: 'recordId', to: 'sparePartId' }
        ],
        displayFieldWidth: 3
      }
    },
    {
      component: 'textfield',
      name: 'partName',
      label: labels.name,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: labels.qty,
      updateOn: 'blur',
      props: {
        decimalScale: 2
      },
      async onChange({ row: { update, newRow } }) {
        update({ extendedPrice: newRow.qty * newRow.unitPrice })
      }
    },

    {
      component: 'resourcecombobox',
      label: labels.warehouse,
      name: 'whId',
      props: {
        endpointId: RepairAndServiceRepository.Warehouse.qry,
        parameters: `_startAt=0&_pageSize=50`,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'name', to: 'whName' },
          { from: 'recordId', to: 'whId' }
        ],

        displayFieldWidth: 2
      }
    },
    {
      component: 'numberfield',
      name: 'unitPrice',
      label: labels.unitCost,
      updateOn: 'blur',
      props: {
        decimalScale: 2
      },
      async onChange({ row: { update, newRow } }) {
        update({ extendedPrice: newRow.qty * newRow.unitPrice })
      }
    },
    {
      component: 'numberfield',
      name: 'extendedPrice',
      label: labels.extendedCost,
      props: {
        readOnly: true
      }
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const response = await getRequest({
          extension: RepairAndServiceRepository.WorkOrderParts.qry,
          parameters: `_workOrderId=${recordId}&_seqNo=${seqNo}`
        })
        if (response?.list?.length) {
          const data = response.list?.map((item, index) => ({
            ...item,
            id: index + 1
          }))

          formik.setValues({ parts: data })
        }
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} disabledSubmit={isPosted || isCompleted}>
      <VertLayout>
        <Grow>
          <Fixed>
            <Grid container xs={4} spacing={2}>
              <Grid item xs={12}>
                <CustomTextField name='workOrder' label={labels.workOrder} value={reference} readOnly />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField name='taskName' label={labels.task} value={taskName} readOnly />
              </Grid>
            </Grid>
          </Fixed>
          <Grow>
            <DataGrid
              onChange={value => formik.setFieldValue('parts', value)}
              initialValues={formik.initialValues.parts?.[0]}
              value={formik.values.parts}
              error={formik.errors.parts}
              name='parts'
              columns={columns}
              maxAccess={access}
              disabled={isPosted || isCompleted}
              allowDelete={!isPosted && !isCompleted}
            />
          </Grow>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default PartsForm
