import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

export default function StatesForm({ labels, maxAccess, recordId }) {
  const [editMode, setEditMode] = useState(!!recordId)
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.State.page
  })

  const { formik } = useForm({
    initialValues: { recordId: null, name: '', flName: '', countryId: '', reference: '', isInactive: false },
    enableReinitialize: true,
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      countryId: yup.string().required(),
      reference: yup.string().required()
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: SystemRepository.State.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success(platformLabels.Edited)
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: SystemRepository.State.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues({
            ...res.record,
            isInactive: Boolean(res.record.isInactive)
          })
        }
      } catch (exception) {}
    })()
  }, [recordId])

  return (
    <FormShell resourceId={ResourceIds.States} form={formik} maxAccess={maxAccess} editMode={editMode}>
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
                maxLength='40'
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
                maxLength='40'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='flName'
                label={labels.flName}
                value={formik.values.flName}
                maxAccess={maxAccess}
                maxLength='40'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('flName', '')}
                error={formik.touched.flName && Boolean(formik.errors.flName)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='countryId'
                required
                label={labels.countryId}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('countryId', newValue?.recordId)
                }}
                error={formik.touched.countryId && Boolean(formik.errors.countryId)}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomCheckBox
                name='isInactive'
                value={formik.values?.isInactive}
                onChange={event => formik.setFieldValue('isInactive', event.target.checked)}
                label={labels.isInactive}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
