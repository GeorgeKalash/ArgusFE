import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function OverheadsForm({ store, labels, maxAccess }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store
  const editMode = !!recordId

  const conditions = {
    overheadId: row => row?.overheadId,
    amount: row => row?.amount
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'costGroupOverheads')

  const { formik } = useForm({
    initialValues: {
      costGroupOverheads: [{ id: 1, amount: 0 }]
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      costGroupOverheads: yup.array().of(schema)
    }),
    onSubmit: async values => {
      const updatedRows = values?.costGroupOverheads
        ?.filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        .map((item, index) => {
          return {
            ...item,
            cgId: recordId,
            seqNo: index + 1
          }
        })

      await postRequest({
        extension: ManufacturingRepository.CostGroupOverhead.set2,
        record: JSON.stringify({ cgId: recordId, costGroupOverheads: updatedRows })
      })

      toast.success(platformLabels.Edited)
    }
  })

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.overhead,
      name: 'overheadId',
      props: {
        endpointId: ManufacturingRepository.Overhead.snapshot,
        displayField: 'reference',
        valueField: 'reference',
        mapping: [
          { from: 'recordId', to: 'overheadId' },
          { from: 'reference', to: 'overheadRef' },
          { from: 'name', to: 'overheadName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 2
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'overheadName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.amount,
      name: 'amount',
      props: {
        maxLength: 12,
        decimalScale: 2
      }
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: ManufacturingRepository.CostGroupOverhead.qry,
          parameters: `_cgId=${recordId}`
        })

        const costGroupOverheads = res?.list?.map((item, index) => ({
          ...item,
          id: index + 1
        }))

        formik.setFieldValue('costGroupOverheads', costGroupOverheads)
      }
    })()
  }, [])

  const totalAmount = formik.values.costGroupOverheads?.reduce((sum, row) => {
    return sum + Number(row?.amount || 0)
  }, 0)

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <DataGrid
            name='costGroupOverheads'
            maxAccess={maxAccess}
            onChange={value => formik.setFieldValue('costGroupOverheads', value)}
            value={formik.values?.costGroupOverheads}
            error={formik.errors?.costGroupOverheads}
            columns={columns}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <CustomNumberField
                name='TotalAmount'
                maxAccess={maxAccess}
                label={labels.netAmount}
                value={totalAmount?.toFixed(2)}
                initialValues={formik.values.initialValues?.[0]}
                readOnly
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </Form>
  )
}
