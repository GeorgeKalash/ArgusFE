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
import { RGGeneralRepository } from '@argus/repositories/src/repositories/RGGeneralRepository'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function GlSyncForm({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: { fiscalYear: '', currencyId: '', recordId: 'N/A', effectiveDate: null },
    maxAccess: access,
    validateOnChange: true,

    validationSchema: yup.object({
      fiscalYear: yup.string().required(),
      effectiveDate: yup.string().required()
    }),
    onSubmit: async obj => {
      const { recordId, ...rest } = obj

      await postRequest({
        extension: RGGeneralRepository.OriginBalance.GLDOE,
        record: JSON.stringify(rest)
      })

      toast.success(platformLabels.Saved)
      formik.setValues({
        ...obj
      })
    }
  })

  return (
    <FormShell resourceId={ResourceIds.GlSync} form={formik} maxAccess={access} editMode={true} isSavedClear={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
                  formik && formik.setFieldValue('fiscalYear', newValue?.fiscalYear)
                }}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={_labels.currency}
                valueField='recordId'
                displayField={['reference', 'name', 'flName']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'FL Name' }
                ]}
                values={formik.values}
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='effectiveDate'
                label={_labels.date}
                value={formik.values.effectiveDate}
                onChange={formik.setFieldValue}
                required
                maxAccess={access}
                onClear={() => formik.setFieldValue('effectiveDate', '')}
                error={formik.touched.effectiveDate && Boolean(formik.errors.effectiveDate)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
