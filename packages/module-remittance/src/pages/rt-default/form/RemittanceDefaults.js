import { useContext, useEffect } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const RemittanceDefaults = ({ _labels, access }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

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
      var data = []
      Object.entries(values).forEach(([key, value], i) => {
        const newObj = { key: key, value: value }

        data.push(newObj)
      })

      postRequest({
        extension: RemittanceSettingsRepository.RtDefault.set2,
        record: JSON.stringify({ sysDefaults: data })
      }).then(res => {
        if (res) toast.success(platformLabels.Updated)
        updateDefaults(data)
      })
    }
  })

  useEffect(() => {
    ;(async function () {
      if (defaultsData) {
        const myObject = { nraRef: null, nraDescription: null }

        for (const { key, value } of defaultsData?.list ?? []) {
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
  }, [defaultsData])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
            {[
              { name: 'rt_max_monthly_amount', label: _labels.maxInwardsSettlementPerMonth },
              { name: 'rt_max_yearly_ind_amount', label: _labels.maxInwardsSettlementPerYear },
              { name: 'rt_max_yearly_cor_amount', label: _labels.maxYearlyCorAmount }
            ].map(item => (
              <Grid item xs={12} key={item.name}>
                <CustomNumberField
                  name={item.name}
                  label={item.label}
                  value={formik.values[item.name]}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue(item.name, null)}
                  error={formik.touched[item.name] && Boolean(formik.errors[item.name])}
                />
              </Grid>
            ))}
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default RemittanceDefaults
