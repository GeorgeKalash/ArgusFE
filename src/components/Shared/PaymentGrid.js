import React, { useEffect } from 'react'
import { DataSets } from 'src/resources/DataSets'
import { DataGrid } from './DataGrid'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import * as yup from 'yup'
import { useWindow } from 'src/windows'
import POSForm from 'src/pages/rt-receipt-vouchers/forms/POSForm'

export default function PaymentGrid({ isPosted, value, amount, ...rest }) {
  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds?.POSPayment
  })
  const { stack } = useWindow()

  useEffect(() => {
    const initialValuePayment = [
      {
        id: 1,
        seqNo: 0,
        cashAccountId: null,
        cashAccount: '',
        posStatus: 1,
        posStatusName: '',
        type: '',
        amount: '',
        paidAmount: 0,
        returnedAmount: 0,
        bankFees: '',
        receiptRef: '',
        pos: true
      }
    ]

    const paymentValidation = yup
      .array()
      .of(
        yup.object().shape({
          type: yup
            .string()
            .required('Type is required')
            .test('unique', 'Type must be unique', function (value) {
              const { options } = this

              const arrayOfTypes = options.context?.[rest.name].map(row => row.type)
              if (value == 2) {
                const countOfType1 = arrayOfTypes.filter(item => item === '2').length
                if (countOfType1 > 1) {
                  return false
                }
              }

              return true
            }),
          paidAmount: yup.string().test('Paid Amount', 'Paid Amount is required', function (value) {
            if (this.parent.type == '2') {
              return !!value
            }

            return true
          }),
          returnedAmount: yup.string().test('Returned Amount', 'Returned Amount is required', function (value) {
            if (this.parent.type == '2') {
              return !!value
            }

            return true
          }),
          amount: yup.string().nullable().required('Amount is required')
        })
      )
      .required('Cash array is required')

    rest.setFormik({ ...initialValuePayment, paymentValidation })
  }, [rest.name])

  const calculate = values => {
    const totalPaidAmount = values.reduce((sum, current) => sum + parseFloat(current.paidAmount || 0), 0)
    const cashAmount = value?.find(item => item?.type === '2')?.paidAmount

    const amountValue = amount + parseFloat(cashAmount || 0) - parseFloat(totalPaidAmount || 0)

    const val = values.map(item =>
      item.type === '2'
        ? {
            ...item,
            returnedAmount: (parseFloat(totalPaidAmount || 0) - parseFloat(amount)).toFixed(2),
            amount: amountValue
          }
        : item
    )

    rest.onChange(val)
  }

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
      propsReducer({ row, props }) {
        return { ...props, readOnly: row.paidAmount > 0 }
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
      async onChange({ row: { update, newRow, updateRow } }) {
        const totalPaidAmount =
          value
            ?.reduce((sum, current) => (current.id !== newRow.id ? sum + parseFloat(current.paidAmount || 0) : sum), 0)
            ?.toFixed(2) || 0

        const returnValue = (
          parseFloat(newRow.paidAmount || 0) +
          parseFloat(totalPaidAmount || 0) -
          parseFloat(amount || 0)
        ).toFixed(2)

        if (newRow?.type !== '2') {
          update({
            returnedAmount: 0,
            amount: newRow.paidAmount
          })

          const index = value?.find(item => item?.type === '2')?.id

          const cashAmount = value?.find(item => item?.type === '2')?.paidAmount

          updateRow({
            id: index,
            changes: {
              returnedAmount: returnValue,
              amount:
                amount +
                parseFloat(cashAmount || 0) -
                parseFloat(totalPaidAmount || 0) -
                parseFloat(newRow.paidAmount || 0)
            }
          })
        } else {
          update({
            returnedAmount: returnValue,
            amount: (parseFloat(amount || 0) - parseFloat(totalPaidAmount || 0)).toFixed(2)
          })
        }
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
      name: 'pos',
      props: {
        imgSrc: '/images/buttonsIcons/open-external.png'
      },
      label: labels.pos,
      onClick: (e, row, update, updateRow) => {
        stack({
          Component: POSForm,
          props: { labels, form: rest.formik, amount: row?.amount, maxAccess: access },
          width: 700,
          title: labels?.pos
        })
      }
    }
  ]

  return (
    <DataGrid
      {...rest}
      columns={columns}
      onChange={(value, action) => {
        rest.onChange(value, action)
        if (action === 'delete' && Array.isArray(value)) {
          calculate(value)
        }
      }}
      value={value}
    />
  )
}
