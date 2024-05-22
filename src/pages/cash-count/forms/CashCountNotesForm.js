import { Grid } from '@mui/material'
import { useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useForm } from 'src/hooks/form'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { CachCountSettingsRepository } from 'src/repositories/CachCountSettingsRepository'

export default function CashCountNotesForm({ labels, maxAccess, recordId, forceNotesCount, row, update, window }) {
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
            note: yup.string().required('currency  is required'),
            qty: yup.string().required('Country  is required')
          })
        )
        .required('Operations array is required')
    }),
    onSubmit: async obj => {
      const currencyNotes = obj.currencyNotes.map(({ id, seqNo, cashCountId, ...rest }) => ({
        seqNo: row.id,
        cashCountId: row?.cashCountId < 1 ? 0 : row?.cashCountId,
        ...rest
      }))
      update({ newRow: { ...row, currencyNotes } })

      const counted = obj.currencyNotes.reduce((acc, { subTotal }) => {
        return acc + (subTotal || 0)
      }, 0)
      forceNotesCount && update({ newRow: { ...row, counted } })

      window.close()
    }
  })
  useEffect(() => {
    console.log(row?.currencyNotes, row?.id)
    row?.id &&
      row?.currencyNotes?.length > 0 &&
      formik.setFieldValue(
        'currencyNotes',
        row.currencyNotes?.map(({ id, qty, note, ...rest }, index) => ({
          id: index + 1,
          qty,
          note,
          subTotal: qty * note,
          ...rest
        }))
      )
  }, [recordId])

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
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('currencyNotes', value)}
            value={formik.values.currencyNotes}
            error={formik.errors.currencyNotes}
            columns={[
              {
                component: 'resourcecombobox',
                label: labels.note,
                name: 'note',
                props: {
                  endpointId: CachCountSettingsRepository.CcCashNotes.qry,
                  parameters: `_currencyId=` + row.currencyId,
                  valueField: 'note',
                  displayField: 'note',
                  mapping: [{ from: 'note', to: 'note' }],
                  columnsInDropDown: [
                    { key: 'note', value: 'Note' },
                    { key: 'currencyRef', value: 'Currency' }
                  ],
                  displayFieldWidth: 2
                },
                async onChange({ row: { update, newRow } }) {
                  const qty = newRow?.qty || 0
                  const note = newRow?.note || 0
                  update({
                    subTotal: note * qty
                  })
                }
              },

              {
                component: 'numberfield',
                label: labels.qty,
                name: 'qty',
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
