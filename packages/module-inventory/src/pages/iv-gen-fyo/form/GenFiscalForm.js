import { Grid } from '@mui/material'
import { useContext } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'

export default function GenFiscalForm({ _labels, maxAccess }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      recordId: 'N/A',
      fiscalYear: '',
      periodId: null
    },
    maxAccess,
    validationSchema: yup.object({
      fiscalYear: yup.string().required(),
      periodId: yup.number().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: InventoryRepository.GenerateFiscalYear.gen,
        record: JSON.stringify(obj)
      })

      toast.success(platformLabels.Generated)
    }
  })

  return (
    <FormShell
      resourceId={ResourceIds.GenerateFiscalYear}
      form={formik}
      maxAccess={maxAccess}
      editMode={true}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='fiscalYear'
                label={_labels.year}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('fiscalYear', newValue?.fiscalYear || null)}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalPeriod.qry}
                name='periodId'
                label={_labels.fiscalPeriod}
                valueField='periodId'
                displayField='name'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('periodId', newValue?.periodId || null)}
                error={formik.touched.periodId && Boolean(formik.errors.periodId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
