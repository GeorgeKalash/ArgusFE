import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'

import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { RGFinancialRepository } from 'src/repositories/RGFinancialRepository'
import { formatDateToApi } from 'src/lib/date-helper'
import { ControlContext } from 'src/providers/ControlContext'

export default function GenerateOpening({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: { fiscalYear: null, tbFiscalYear: null, recordId: 'N/A', tbendDate: null },
    enableReinitialize: true,
    maxAccess: access,
    validateOnChange: true,

    validationSchema: yup.object({
      fiscalYear: yup.string().required(),
      tbendDate: yup.string().required(),
      tbFiscalYear: yup.string().required()
    }),
    onSubmit: async obj => {
      const { recordId, ...rest } = obj

      await postRequest({
        extension: RGFinancialRepository.FiOpeningBalance.gen,
        record: JSON.stringify({ ...obj, tbendDate: formatDateToApi(obj.tbendDate) })
      })

      toast.success(platformLabels.Generated)
    }
  })

  return (
    <FormShell
      resourceId={ResourceIds.GenerateOpeningBalances}
      form={formik}
      maxAccess={access}
      editMode={true}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='tbFiscalYear'
                label={_labels.tbFiscalYear}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('tbFiscalYear', newValue?.fiscalYear || null)
                }}
                error={formik.touched.tbFiscalYear && Boolean(formik.errors.tbFiscalYear)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='tbendDate'
                label={_labels.endDate}
                value={formik.values.tbendDate}
                onChange={formik.setFieldValue}
                maxAccess={access}
                onClear={() => formik.setFieldValue('tbendDate', '')}
                required
                error={formik.touched.tbendDate && Boolean(formik.errors.tbendDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='fiscalYear'
                label={_labels.fiscalYear}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('fiscalYear', newValue?.fiscalYear || null)
                }}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
