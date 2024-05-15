// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import FormControlLabel from '@mui/material/FormControlLabel'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import Checkbox from '@mui/material/Checkbox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi, formatDateDefault } from 'src/lib/date-helper'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { SystemRepository } from 'src/repositories/SystemRepository'

export default function NumberRangeForm({ labels, maxAccess, recordId }) {
  const [dateRanges, setDateRange] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    reference: '',
    description: '',
    min: '',
    max: '',
    current: '',
    external: false,
    dateRange: false,
    startDate: '',
    endDate: ''
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.NumberRange.qry
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      description: yup.string().required('This field is required'),
      min: yup.string().required('This field is required'),
      max: yup.string().required('This field is required'),
      current: yup.string().required('This field is required'),

      startDate: !!dateRanges ? yup.string().required() : yup.date().nullable(),
      endDate: !!dateRanges ? yup.string().required() : yup.date().nullable()
    }),

    onSubmit: async obj => {
      const data = { ...obj }
      const recordId = obj.recordId

      if (dateRanges) {
        data.startDate = formatDateToApi(data.startDate)
        data.endDate = formatDateToApi(data.endDate)
      }

      const response = await postRequest({
        extension: SystemRepository.NumberRange.set,
        record: JSON.stringify(data)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
      } else {
        toast.success('Record Edited Successfully')
      }

      setEditMode(true)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: SystemRepository.NumberRange.get,
            parameters: `_recordId=${recordId}`
          })
          if (res.record) {
            ;(res.record.startDate = formatDateFromApi(res.record.startDate)),
              (res.record.endDate = formatDateFromApi(res.record.endDate)),
              setInitialData(res.record)
            setDateRange(res.record.dateRange)
          }
        }
      } catch (exception) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.NumberRange} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            required
            maxLength='10'
            rows={2}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='description'
            label={labels.description}
            value={formik.values.description}
            rows={2}
            required
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('description', '')}
            error={formik.touched.description && Boolean(formik.errors.description)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='min'
            label={labels.min}
            value={formik.values.min}
            required
            type=''
            maxLength='15'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('min', '')}
            error={formik.touched.max && Boolean(formik.errors.min)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='max'
            label={labels.max}
            value={formik.values.max}
            required
            type=''
            maxLength='15'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('max', '')}
            error={formik.touched.max && Boolean(formik.errors.max)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='current'
            label={labels.current}
            value={formik.values.current}
            required
            type='number'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('current', '')}
            error={formik.touched.current && Boolean(formik.errors.current)}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox name='external' checked={formik.values?.external} onChange={formik.handleChange} />}
            label={labels.external}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name='dateRange'
                checked={formik.values?.dateRange}
                onChange={(e, newValue) => {
                  formik.setFieldValue('dateRange', newValue)

                  formik.setFieldValue('startDate', null)
                  formik.setFieldValue('endDate', null)
                  setDateRange(newValue)
                  formik.handleChange(e)
                }}
              />
            }
            label={labels.dateRange}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            opacity: !formik.values.dateRange ? 0.4 : 1,
            pointerEvents: !formik.values.dateRange ? 'none' : 'auto'
          }}
        >
          <CustomDatePicker
            name='startDate'
            label={labels.startDate}
            value={formik.values.startDate}
            required={formik.values.dateRange && true}
            readOnly={!formik.values.dateRange && true}
            onChange={formik.setFieldValue}
            maxAccess={maxAccess}
            onClear={() => formik.setFieldValue('startDate', '')}
            error={!!dateRanges && formik.touched.startDate && Boolean(formik.errors.startDate)}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sx={{
            opacity: !formik.values.dateRange ? 0.4 : 1,
            pointerEvents: !formik.values.dateRange ? 'none' : 'auto'
          }}
        >
          <CustomDatePicker
            name='endDate'
            label={labels.endDate}
            value={formik.values.endDate}
            required={formik.values.dateRange && true}
            readOnly={!formik.values.dateRange && true}
            onChange={formik.setFieldValue}
            maxAccess={maxAccess}
            onClear={() => formik.setFieldValue('endDate', '')}
            error={!!dateRanges && formik.touched.endDate && Boolean(formik.errors.endDate)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
