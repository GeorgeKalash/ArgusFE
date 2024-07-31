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
import { formatDateFromApi } from 'src/lib/date-helper'

export default function FiscalYearForm({ labels, maxAccess, recordId, editMode }) {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.FiscalYears.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      fiscalYear: '',
      startDate: new Date(),
      endDate: new Date(),
      periods: '',
      status: ''
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      fiscalYear: yup
        .number()
        .transform((value, originalValue) => validateNumberField(value, originalValue))
        .min(1900, 'Value must be greater than or equal to 0')
        .max(2099, 'Value must be less than or equal to 32,767'),
      startDate: yup.string().required(' '),
      endDate: yup.string().required(' '),
      periods: yup.string().required(' '),
      status: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const fiscalYear = obj.fiscalYear
      const response = await postRequest({
        extension: SystemRepository.FiscalYears.set,
        record: JSON.stringify(obj)
      })

      if (!fiscalYear) {
        toast.success('Record Added Successfully')

        formik.setFieldValue('fiscalYear', obj.fiscalYear)
        formik.setFieldValue('recordId', obj.fiscalYear)
        console.log('response', response)
        console.log('formik', formik.values)
      } else toast.success('Record Edited Successfully')

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
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
      } catch (exception) {}
    })()
  }, [])

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
              <ResourceComboBox
                datasetId={DataSets.FY_PERIODS}
                name='periods'
                label={labels.periods}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('periods', newValue?.key)
                  } else {
                    formik.setFieldValue('periods', '')
                  }
                }}
                maxAccess={maxAccess}
                error={formik.touched.periods && Boolean(formik.errors.periods)}
                required
              />
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
                  if (newValue) {
                    formik.setFieldValue('status', newValue?.key)
                  } else {
                    formik.setFieldValue('status', '')
                  }
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
