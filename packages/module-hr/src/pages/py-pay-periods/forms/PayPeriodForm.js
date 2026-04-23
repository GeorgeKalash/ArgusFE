import { Grid } from '@mui/material'
import { useContext } from 'react'
import * as yup from 'yup'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import { formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import toast from 'react-hot-toast'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { useError } from '@argus/shared-providers/src/providers/error'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

export default function PayPeriodForm ({ labels, maxAccess, window }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()
  const MIN_YEAR = 1900
  const MAX_YEAR = 2100

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
      startDate: yup.date().required(),
      endDate: yup.date().required()
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
    <FormShell resourceId={ResourceIds.PayPeriod} form={formik} maxAccess={maxAccess} isInfo={false} editMode={false}>
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
                  const year = Number(e.target.value)
                  const isInvalidYear =  year < MIN_YEAR || year > MAX_YEAR

                  if (isInvalidYear) {
                    formik.setFieldValue('fiscalYear', null)
                    stackError({
                      message: labels.invalidDate
                    })
                  }

                  formik.setFieldValue('startDate', !isInvalidYear ? new Date(year, 0, 1, 1, 1, 1, 1) : null)
                  formik.setFieldValue('endDate', !isInvalidYear ? new Date(year, 11, 31, 1, 1, 1, 1) : null)
                }}
                onClear={() => { 
                  formik.setFieldValue('fiscalYear', null)
                  formik.setFieldValue('startDate', null)
                  formik.setFieldValue('endDate', null)
                 }
                }
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
    </FormShell>
  )
}
