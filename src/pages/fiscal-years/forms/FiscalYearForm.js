import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { validateNumberField } from 'src/lib/numberField-helper'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { DataSets } from 'src/resources/DataSets'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { ControlContext } from 'src/providers/ControlContext'
import Typography from '@mui/material/Typography'

export default function FiscalYearForm({ labels, maxAccess, setStore, store, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: SystemRepository.FiscalYears.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      fiscalYear: '',
      startDate: null,
      endDate: null,
      periods: '',
      status: ''
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      fiscalYear: yup
        .number()
        .required()
        .transform((value, originalValue) => validateNumberField(value, originalValue))
        .min(1900, labels.yearMin)
        .max(2099, labels.yearMax),
      startDate: yup.string().required(),
      endDate: yup.string().required(),
      periods: yup.string().required(),
      status: yup.string().required()
    }),
    onSubmit: async obj => {
      const data = {
        ...obj,
        startDate: formatDateToApi(obj.startDate),
        endDate: formatDateToApi(obj.endDate)
      }

      await postRequest({
        extension: SystemRepository.FiscalYears.set,
        record: JSON.stringify(data)
      })

      if (!recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', obj.fiscalYear)
        setStore(prevStore => ({
          ...prevStore,
          recordId: obj.fiscalYear
        }))
      } else toast.success(platformLabels.Edited)

      invalidate()

      window.close()
    }
  })

  const editMode = !!recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SystemRepository.FiscalYears.get,
          parameters: `_fiscalYear=${recordId}`
        })

        formik.setValues({
          ...res.record,

          startDate: formatDateFromApi(res.record.startDate),
          endDate: formatDateFromApi(res.record.endDate),
          recordId: res.record.fiscalYear
        })
      }
    })()
  }, [])

  useEffect(() => {
    if (formik.values.fiscalYear) {
      const year = parseInt(formik.values.fiscalYear, 10)
      if (year) {
        formik.setFieldValue('startDate', new Date(Date.UTC(year, 0, 1)))
        formik.setFieldValue('endDate', new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)))
      }
    } else {
      formik.setFieldValue('startDate', null)
      formik.setFieldValue('endDate', null)
    }
  }, [formik.values.fiscalYear])

  return (
    <FormShell resourceId={ResourceIds.FiscalYears} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='fiscalYear'
                label={labels.fiscalYear}
                value={formik.values.fiscalYear}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('fiscalYear', '')}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
                maxAccess={maxAccess}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={labels.startDate}
                value={formik.values.startDate}
                onChange={formik.setFieldValue}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('startDate', '')}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={labels.endDate}
                value={formik.values.endDate}
                onChange={formik.setFieldValue}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('endDate', '')}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems='center'>
                <Grid item xs={4}>
                  <ResourceComboBox
                    datasetId={DataSets.FY_PERIODS}
                    name='periods'
                    label={labels.periods}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('periods', newValue ? newValue.key : '')
                    }}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                    error={formik.touched.periods && Boolean(formik.errors.periods)}
                    required
                  />
                </Grid>
                <Grid item>
                  <Typography>{labels.months}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.FY_PERIOD_STATUS}
                name='status'
                label={labels.status}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('status', newValue ? newValue.key : '')
                }}
                maxAccess={maxAccess}
                error={formik.touched.status && Boolean(formik.errors.status)}
                required
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
