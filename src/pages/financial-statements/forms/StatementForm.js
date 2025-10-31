import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ControlContext } from 'src/providers/ControlContext'
import { FinancialStatementRepository } from 'src/repositories/FinancialStatementRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { useError } from 'src/error'
import { useForm } from 'src/hooks/form'

export default function StatementForm({ initialData, labels, maxAccess, setRecId, mainRecordId }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()

  const editMode = !!mainRecordId

  const invalidate = useInvalidate({
    endpointId: FinancialStatementRepository.FinancialStatement.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      showMetalCurrencyAmount: false,
      showFiatCurrencyAmount: false,
      showBaseAmount: false,
      sgId: null,
      isConfidential: false,
      showCurrentRateBaseAmount: false
    },
    validationSchema: yup.object({
      name: yup.string().required(),
      sgId: yup
        .number()
        .nullable()
        .test('sgId-required-if-confidential', 'sgId is required when confidential', function (value) {
          const { isConfidential } = this.parent

          return !(isConfidential && !value)
        })
    }),
    onSubmit: async obj => {
      if (
        !obj.showBaseAmount &&
        !obj.showMetalCurrencyAmount &&
        !obj.showFiatCurrencyAmount &&
        !obj.showCurrentRateBaseAmount
      ) {
        stackError({
          message: labels.checkBoxesError
        })

        return
      }

      const res = await postRequest({
        extension: FinancialStatementRepository.FinancialStatement.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        formik.setFieldValue('recordId', res.recordId)
        setRecId(res.recordId)
      }
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      formik.setValues(initialData)
    }
  }, [initialData])

  return (
    <FormShell resourceId={ResourceIds.FinancialStatements} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                maxLength='50'
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isConfidential'
                value={formik.values?.isConfidential}
                onChange={event => {
                  formik.setFieldValue('sgId', null)
                  formik.setFieldValue('isConfidential', event.target.checked)
                }}
                label={labels.isConfidential}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={AccessControlRepository.SecurityGroup.qry}
                parameters={`_startAt=0&_pageSize=1000&filter=`}
                name='sgId'
                label={labels.securityGrp}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('sgId', newValue?.recordId || null)
                }}
                required={formik.values.isConfidential}
                readOnly={!formik.values.isConfidential}
                error={formik.touched.sgId && Boolean(formik.errors.sgId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='showBaseAmount'
                value={formik.values?.showBaseAmount}
                onChange={event => formik.setFieldValue('showBaseAmount', event.target.checked)}
                label={labels.showBaseAmount}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='showMetalCurrencyAmount'
                value={formik.values?.showMetalCurrencyAmount}
                onChange={event => formik.setFieldValue('showMetalCurrencyAmount', event.target.checked)}
                label={labels.showMetalCurrencyAmount}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='showFiatCurrencyAmount'
                value={formik.values?.showFiatCurrencyAmount}
                onChange={event => formik.setFieldValue('showFiatCurrencyAmount', event.target.checked)}
                label={labels.showFiatCurrencyAmount}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='showCurrentRateBaseAmount'
                value={formik.values?.showCurrentRateBaseAmount}
                onChange={event => formik.setFieldValue('showCurrentRateBaseAmount', event.target.checked)}
                label={labels.showCurrentRateBaseAmount}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
