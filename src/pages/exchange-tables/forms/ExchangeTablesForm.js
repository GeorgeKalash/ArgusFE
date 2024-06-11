import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

export default function ExchangeTablesForm({ labels, maxAccess, recordId, invalidate }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      reference: '',
      name: '',
      currencyId: '',
      rateCalcMethod: '',
      rateAgainst: '',
      rateAgainstCurrencyId: ''
    },
    maxAccess: maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(' '),
      name: yup.string().required(' '),
      currencyId: yup.string().required(' '),
      rateCalcMethod: yup.string().required(' '),
      rateAgainst: yup.string().required(' '),
      rateAgainstCurrencyId: yup
        .string()
        .nullable()
        .test('is-rateAgainstCurrencyId-required', ' ', function (value) {
          const { rateAgainst } = this.parent

          return rateAgainst === '2' ? !!value : true
        })
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: MultiCurrencyRepository.ExchangeTable.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId || !!recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: MultiCurrencyRepository.ExchangeTable.get,
            parameters: `_recordId=${recordId}`
          })
          formik.setValues(res.record)
        }
      } catch (e) {}
    })()
  }, [recordId])

  // if rate againt = base currency, foreign currency is optional and readonly.

  return (
    <FormShell resourceId={ResourceIds.ExchangeTables} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                maxAccess={maxAccess}
                maxLength='10'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='50'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currencyId}
                valueField='recordId'
                displayField={['reference', 'name', 'flName']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.MC_RATE_CALC_METHOD}
                name='rateCalcMethod'
                label={labels.rateCalcMethod}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('rateCalcMethod', newValue?.key || null)
                }}
                error={formik.touched.rateCalcMethod && Boolean(formik.errors.rateCalcMethod)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.MC_RATE_AGAINST}
                name='rateAgainst'
                label={labels.rateAgainst}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('rateAgainst', newValue?.key || null)
                }}
                error={formik.touched.rateAgainst && Boolean(formik.errors.rateAgainst)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='rateAgainstCurrencyId'
                label={labels.rateAgainstCurrencyId}
                valueField='recordId'
                displayField={['reference', 'name', 'flName']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language' }
                ]}
                values={formik.values}
                required={formik.values.rateAgainst === '2'}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('rateAgainstCurrencyId', newValue?.recordId || null)
                }}
                error={formik.touched.rateAgainstCurrencyId && Boolean(formik.errors.rateAgainstCurrencyId)}
                readOnly={!(formik.values.rateAgainst === '2')}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
