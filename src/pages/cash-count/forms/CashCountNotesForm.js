import { Grid } from '@mui/material'
import { useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useForm } from 'src/hooks/form'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { CachCountSettingsRepository } from 'src/repositories/CachCountSettingsRepository'

export default function CashCountNotesForm({ labels, maxAccess, recordId, formik2, row, window }) {
  const [editMode, setEditMode] = useState(!!recordId)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      total: 0,
      currencyNotes: [{ id: 1, seqNo: 1, cashCountId: '', note: '', qty: '', subTotal: '' }]
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
        cashCountId: row.cashCountId,
        ...rest
      }))
      formik2.setValues({
        ...formik2.values,
        currencyNotes: [
          ...formik2.values.currencyNotes.filter(note => note.seqNo !== row.id), // Spread existing currencyNotes from formik2
          ...currencyNotes // Spread new currencyNotes from formik
        ]
      })

      // formik2.setValues({ ...formik2.values, currencyNotes: { currencyNotes, ...formik.values.currencyNotes } })

      const total = obj.currencyNotes.reduce((acc, { subTotal }) => {
        return acc + (subTotal || 0)
      }, 0)

      formik2.values.forceNotesCount && formik2.setFieldValue(`items[${row.id}].counted`, total)
      window.close()
    }
  })
  useEffect(() => {
    formik.setValues([{ id: 1, seqNo: 1, cashCountId: '', note: '', qty: '', subTotal: '' }])
    row?.id &&
      formik.setValues({
        currencyNotes: formik2.values.currencyNotes
          .filter(note => note.seqNo == row.id)
          ?.map(({ id, ...rest }, index) => ({
            id: index + 1,
            ...rest
          }))
      })
  }, [recordId])

  const total = formik.values?.currencyNotes?.reduce((acc, { subTotal }) => {
    return acc + (subTotal || 0)
  }, 0)

  return (
    <FormShell resourceId={ResourceIds.CashAccounts} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('currencyNotes', value)}
            value={formik.values.currencyNotes}
            error={formik.errors.currencyNotes}
            columns={[
              // {
              //   component: 'numberfield',
              //   label: labels.note,
              //   name: 'note',
              //   async onChange({ row: { update, newRow } }) {
              //     const qty = newRow.qty || 0
              //     const note = newRow.note || 0
              //     update({
              //       subTotal: note * qty
              //     })
              //   }
              // },
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
                  const qty = newRow.qty || 0
                  const note = newRow.note || 0
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
                  const note = newRow.note || 0
                  const qty = newRow.qty || 0
                  update({
                    subTotal: qty * note
                  })
                }
              },
              {
                component: 'numberfield',
                label: labels.subTotal,
                name: 'subTotal',
                disable: true
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
