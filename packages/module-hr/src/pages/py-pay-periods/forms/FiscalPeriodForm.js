import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import toast from 'react-hot-toast'

export default function FiscalPeriodForm ({ labels, periodInfo, maxAccess, refetch, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { periodId, periodType, fiscalYear } = periodInfo || {}

  const { formik } = useForm({
    initialValues: {
      periodId,
      fiscalYear,
      status: 1,
      salaryType: periodType,
      startDate: null,
      endDate: null
    },
    maxAccess,
    validationSchema: yup.object({
      startDate: yup.date().required(),
      endDate: yup.date().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: PayrollRepository.Period.set,
        record: JSON.stringify({...obj,
          startDate: formatDateToApi(obj?.startDate),
          endDate: formatDateToApi(obj?.endDate)
        })
      })
      toast.success(platformLabels.Saved)
      refetch()
      window.close()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (!periodId && !periodType && !fiscalYear) return

      const res = await getRequest({
        extension: PayrollRepository.Period.get,
        parameters: `_year=${fiscalYear}&_salaryType=${periodType}&_periodId=${periodId}`
      })
      formik.setValues({...res.record,
        startDate: formatDateFromApi(res?.record?.startDate),
        endDate: formatDateFromApi(res?.record?.endDate) 
      })
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
