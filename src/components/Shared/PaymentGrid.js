import React from 'react'
import { DataSets } from 'src/resources/DataSets'
import { DataGrid } from './DataGrid'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

export default function PaymentGrid({ isPosted, value, amount, ...rest }) {
  const { labels: labels } = useResourceQuery({
    datasetId: ResourceIds?.POSPayment
  })

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.type,
      name: 'type',
      props: {
        datasetId: DataSets.CA_CASH_ACCOUNT_TYPE,
        displayField: 'value',
        valueField: 'key',
        mapping: [
          { from: 'key', to: 'type' },
          { from: 'value', to: 'typeName' }
        ],
        readOnly: isPosted
      },
      async onChange({ row: { update, newRow } }) {
        const sumAmount = value.slice(0, -1).reduce((sum, row) => {
          const curValue = parseFloat(row.amount.toString().replace(/,/g, '')) || 0

          return sum + curValue
        }, 0)
        const currentAmount = (parseFloat(amount) - parseFloat(sumAmount)).toFixed(2)
        update({ amount: currentAmount, POS: newRow.type === '1' })
      }
    },
    {
      component: 'numberfield',
      name: 'paidAmount',
      label: labels?.paidAmount,
      defaultValue: '',
      async onChange({ row: { update, newRow } }) {
        const sumAmount = value.slice(0, -1).reduce((sum, row) => {
          const curValue = parseFloat(row.amount.toString().replace(/,/g, '')) || 0

          return sum + curValue
        }, 0)

        let rowAmount
        let returnedAmount

        if (value.length === 1) {
          rowAmount = newRow.paidAmount > sumAmount ? newRow.paidAmount : sumAmount - newRow.paidAmount
          returnedAmount = (parseFloat(newRow.paidAmount) - parseFloat(amount)).toFixed(2)
        } else {
          const remainingAmount = (parseFloat(amount) - parseFloat(sumAmount)).toFixed(2)
          returnedAmount = (parseFloat(newRow.paidAmount) - parseFloat(remainingAmount)).toFixed(2)
          rowAmount = returnedAmount > 0 ? newRow.paidAmount - returnedAmount : newRow.paidAmount
        }

        update({
          returnedAmount: returnedAmount,
          amount: parseFloat(rowAmount).toFixed(2)
        })
      }
    },
    {
      component: 'numberfield',
      name: 'returnedAmount',
      label: labels.returnedAmount,
      defaultValue: '',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'amount',
      label: labels?.Amount,
      defaultValue: '',
      props: {
        readOnly: isPosted
      }
    },
    {
      component: 'numberfield',
      header: labels.bankFees,
      name: 'bankFees',
      label: labels?.bankFees,
      props: {
        readOnly: isPosted
      }
    },
    {
      component: 'textfield',
      header: labels?.receiptRef,
      name: 'receiptRef',
      label: labels?.receiptRef,
      props: {
        readOnly: isPosted
      }
    },
    {
      component: 'resourcecombobox',
      label: labels?.posStatusName,
      name: 'posStatusName',
      props: {
        readOnly: true,
        datasetId: DataSets.RT_POSSTATUS,
        displayField: 'value',
        valueField: 'key',
        mapping: [
          { from: 'value', to: 'posStatusName' },
          { from: 'key', to: 'posStatus' }
        ]
      }
    },
    {
      component: 'button',
      name: 'POS',
      label: labels.pos,
      onClick: (e, row, update, updateRow) => {
        stack({
          Component: POSForm,
          props: {},
          width: 700,
          title: labels?.POS
        })
      }
    }
  ]

  return <DataGrid columns={columns} value={value} {...rest} />
}
