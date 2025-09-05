import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useResourceQuery } from 'src/hooks/resource'
import useSetWindow from 'src/hooks/useSetWindow'
import { DataGrid } from './DataGrid'
import { Fixed } from './Layouts/Fixed'
import WindowToolbar from './WindowToolbar'
import { formatDateToApi } from 'src/lib/date-helper'

export default function Installments({ data, onOk, window }) {
  const isPosted = data.header.status === 3

  const { labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.Installments
  })

  
  useSetWindow({ title: labels.Installments, window })

  const { formik } = useForm({
    initialValues: {
      installments: data.installments || [
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
        const installments = values.installments.map((item, index) => {
          return {
            ...item,
            id: index + 1,
            seqNo: index + 1,
            reference: data?.header?.reference,
            vendorId: data?.header?.vendorId,
            invoiceId: formik?.values?.recordId || 0,
            currencyId: data?.header?.currencyId,
            dueDate: formatDateToApi(item.dueDate)
          }
        })

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
      readOnly: isPosted
    },
    {
      component: 'numberfield',
      label: labels.amount,
      name: 'amount',
      maxLength: 12,
      decimalScale: 3,
      readOnly: isPosted
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <DataGrid
          onChange={value => formik.setFieldValue('installments', value)}
          value={formik.values.installments}
          error={formik.errors.installments}
          columns={columns}
          allowDelete={!isPosted}
          allowAddNewLine={!isPosted}
        />
      </Grow>
      <Fixed>
        <WindowToolbar actions={actions} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}

Installments.width = 600
Installments.height = 500
