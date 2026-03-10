import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { DataGrid } from './DataGrid'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import Form from './Form'

export default function Installments({ data, onOk, window }) {
  const isPosted = data.status === 3

  const { labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.Installments
  })

  useSetWindow({ title: labels.Installments, window })

  const { formik } = useForm({
    initialValues: {
      installments: data?.installments?.map((item, index) => ({
        ...item,
        id: index + 1,
        dueDate:
          item.dueDate && /^\/Date\(-?\d+\)\/$/.test(item.dueDate)
            ? formatDateFromApi(item.dueDate)
            : item.dueDate || null
      })) || [
        {
          id: 1,
          dueDate: null,
          amount: null
        }
      ]
    },
    maxAccess,
    validateOnChange: true,
    onSubmit: async values => {
      if (onOk) {
        let installments = values.installments
          .filter(item => item.dueDate)
          .map((item, index) => ({
            ...item,
            seqNo: index + 1,
            reference: data?.reference,
            vendorId: data?.vendorId,
            invoiceId: data?.recordId || 0,
            currencyId: data?.currencyId,
            dueDate: formatDateToApi(item.dueDate)
          }))

        onOk({ installments })
        window.close()
      }
    }
  })

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: formik.handleSubmit,
      disabled: false
    }
  ]

  const columns = [
    {
      component: 'date',
      label: labels.date,
      name: 'dueDate',
      props: {
        readOnly: isPosted
      }
    },
    {
      component: 'numberfield',
      label: labels.amount,
      name: 'amount',
      props: {
        maxLength: 12,
        decimalScale: 2,
        readOnly: isPosted
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: !row.dueDate }
      }
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} actions={actions} isSaved={false} isParentWindow={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('installments', value)}
            value={formik.values.installments}
            error={formik.errors.installments}
            columns={columns}
            allowDelete={!isPosted}
            allowAddNewLine={!isPosted}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

Installments.width = 600
Installments.height = 500
