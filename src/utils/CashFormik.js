import * as yup from 'yup'

const initialValueCash = () => {
  return [
    {
      id: 1,
      seqNo: 0,
      cashAccountId: cashAccountId,
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
}

const validateCash = () => {
  return yup
    .array()
    .of(
      yup.object().shape({
        type: yup
          .string()
          .required('Type is required')
          .test('unique', 'Type must be unique', function (value) {
            const { options } = this
            if (!this.parent.outwardId) {
              const arrayOfTypes = options.context.cash.map(row => row.type)
              if (value == 2) {
                const countOfType1 = arrayOfTypes.filter(item => item === '2').length
                if (countOfType1 > 1) {
                  return false
                }
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

export { initialValueCash, validateCash }
