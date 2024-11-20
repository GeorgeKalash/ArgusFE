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
import { RGGeneralRepository } from 'src/repositories/RGGeneralRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { ControlContext } from 'src/providers/ControlContext'

export default function GlSyncForm({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: { fiscalYear: '', currencyId: '', recordId: 'N/A', effectiveDate: null },
    enableReinitialize: true,
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
    <FormShell
      resourceId={ResourceIds.GlSync}
      form={formik}
      maxAccess={access}
      editMode={true}
      isSavedClear={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
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
