import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { useForm } from 'src/hooks/form'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'

const MCDefault = ({ _labels, access }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  const arrayAllow = [
    'mc_defaultRTSA',
    'mc_defaultRTPU',
    'mc_defaultRTMF',
    'mc_defaultRTFI',
    'mc_defaultRTTAX',
    'baseMetalCuId',
    'baseSalesMetalId',
    'mf_damageOperationId'
  ]

  const { formik } = useForm({
    maxAccess: access,
    initialValues: arrayAllow.reduce((acc, key) => ({ ...acc, [key]: null }), {}),
    onSubmit: async obj => {
      const data = Object.entries(obj).map(([key, value]) => ({ key, value }))
      await postRequest({
        extension: SystemRepository.Defaults.set,
        record: JSON.stringify({ sysDefaults: data })
      })
      updateDefaults(data)
      toast.success(platformLabels.Edited)
    }
  })

  useEffect(() => {
    const updated = {}
    defaultsData.list?.forEach(obj => {
      if (arrayAllow.includes(obj.key)) {
        updated[obj.key] = obj.value ? parseFloat(obj.value) : null
        formik.setFieldValue(obj.key, updated[obj.key])
      }
    })
  }, [defaultsData])

  const isReadOnly = key => {
    const item = defaultsData?.list?.find(obj => obj.key === key)

    return item && item.value != null && item.value !== ''
  }

  const rateTypeFields = [
    { name: 'mc_defaultRTSA', label: _labels.mc_defaultRTSA },
    { name: 'mc_defaultRTPU', label: _labels.mc_defaultRTPU },
    { name: 'mc_defaultRTMF', label: _labels.mc_defaultRTMF },
    { name: 'mc_defaultRTFI', label: _labels.mc_defaultRTFI },
    { name: 'mc_defaultRTTAX', label: _labels.mc_defaultRTTAX }
  ]

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={4} sx={{ p: 2 }}>
          {rateTypeFields.map(({ name, label }) => (
            <Grid item xs={12} key={name}>
              <ResourceComboBox
                endpointId={MultiCurrencyRepository.RateType.qry}
                name={name}
                label={label}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(_, newValue) => formik.setFieldValue(name, newValue?.recordId || null)}
                error={formik.touched[name] && Boolean(formik.errors[name])}
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Currency.qry}
              name='baseMetalCuId'
              label={_labels.baseMetalCuId}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              onChange={(_, newValue) => formik.setFieldValue('baseMetalCuId', newValue?.recordId || null)}
              error={formik.touched.baseMetalCuId && Boolean(formik.errors.baseMetalCuId)}
              readOnly={isReadOnly('baseMetalCuId')}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Metals.qry}
              name='baseSalesMetalId'
              label={_labels.baseSalesMetalId}
              valueField='recordId'
              displayField='reference'
              values={formik.values}
              onChange={(_, newValue) => formik.setFieldValue('baseSalesMetalId', newValue?.recordId || null)}
              error={formik.touched.baseSalesMetalId && Boolean(formik.errors.baseSalesMetalId)}
              readOnly={isReadOnly('baseSalesMetalId')}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={ManufacturingRepository.Operation.qry}
              parameters='_workCenterId=0'
              name='mf_damageOperationId'
              label={_labels.operation}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              onChange={(_, newValue) => formik.setFieldValue('mf_damageOperationId', newValue?.recordId || null)}
              error={formik.touched.mf_damageOperationId && Boolean(formik.errors.mf_damageOperationId)}
            />
          </Grid>
        </Grid>
      </Grow>
      <Fixed>
        <WindowToolbar onSave={formik.handleSubmit} isSaved />
      </Fixed>
    </VertLayout>
  )
}

export default MCDefault
