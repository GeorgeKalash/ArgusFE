import { useContext, useEffect } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import * as yup from 'yup'
import { useForm } from 'src/hooks/form'

const RemittanceDefaults = ({ _labels, access }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  const { formik } = useForm({
    validateOnChange: true,
    initialValues: {
      nraId: null,
      nraRef: '',
      nraDescription: '',
      'rt-nra-product': null,
      rt_fii_accountGroupId: null,
      rt_max_monthly_amount: '',
      rt_max_yearly_ind_amount: '',
      rt_max_yearly_cor_amount: ''
    },
    validationSchema: yup.object().shape({
      ir_amcShortTerm: yup
        .number()
        .nullable()
        .test(function (value) {
          const { ir_amcLongTerm } = this.parent

          return value == null || ir_amcLongTerm == null || value <= ir_amcLongTerm
        }),
      ir_amcLongTerm: yup.number().nullable()
    }),
    onSubmit: values => {
      postRtDefault(values)
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      await loadDefaults()
    }
    fetchData()
  }, [])

  const loadDefaults = async () => {
    const myObject = {}

    const filteredList = defaultsData?.list?.filter(
      obj =>
        obj.key === 'rt-nra-product' ||
        obj.key === 'rt_fii_accountGroupId' ||
        obj.key === 'rt_max_monthly_amount' ||
        obj.key === 'rt_max_yearly_ind_amount' ||
        obj.key === 'rt_max_yearly_cor_amount'
    )

    filteredList?.forEach(obj => {
      myObject[obj.key] = obj.value ? parseInt(obj.value) : ''
    })

    if (myObject['rt-nra-product']) {
      const res = await getRequest({
        extension: SystemRepository.NumberRange.get,
        parameters: `_filter=&_recordId=${myObject['rt-nra-product']}`
      })

      if (res?.record) {
        myObject['nraId'] = res.record.recordId
        myObject['nraRef'] = res.record.reference
        myObject['nraDescription'] = res.record.description
      }
    }

    formik.setValues(myObject)
  }

  const postRtDefault = obj => {
    const data = Object.entries(obj).map(([key, value]) => ({
      key,
      value
    }))

    postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ SysDefaults: data })
    }).then(res => {
      if (res) toast.success(platformLabels.Edited)
      updateDefaults(data)
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={4} sx={{ p: 2 }}>
          <Grid item xs={12}>
            <ResourceLookup
              endpointId={SystemRepository.NumberRange.snapshot}
              form={formik}
              name='nraId'
              label={_labels.nuRange}
              valueField='reference'
              displayField='description'
              firstValue={formik.values.nraRef}
              secondValue={formik.values.nraDescription}
              onChange={(event, newValue) => {
                formik.setFieldValue('rt-nra-product', newValue?.recordId || null)
                formik.setFieldValue('nraId', newValue?.recordId || null)
                formik.setFieldValue('nraRef', newValue?.reference || '')
                formik.setFieldValue('nraDescription', newValue?.description || '')
              }}
              maxAccess={access}
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
                formik.setFieldValue('rt_fii_accountGroupId', newValue?.recordId || null)
              }}
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
      <Fixed>
        <WindowToolbar onSave={formik.handleSubmit} isSaved={true} />
      </Fixed>
    </VertLayout>
  )
}

export default RemittanceDefaults
