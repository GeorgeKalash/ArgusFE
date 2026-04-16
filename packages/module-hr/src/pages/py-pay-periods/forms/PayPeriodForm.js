import { Grid } from '@mui/material'
import { useContext } from 'react'
import * as yup from 'yup'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import { formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import toast from 'react-hot-toast'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'

export default function PayPeriodForm ({ labels, maxAccess, window }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: PayrollRepository.FiscalYear.page
  })

  const { formik } = useForm({
    initialValues: {
      fiscalYear: null,
      startDate: null,
      endDate: null
    },
    maxAccess,
    validationSchema: yup.object({
      fiscalYear: yup.number().required(),
      startDate: yup.string().required(),
      endDate: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: PayrollRepository.FiscalYear.set,
        record: JSON.stringify({...obj,
          startDate: formatDateToApi(obj?.startDate),
          endDate: formatDateToApi(obj?.endDate)
        })
      })
      toast.success(platformLabels.Saved)
      invalidate()
      window.close()
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomNumberField
                name='fiscalYear'
                label={labels.year}
                value={formik?.values?.fiscalYear}
                maxAccess={maxAccess}
                required
                allowNegative={false}
                decimalScale={0}
                maxLength={4}
                thousandSeparator={false}
                onChange={formik.handleChange}
                onBlur={(e) => {
                  const year = e.target.value
                  if (!year) return

                  formik.setValues({
                    ...formik.values,
                    startDate: new Date(year, 0, 1, 1, 1, 1, 1),
                    endDate: new Date(year, 11, 31, 1, 1, 1, 1)
                  })
                }}
                onClear={() => formik.setFieldValue('fiscalYear', null)}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={labels.from}
                max={formik.values.endDate}
                value={formik.values?.startDate}
                required
                maxAccess={maxAccess}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('startDate', null)}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={labels.to}
                value={formik.values?.endDate}
                min={formik.values.startDate}
                required
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('endDate', null)}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
