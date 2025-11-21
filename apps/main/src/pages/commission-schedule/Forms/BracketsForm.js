import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import * as yup from 'yup'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const BracketsForm = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: SaleRepository.CommissionScheduleBracket.page
  })

  const conditions = {
    minAmount: row => row?.minAmount != null && row.minAmount <= row.maxAmount,
    maxAmount: row => row?.maxAmount != null && row.minAmount <= row.maxAmount,
    pct: row => row?.pct != null && row.pct >= 0 && row.pct <= 100
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'rows')

  const { formik } = useForm({
    maxAccess,
    initialValues: { rows: [] },
    conditionSchema: ['rows'],
    validationSchema: yup.object({
      rows: yup.array().of(schema)
    }),
    onSubmit: async values => {
      const filteredRows = values.rows.filter(row => Object.values(requiredFields)?.some(fn => fn(row)))

      const updatedRows = filteredRows.map((row, index) => ({
        ...row,
        commissionScheduleId: recordId,
        seqNo: index + 1
      }))

      const payload = {
        commissionScheduleId: recordId,
        items: updatedRows
      }

      await postRequest({
        extension: SaleRepository.CommissionSchedule.set2,
        record: JSON.stringify(payload)
      })

      toast.success(platformLabels.Updated)
      invalidate()
    }
  })

  const getGridData = async () => {
    const res = await getRequest({
      extension: SaleRepository.CommissionScheduleBracket.qry,
      parameters: `_commissionScheduleId=${recordId}`
    })
    if (res.list.length > 0) {
      const newRows = res.list.map((obj, index) => ({
        id: index + 1,
        ...obj
      }))
      formik.setValues({ rows: newRows })
    }
  }

  useEffect(() => {
    if (recordId) getGridData()
  }, [recordId])

  const columns = [
    {
      component: 'numberfield',
      label: labels.min,
      name: 'minAmount',
      props: { allowNegative: false }
    },
    {
      component: 'numberfield',
      label: labels.max,
      name: 'maxAmount',
      props: { allowNegative: false }
    },
    {
      component: 'numberfield',
      label: labels.pct,
      name: 'pct',
      props: {
        allowNegative: false,
        maxLength: 5,
        decimalScale: 2
      }
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} isParentWindow={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            name='rows'
            maxAccess={maxAccess}
            value={formik.values.rows}
            error={formik.errors?.rows}
            columns={columns}
            onChange={value => formik.setFieldValue('rows', value)}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default BracketsForm
