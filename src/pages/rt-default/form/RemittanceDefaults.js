import { useContext, useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import FormShell from 'src/components/Shared/FormShell'
import { useForm } from 'src/hooks/form'

const RemittanceDefaults = ({ _labels, access }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const getNumberRange = async nraId => {
    const { record } = await getRequest({
      extension: SystemRepository.NumberRange.get,
      parameters: `_filter=&_recordId=${nraId}`
    })

    return record
  }

  const { formik } = useForm({
    validateOnChange: true,
    initialValues: {
      nraId: null,
      nraRef: null,
      nraDescription: null,
      'rt-nra-product': null,
      rt_fii_accountGroupId: '',
      rt_max_monthly_amount: '',
      rt_max_yearly_ind_amount: '',
      rt_max_yearly_cor_amount: ''
    },
    onSubmit: values => {
      postRtDefault(values)
    }
  })

  useEffect(() => {
    ;(async function () {
      const res = await getRequest({
        extension: RemittanceSettingsRepository.RtDefault.qry,
        parameters: `_filter=`
      })

      if (res?.list) {
        const myObject = { nraRef: null, nraDescription: null }

        for (const { key, value } of res?.list ?? []) {
          if (
            [
              'rt_max_monthly_amount',
              'rt_max_yearly_ind_amount',
              'rt_max_yearly_cor_amount',
              'rt_fii_accountGroupId',
              'rt-nra-product'
            ].includes(key)
          ) {
            if (key === 'rt-nra-product' && value) {
              const result = await getNumberRange(value)
              myObject.nraRef = result?.reference ?? null
              myObject.nraDescription = result?.description ?? null
              myObject[key] = value
            } else {
              myObject[key] = value == null ? null : Number(value)
            }
          }
        }
        formik.setValues(myObject)
      }
    })()
  }, [])

  const postRtDefault = obj => {
    var data = []
    Object.entries(obj).forEach(([key, value], i) => {
      const newObj = { key: key, value: value }

      data.push(newObj)
    })

    postRequest({
      extension: RemittanceSettingsRepository.RtDefault.set2,
      record: JSON.stringify({ sysDefaults: data })
    })
      .then(res => {
        if (res) toast.success(platformLabels.Updated)
      })
      .catch(error => {})
  }

  return (
    <FormShell form={formik} maxAccess={access} infoVisible={false} isCleared={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SystemRepository.NumberRange.snapshot}
                form={formik}
                name='rt-nra-product'
                label={_labels.nuRange}
                valueField='reference'
                displayField='description'
                firstValue={formik.values.nraRef}
                secondValue={formik.values.nraDescription}
                onChange={(_, newValue) => {
                  formik.setFieldValue('rt-nra-product', newValue?.recordId || null)
                  formik.setFieldValue('nraRef', newValue?.reference)
                  formik.setFieldValue('nraDescription', newValue?.description || '')
                }}
                maxAccess={access}
                error={formik.touched?.['rt-nra-product'] && Boolean(formik.errors?.['rt-nra-product'])}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={FinancialRepository.Group.qry}
                name='rt_fii_accountGroupId'
                label={_labels.dag}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('rt_fii_accountGroupId', newValue?.recordId || '')
                }}
                error={formik.touched.rt_fii_accountGroupId && Boolean(formik.errors.rt_fii_accountGroupId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='rt_max_monthly_amount'
                label={_labels.maxInwardsSettlementPerMonth}
                value={formik.values.rt_max_monthly_amount}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('rt_max_monthly_amount', '')}
                error={formik.touched.rt_max_monthly_amount && Boolean(formik.errors.rt_max_monthly_amount)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='rt_max_yearly_ind_amount'
                label={_labels.maxInwardsSettlementPerYear}
                value={formik.values.rt_max_yearly_ind_amount}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('rt_max_yearly_ind_amount', '')}
                error={formik.touched.rt_max_yearly_ind_amount && Boolean(formik.errors.rt_max_yearly_ind_amount)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='rt_max_yearly_cor_amount'
                label={_labels.maxYearlyCorAmount}
                value={formik.values.rt_max_yearly_cor_amount}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('rt_max_yearly_cor_amount', '')}
                error={formik.touched.rt_max_yearly_cor_amount && Boolean(formik.errors.rt_max_yearly_cor_amount)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default RemittanceDefaults
