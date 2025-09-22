import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ControlContext } from 'src/providers/ControlContext'
import { FinancialStatementRepository } from 'src/repositories/FinancialStatementRepository'

export default function StatementForm({ labels, maxAccess, setStore, store }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store
  const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: FinancialStatementRepository.FinancialStatement.page
  })

  const formik = useFormik({
    initialValues: {
      recordId: null,
      name: ''
    },
    validationSchema: yup.object({
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: FinancialStatementRepository.FinancialStatement.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        formik.setFieldValue('recordId', res.recordId)
        setStore(prevStore => ({
          ...prevStore,
          recordId: res.recordId
        }))
      }
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: FinancialStatementRepository.FinancialStatement.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.FinancialStatements} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels.name}
            value={formik.values.name}
            maxLength='50'
            required
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
