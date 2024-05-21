import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { MasterSource } from 'src/resources/MasterSource'

export default function TaxCodesForm({ labels, maxAccess, setStore, store }) {
  const { recordId } = store
  const [editMode, setEditMode] = useState(!!recordId)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.TaxCodes.qry
  })

  const { formik } = useForm({
    initialValues: { recordId: null, name: '', reference: '', nonDeductible: false },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      reference: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: FinancialRepository.TaxCodes.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        setStore(prevStore => ({
          ...prevStore,
          recordId: response.recordId
        }))
        toast.success('Record Added Successfully')
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success('Record Edited Successfully')
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: FinancialRepository.TaxCodes.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  const actions = [
    {
      key: 'Integration Account',
      condition: true,
      onClick: 'onClickGIA',
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.TaxCodes}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      masterSource={MasterSource.TaxCode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>

            <Grid item sx={{ pb: '10px' }} xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='nonDeductible'
                    maxAccess={maxAccess}
                    checked={formik.values?.nonDeductible}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.nonDeductible}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
