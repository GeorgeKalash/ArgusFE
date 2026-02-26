import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { CashCountRepository } from '@argus/repositories/src/repositories/CashCountRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function CcCashNotesForm({ labels, maxAccess, record, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: CashCountRepository.CcCashNotes.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      currencyId: '',
      note: null
    },
    maxAccess: maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      currencyId: yup.string().required(),
      note: yup.string().required()
    }),
    onSubmit: async obj => {
      const currencyId = formik.values.currencyId
      const note = formik.values.note

      await postRequest({
        extension: CashCountRepository.CcCashNotes.set,
        record: JSON.stringify(obj)
      })

      if (!currencyId && !note) {
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)
      formik.setFieldValue('recordId', String(obj.currencyId * 10) + obj.note)
      window.close()
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (record && record.currencyId && record.note && recordId) {
        const res = await getRequest({
          extension: CashCountRepository.CcCashNotes.get,
          parameters: `_currencyId=${record.currencyId}&_note=${record.note}`
        })
        formik.setValues({
          ...res.record,
          recordId: String(res.record.currencyId * 10) + res.record.note
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.CashNote} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
