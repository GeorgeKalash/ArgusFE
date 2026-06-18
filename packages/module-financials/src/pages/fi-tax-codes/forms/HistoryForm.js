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

const HistoryForm = ({ store, setStore, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    validationSchema: yup.object({
      items: yup.array().of(
        yup.object().shape({
          amount: yup.string().required(),
          date: yup.string().required()
        })
      ).required()
    }),
    initialValues: {
      items: [
        {
          id: 1,
          taxCodeId: recordId || null,
          date: '',
          amount: '',
          seqNo: ''
        }
      ]
    },
    onSubmit: async obj => {
      const items = obj.items.map((item, index) => ({
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

        if (res?.list?.length > 0) {
          const items = res.list.map((item, index) => ({
            ...item,
            id: index + 1,
            date: formatDateFromApi(item.date)
          }))

          formik.setValues({ items })
          setStore(prev => ({ ...prev, items: items }))
        }
      }
    })()
  }, [recordId])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={[
              {
                component: 'date',
                label: labels.date,
                name: 'date'
              },
              {
                component: 'numberfield',
                label: labels.amount,
                name: 'amount',
                decimalScale: 2
              }
            ]}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default HistoryForm