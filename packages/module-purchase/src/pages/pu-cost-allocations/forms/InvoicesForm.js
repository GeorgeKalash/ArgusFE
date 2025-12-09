import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { CostAllocationRepository } from '@argus/repositories/src/repositories/CostAllocationRepository'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import * as yup from 'yup'

const InvoicesForm = ({ store, setStore, maxAccess, labels, editMode }) => {
  const { recordId, isPosted, isClosed } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const conditions = {
    invoiceId: row => row?.invoiceId
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    validateOnChange: true,
    maxAccess,
    conditionSchema: ['items'],
    initialValues: {
      caId: recordId,
      items: [
        {
          id: 1,
          caId: recordId,
          invoiceId: null,
          invoiceRef: '',
          currencyRef: null,
          date: null,
          amount: null,
          baseAmount: null,
          vendorName: ''
        }
      ]
    },
    validationSchema: yup.object({
      items: yup.array().of(schema)
    }),
    onSubmit: async values => {
      const item = values.items
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        .map(({ id, ...item }) => ({
          ...item,
          caId: recordId,
          date: formatDateToApi(item.date)
        }))

      const data = { caId: recordId, items: item }

      await postRequest({
        extension: CostAllocationRepository.Invoice.set2,
        record: JSON.stringify(data)
      }).then(res => {
        toast.success(platformLabels.Edited)
      })
      await getRequest({
        extension: CostAllocationRepository.InvoicesItems.qry,
        parameters: `_invoiceId=0&_caId=${recordId}`
      }).then(res2 => {
        setStore(prevStore => ({
          ...prevStore,
          invoicesItemsData: res2
        }))
      })
    }
  })

  useEffect(() => {
    if (recordId) {
      getRequest({
        extension: CostAllocationRepository.Invoice.qry,
        parameters: `_caId=${recordId}`
      }).then(res => {
        if (res?.list?.length > 0) {
          const items = res.list.map((item, index) => ({
            ...item,
            id: index + 1,
            date: formatDateFromApi(item.date)
          }))
          formik.setValues({ ...formik.values, items: items })
        }
      })
    }
  }, [])

  return (
    <Form
      onSave={formik.handleSubmit}
      maxAccess={maxAccess}
      disabledSubmit={isPosted || isClosed}
      editMode={editMode}
      isParentWindow={false}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            disabled={isPosted || isClosed}
            allowDelete={!isPosted && !isClosed}
            columns={[
              {
                component: 'resourcelookup',
                label: labels.reference,
                name: 'invoiceId',
                flex: 1,
                props: {
                  valueField: 'reference',
                  displayField: 'reference',
                  endpointId: PurchaseRepository.PurchaseInvoiceHeader.snapshot,
                  mapping: [
                    { from: 'recordId', to: 'invoiceId' },
                    { from: 'reference', to: 'invoiceRef' },
                    { from: 'currencyRef', to: 'currencyRef' },
                    { from: 'amount', to: 'amount' },
                    { from: 'baseAmount', to: 'baseAmount' },
                    { from: 'vendorName', to: 'vendorName' },
                    { from: 'date', to: 'date' }
                  ],
                  columnsInDropDown: [{ key: 'reference', value: 'Reference' }]
                },
                onChange({ row: { update, newRow } }) {
                  const formattedDate = newRow?.date ? formatDateFromApi(newRow?.date) : ''
                  update({
                    date: formattedDate
                  })
                }
              },
              {
                component: 'date',
                name: 'date',
                flex: 1,
                props: { readOnly: true },
                width: 200
              }
            ]}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default InvoicesForm
