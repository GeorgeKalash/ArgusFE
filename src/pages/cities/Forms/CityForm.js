import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

export default function CityForm({ labels, recordId, maxAccess }) {
  const [editMode, setEditMode] = useState(!!recordId)
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.City.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      flName: '',
      reference: '',
      countryId: null,
      stateId: null,
      countryName: '',
      stateName: '',
      isInactive: false
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,

    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required(),
      countryId: yup.string().required()
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: SystemRepository.City.set,
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
            extension: SystemRepository.City.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues({
            ...res.record,
            isInactive: Boolean(res.record.isInactive)
          })
        }
      } catch {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Cities} form={formik} maxAccess={maxAccess} editMode={editMode}>
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
                error={formik.touched.reference && formik.errors.reference}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && formik.errors.name}
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
                label={labels.country}
                valueField='recordId'
                displayField='name'
                readOnly={editMode}
                displayFieldWidth={1}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('countryId', newValue?.recordId || '')
                }}
                error={formik.touched.countryId && formik.errors.countryId}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.State.qry}
                parameters={formik.values.countryId && `_countryId=${formik.values.countryId}`}
                name='stateId'
                label={labels.state}
                valueField='recordId'
                displayField='name'
                readOnly={(editMode || !formik.values.countryId) && true}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('stateId', newValue?.recordId)
                }}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='isInactive'
                    maxAccess={maxAccess}
                    checked={formik.values?.isInactive}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.isInactive}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
