import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

export default function CurrencyForm({ labels, maxAccess, recordId }) {
  const [editMode, setEditMode] = useState(!!recordId)

  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.Currency.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      reference: '',
      flName: '',
      decimals: null,
      profileId: null,
      currencyType: null,
      currencyTypeName: null,
      sale: false,
      purchase: false,
      isoCode: '',
      symbol: '',
      maxRateVarPct: null
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required(),
      decimals: yup.string().required(),
      currencyType: yup.string().required(),
      profileId: yup.string().required()
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: SystemRepository.Currency.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
        setEditMode(true)
      } else {
        toast.success(platformLabels.Edited)
      }
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SystemRepository.Currency.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.Currencies}
      form={formik}
      actions={actions}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                onChange={formik.handleChange}
                maxLength='3'
                maxAccess={maxAccess}
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
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='flName'
                label={labels.foreignLanguage}
                value={formik.values.flName}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('flName', '')}
                error={formik.touched.flName && Boolean(formik.errors.flName)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.CURRENCY_DECIMALS}
                name='decimals'
                label={labels.decimals}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('decimals', newValue?.key)
                }}
                error={formik.touched.decimals && Boolean(formik.errors.decimals)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.CURRENCY_PROFILE}
                name='profileId'
                label={labels.profile}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('profileId', newValue?.key)
                }}
                error={formik.touched.profileId && Boolean(formik.errors.profileId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.CURRENCY_TYPE}
                name='currencyType'
                label={labels.currencyType}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                maxAccess={maxAccess}
                readOnly={editMode}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('currencyType', newValue?.key)
                }}
                error={formik.touched.currencyType && Boolean(formik.errors.currencyType)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomCheckBox
                name='sale'
                value={formik.values?.sale}
                onChange={event => formik.setFieldValue('sale', event.target.checked)}
                label={labels.sales}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomCheckBox
                name='purchase'
                value={formik.values?.purchase}
                onChange={event => formik.setFieldValue('purchase', event.target.checked)}
                label={labels.purchase}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='isoCode'
                label={labels.isoCode}
                value={formik.values.isoCode}
                onChange={formik.handleChange}
                maxLength='3'
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('isoCode', '')}
                error={formik.touched.isoCode && Boolean(formik.errors.isoCode)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='symbol'
                label={labels.symbol}
                value={formik.values.symbol}
                onChange={formik.handleChange}
                maxLength='5'
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('symbol', '')}
                error={formik.touched.symbol && Boolean(formik.errors.symbol)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='maxRateVarPct'
                label={labels.maxRateVarPct}
                value={formik.values.maxRateVarPct}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('maxRateVarPct', e.target.value)}
                onClear={() => formik.setFieldValue('maxRateVarPct', null)}
                allowNegative={false}
                maxLength={4}
                error={formik.touched.maxRateVarPct && Boolean(formik.errors.maxRateVarPct)}
                decimalScale={2}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
