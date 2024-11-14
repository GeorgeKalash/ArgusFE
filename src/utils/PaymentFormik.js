import * as yup from 'yup'

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
    receiptRef: ''
  }
]

export { initialValuePayment }

export function usePaymentValidationSchema(name) {
  return yup
    .array()
    .of(
      yup.object().shape({
        type: yup
          .string()
          .required('Type is required')
          .test('unique', 'Type must be unique', function (value) {
            const { options } = this
            const arrayOfTypes = options.context?.[name].map(row => row.type)
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
}
