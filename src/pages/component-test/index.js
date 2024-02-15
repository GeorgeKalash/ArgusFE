import { useFormik } from 'formik'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useError } from 'src/error'
import toast from 'react-hot-toast'
import { SystemRepository } from 'src/repositories/SystemRepository'
import FormShell from 'src/components/Shared/FormShell'
import { useWindow } from 'src/windows'
import { Button, Grid } from '@mui/material'
import * as yup from 'yup'
import FieldSet from 'src/components/Shared/FieldSet'

async function getRate({ currencyId }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (currencyId === 2) resolve(14.2)
      else if (currencyId == 162) resolve(2)
      else reject()
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
            rate: yup.mixed().nullable().required('Rate is required'),
            fcAmount: yup.mixed().nullable().required('FcAmount is required'),
            lcAmount: yup.mixed().nullable().required('LcAmount is required')
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
        <FieldSet title='Operations'>
          <DataGrid
            onChange={value => setFieldValue('operations', value)}
            value={values.operations}
            error={errors.operations}
            columns={[
              {
                component: 'id',
                name: 'id'
              },
              {
                component: 'resourcecombobox',
                name: 'currency',
                props: {
                  endpointId: SystemRepository.Currency.page,
                  parameters: `_startAt=0&_pageSize=10000&filter=`,
                  valueFiel: 'recordId',
                  displayField: 'reference'
                },
                async onChange({ row: { update, newRow } }) {
                  try {
                    if (!newRow.currency) return
                    const rate = await getRate({ currencyId: newRow.currency.recordId })

                    update({
                      rate
                    })
                  } catch (exception) {
                    stack({ message: `Cannot find rate for ${newRow.currency.reference}` })
                  }
                }
              },
              {
                component: 'textfield',
                name: 'rate',
                props: {
                  readOnly: true
                }
              },
              {
                component: 'textfield',
                name: 'fcAmount',
                async onChange({ row: { update, newRow } }) {
                  update({
                    lcAmount: parseFloat(newRow.rate) * parseFloat(newRow.fcAmount)
                  })
                }
              },
              {
                component: 'textfield',
                name: 'lcAmount',
                props: {
                  readOnly: true
                }
              }
            ]}
          />
        </FieldSet>
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
          width: 1200,
          height: 500
        })
      }}
    >
      Open Form
    </Button>
  )
}
