import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { MasterSource } from '@argus/shared-domain/src/resources/MasterSource'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function TaxSchedulesForm({ labels, maxAccess, setStore, store, editMode }) {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.TaxSchedules.qry
  })

  const { formik } = useForm({
    initialValues: { recordId: null, name: '', reference: '', nonDeductible: false },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: FinancialRepository.TaxSchedules.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        setStore(prevStore => ({
          ...prevStore,
          recordId: response.recordId
        }))
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      }
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: FinancialRepository.TaxSchedules.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  const actions = [
    {
      key: 'Integration Account',
      condition: true,
      onClick: 'onClickGIA',
      masterSource: MasterSource.TaxCode,
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.TaxSchedules}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
