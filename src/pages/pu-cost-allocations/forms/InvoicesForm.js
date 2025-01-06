import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { CostAllocationRepository } from 'src/repositories/CostAllocationRepository'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { ControlContext } from 'src/providers/ControlContext'

const InvoicesForm = ({ store, maxAccess, labels, editMode }) => {
  const { recordId, isPosted } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    maxAccess,
    initialValues: {
      caId: recordId || null,
      items: [
        {
          id: 1,
          caId: recordId || null,
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
    onSubmit: async values => {
      const item = formik.values.items.map((item, index) => ({
        ...item,
        id: index + 1,
        date: formatDateToApi(item.date)
      }))

      const data = { ...values, items: item }

      const res = await postRequest({
        extension: CostAllocationRepository.Invoice.set2,
        record: JSON.stringify(data)
      })
      toast.success(platformLabels.Edited)
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
    <FormShell
      form={formik}
      resourceId={ResourceIds.TaxCodes}
      maxAccess={maxAccess}
      infoVisible={false}
      isSavedClear={false}
      isCleared={false}
      disabledSubmit={isPosted}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            disabled={isPosted}
            allowDelete={!isPosted}
            columns={[
              {
                component: 'resourcelookup',
                label: labels.reference,
                name: 'invoiceId',
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
                  columnsInDropDown: [
                    { key: 'reference', value: 'Reference' },
                    { key: 'date', value: 'date' }
                  ]
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
                props: { readOnly: true },
                width: 200
              }
            ]}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default InvoicesForm
