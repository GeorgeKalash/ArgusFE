import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useForm } from 'src/hooks/form'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { CashCountRepository } from 'src/repositories/CashCountRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import CustomTextField from 'src/components/Inputs/CustomTextField'

export default function CashCountNotesForm({
  labels,
  maxAccess,
  recordId,
  forceNotesCount,
  row,
  updateRow,
  readOnly,
  window
}) {
  const { getRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      total: 0,
      currencyNotes: [{ id: 1, seqNo: '', cashCountId: 0, note: '', qty: '', subTotal: '' }]
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      currencyNotes: yup
        .array()
        .of(
          yup.object().shape({
            note: yup.string().required('currency  is required')
          })
        )
        .required('Operations array is required')
    }),
    onSubmit: async obj => {
      const currencyNotes = obj.currencyNotes
        .filter(item => item.qty > 0)
        ?.map(({ id, seqNo, cashCountId, qty, ...rest }) => ({
          seqNo: row.id,
          qty,
          cashCountId: row?.cashCountId < 1 ? 0 : row?.cashCountId,
          ...rest
        }))

      const counted = obj.currencyNotes.reduce((acc, { subTotal }) => {
        return acc + (subTotal || 0)
      }, 0)

      forceNotesCount
        ? updateRow({
            changes: {
              ...row,
              counted,
              currencyNotes,
              variation: counted - row.system,
              flag: row.system === counted ? true : false
            }
          })
        : updateRow({ changes: { ...row, currencyNotes } })

      window.close()
    }
  })
  useEffect(() => {
    row?.id && getGridData()
  }, [recordId])

  const getGridData = async () => {
    console.log('row.currencyNotes', row.currencyNotes)
    const parameters = `_currencyId=` + row.currencyId

    const { list } = await getRequest({
      extension: CashCountRepository.CcCashNotes.qry,
      parameters: parameters
    })

    const currencyNotes = row.currencyNotes?.map(({ id, qty, note, ...rest }, index) => ({
      id: index + 1,
      qty,
      note,
      subTotal: qty * note,
      ...rest
    }))

    const notes = list?.map(({ ...rest }, index) => ({
      id: index + 1,
      ...rest
    }))

    const finalList = notes.map(x => {
      const n = {
        id: x.id,
        note: x.note,
        seqNo: null,
        qty: '',
        subTotal: 0
      }

      const currencyNote = currencyNotes?.find(y => n.note === y.note)

      if (currencyNote) {
        n.qty = currencyNote.qty
        n.seqNo = currencyNote.seqNo
        n.subTotal = currencyNote.subTotal
      }

      return n
    })
    formik.setFieldValue('currencyNotes', finalList)
  }

  const total = formik.values?.currencyNotes?.reduce((acc, { subTotal }) => {
    return acc + (subTotal || 0)
  }, 0)

  return (
    <FormShell
      resourceId={ResourceIds.CashAccounts}
      form={formik}
      maxAccess={maxAccess}
      isCleared={false}
      isInfo={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container xs={6}>
            <CustomTextField name='reference' label={labels.currency} value={row.currencyRef} readOnly />
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('currencyNotes', value)}
            value={formik.values.currencyNotes}
            error={formik.errors.currencyNotes}
            columns={[
              {
                component: 'numberfield',
                label: labels.note,
                name: 'note',
                props: {
                  readOnly: true
                }
              },

              {
                component: 'numberfield',
                label: labels.qty,
                name: 'qty',
                props: {
                  readOnly: readOnly
                },
                async onChange({ row: { update, newRow } }) {
                  const note = newRow?.note || 0
                  const qty = newRow?.qty || 0
                  update({
                    subTotal: qty * note
                  })
                }
              },
              {
                component: 'numberfield',
                label: labels.subTotal,
                name: 'subTotal',
                props: { readOnly: true }
              }
            ]}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={4} sx={{ mb: 3, display: 'flex', justifyContent: 'right' }}>
            <Grid item xs={4}>
              <CustomNumberField name='total' label={labels.total} value={total} readOnly={true} />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
