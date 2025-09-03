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
      rt_max_monthly_amount: null,
      rt_max_yearly_ind_amount: null,
      rt_max_yearly_cor_amount: null
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
    onSubmit: async obj => {
      const data = Object.entries(obj).map(([key, value]) => ({
        key,
        value
      }))

      await postRequest({
        extension: SystemRepository.Defaults.set,
        record: JSON.stringify({ SysDefaults: data })
      })
      updateDefaults(data)
      toast.success(platformLabels.Edited)
    }
  })

  useEffect(() => {
    loadDefaults()
  }, [defaultsData])

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
      <Fixed>
        <WindowToolbar onSave={formik.handleSubmit} isSaved={true} />
      </Fixed>
    </VertLayout>
  )
}

export default RemittanceDefaults
