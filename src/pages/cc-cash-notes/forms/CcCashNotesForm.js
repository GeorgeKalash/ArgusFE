import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { CashCountRepository } from 'src/repositories/CashCountRepository'
import { useForm } from 'src/hooks/form'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useInvalidate } from 'src/hooks/resource'

export default function CcCashNotesForm({ labels, maxAccess, currencyId, note, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const editMode = !!currencyId

  const invalidate = useInvalidate({
    endpointId: CashCountRepository.CcCashNotes.page
  })

  const { formik } = useForm({
    initialValues: {
      currencyId: currencyId || null,
      note: null
    },
    maxAccess: maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      currencyId: yup.string().required(' '),
      note: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: CashCountRepository.CcCashNotes.set,
        record: JSON.stringify(obj)
      })

      toast.success('Record Added Successfully')
      window.close()
      invalidate()
    }
  })
  useEffect(() => {
    ;(async function () {
      try {
        if (currencyId && note) {
          const res = await getRequest({
            extension: CashCountRepository.CcCashNotes.get,
            parameters: `_currencyId=${currencyId}&_note=${note}`
          })
          formik.setValues(res.record)
        }
      } catch (e) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.CashNote} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currencyName}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='note'
                label={labels.currencyNote}
                value={formik.values.note}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('note', '')}
                error={formik.touched.note && Boolean(formik.errors.note)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
