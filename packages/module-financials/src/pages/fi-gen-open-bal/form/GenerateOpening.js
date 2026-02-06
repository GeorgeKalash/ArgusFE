import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { RGFinancialRepository } from '@argus/repositories/src/repositories/RGFinancialRepository'
import { formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function GenerateOpening({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: { fiscalYear: null, tbFiscalYear: null, recordId: 'N/A', tbendDate: null },
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      fiscalYear: yup.string().required(),
      tbendDate: yup.string().required(),
      tbFiscalYear: yup.string().required()
    }),
    onSubmit: async obj => {
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
          <Grid container spacing={2}>
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
