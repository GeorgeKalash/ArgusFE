import { useFormik } from 'formik'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useError } from 'src/error'
import toast from 'react-hot-toast'
import { SystemRepository } from 'src/repositories/SystemRepository'
import FormShell from 'src/components/Shared/FormShell'
import { useWindow } from 'src/windows'
import { Button, Grid } from '@mui/material'
import * as yup from 'yup'

async function getRate({ currencyId }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (currencyId === 2) resolve(14.2)
      else if (currencyId == 162) resolve(2)
      else reject(new Error('Currency rate not found.'))
    }, 1000)
  })
}

function Form() {
  const { stack } = useError()

  const formik = useFormik({
    validationSchema: yup.object().shape({
      operations: yup
        .array()
        .of(
          yup.object().shape({
            currency: yup
              .object()
              .shape({
                recordId: yup.string().required('Currency recordId is required')
              })
              .required('Currency is required'),
            rate: yup.number().nullable().required('Rate is required'),
            fcAmount: yup.number().min(0.1).required('FcAmount is required'),
            lcAmount: yup.number().min(0.1).required('LcAmount is required')
          })
        )
        .required('Operations array is required')
    }),
    initialValues: {
      operations: [
        {
          id: 1,
          currency: {
            reference: 'AED',
            recordId: 2
          },
          rate: 12.6,
          fcAmount: 31,
          lcAmount: 87
        }
      ]
    },
    onSubmit(values) {
      console.log(values)
      toast.success('Record Added Successfully')
    }
  })

  const { values, setFieldValue, errors } = formik

  return (
    <FormShell form={formik}>
      <Grid container>
        <DataGrid
          onChange={value => setFieldValue('operations', value)}
          value={values.operations}
          error={errors.operations}
          columns={[
            {
              component: 'id',
              name: 'id',
              width: 50
            },
            {
              component: 'resourcelookup',
              name: 'country',
              props: {
                endpointId: SystemRepository.City.snapshot,
                parameters: {
                  _countryId: 1,
                  _stateId: 0
                },
                displayField: 'name',
                valueField: 'name'
              },
              width: 200
            },
            {
              component: 'date',
              name: 'date',
              width: 200
            },
            {
              component: 'resourcecombobox',
              name: 'currency',
              props: {
                endpointId: SystemRepository.Currency.page,
                parameters: `_startAt=0&_pageSize=10000&filter=`,
                valueField: 'recordId',
                displayField: 'reference'
              },
              async onChange({ row: { update, oldRow, newRow } }) {
                try {
                  if (!newRow.currency || oldRow.currency.recordId === newRow.currency.recordId) return
                  const rate = await getRate({ currencyId: newRow.currency.recordId })

                  update({
                    rate,
                    lcAmount: 0
                  })
                } catch (exception) {
                  stack({ message: `Cannot find rate for ${newRow.currency.reference}` })
                }
              }
            },
            {
              component: 'numberfield',
              name: 'rate',
              props: {
                readOnly: true
              },
              width: 100,
              defaultValue: 0
            },
            {
              component: 'numberfield',
              name: 'fcAmount',
              async onChange({ row: { update, newRow } }) {
                update({
                  lcAmount: newRow.rate * newRow.fcAmount
                })
              },
              width: 200,
              defaultValue: 0
            },
            {
              component: 'numberfield',
              name: 'lcAmount',
              props: {
                readOnly: true
              },
              width: 200,
              defaultValue: 0
            }
          ]}
        />
      </Grid>
      <Button>Some random Button to mess with layout</Button>
    </FormShell>
  )
}

export default function Page() {
  const { stack } = useWindow()

  return (
    <Button
      onClick={() => {
        stack({
          Component: Form,
          title: 'Demo',
          width: 1300,
          height: 500
        })
      }}
    >
      Open Form
    </Button>
  )
}
