import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'

const HistoryForm = ({ store, setStore, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const conditions = {
    amount: row => row?.date && !row?.amount,
    date: row => !row?.date && row.amount
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    maxAccess,
    conditionSchema: ['items'],
    initialValues: {
      items: [
        {
          id: 1,
          taxCodeId: recordId || null,
          date: null,
          amount: null,
          seqNo: 1
        }
      ]
    },
    validationSchema: yup.object({
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const items = obj?.items?.filter(row => Object.values(requiredFields)?.every(fn => fn(row))).map((item, index) => ({
        ...item,
        seqNo: index + 1,
        date: formatDateToApi(item.date),
        taxCodeId: recordId
      }))

      await postRequest({
        extension: FinancialRepository.TaxHistoryPack.set2,
        record: JSON.stringify({ taxCodeId: recordId, items })
      })

      toast.success(platformLabels.Edited)
      setStore(prev => ({ ...prev, items }))
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: FinancialRepository.TaxHistoryPack.qry,
          parameters: `_taxCodeId=${recordId}`
        })

        const items = res?.list?.length > 0 ? res?.list.map((item, index) => ({
          ...item,
          id: index + 1,
          date: formatDateFromApi(item.date)
        })) : formik.initialValues.items

        formik.setValues({ items })
        
      }
    })()
  }, [])

  const columns = [
    {
      component: 'date',
      label: labels.date,
      name: 'date'
    },
    {
      component: 'numberfield',
      label: labels.amount,
      name: 'amount',
      props: {
        decimalScale: 2
      },
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <DataGrid
            name='items'
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
             initialValues={formik.initialValues.items[0]}
            error={formik.errors.items}
            columns={columns}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default HistoryForm