import { Grid, FormControlLabel, Checkbox } from '@mui/material'
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
import { getFormattedNumberMax, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'

export default function CountryForm({ labels, maxAccess, recordId }) {
  const [editMode, setEditMode] = useState(!!recordId)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.Country.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      reference: '',
      flName: '',
      currencyId: null,
      regionId: null,
      ibanLength: '',
      isInactive: false,
      currencyRef: null,
      currencyName: null,
      regionRef: null,
      regionName: null,
      isoCode1: '',
      isoCode2: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      ibanLength: yup
        .number()
        .transform((value, originalValue) => validateNumberField(value, originalValue))
        .min(0, 'Value must be greater than or equal to 0')
        .max(32767, 'Value must be less than or equal to 32,767'),
      name: yup.string().required(' '),
      reference: yup.string().required(' '),
      flName: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      obj.ibanLength = getNumberWithoutCommas(obj.ibanLength)
      const recordId = obj.recordId

      const response = await postRequest({
        extension: SystemRepository.Country.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
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
            extension: SystemRepository.Country.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell reso urceId={ResourceIds.Countries} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                readOnly={editMode}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='flName'
                label={labels.fLang}
                value={formik.values.flName}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('flName', '')}
                error={formik.touched.flName && Boolean(formik.errors.flName)}
                maxLength='30'
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('currencyId', newValue?.recordId)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.GeographicRegion.qry}
                name='regionId'
                label={labels.geoRegion}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('regionId', newValue?.recordId)
                }}
                error={formik.touched.regionId && Boolean(formik.errors.regionId)}
                maxAccess={maxAccess}
                parameters='_startAt=0&_pageSize=1000'
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='ibanLength'
                label={labels.ibanLength}
                value={formik.values.ibanLength && getFormattedNumberMax(formik.values.ibanLength, 5, 0)}
                onChange={e => formik.setFieldValue('ibanLength', getFormattedNumberMax(e.target.value, 5, 0))}
                onClear={() => formik.setFieldValue('ibanLength', '')}
                error={formik.touched.ibanLength && Boolean(formik.errors.ibanLength)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='isoCode1'
                label={labels.IsoCode1}
                value={formik.values.isoCode1}
                maxLength='3'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('isoCode1', '')}
                error={formik.touched.isoCode1 && Boolean(formik.errors.isoCode1)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='isoCode2'
                label={labels.IsoCode2}
                value={formik.values.isoCode2}
                maxLength='3'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('isoCode1', '')}
                error={formik.touched.isoCode2 && Boolean(formik.errors.isoCode2)}
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
