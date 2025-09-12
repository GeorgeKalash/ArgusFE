import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { useForm } from 'src/hooks/form'
import FormShell from 'src/components/Shared/FormShell'

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
    'baseSalesMetalId'
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
    defaultsData.list.forEach(obj => {
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
    <FormShell form={formik} maxAccess={access} infoVisible={false} isSavedClear={false} isCleared={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={MultiCurrencyRepository.RateType.qry}
                name='mc_defaultRTSA'
                label={_labels.mc_defaultRTSA}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('mc_defaultRTSA', newValue?.recordId || '')
                }}
                error={formik.touched.mc_defaultRTSA && Boolean(formik.errors.mc_defaultRTSA)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={MultiCurrencyRepository.RateType.qry}
                name='mc_defaultRTPU'
                label={_labels.mc_defaultRTPU}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('mc_defaultRTPU', newValue?.recordId || '')
                }}
                error={formik.touched.mc_defaultRTPU && Boolean(formik.errors.mc_defaultRTPU)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={MultiCurrencyRepository.RateType.qry}
                name='mc_defaultRTMF'
                label={_labels.mc_defaultRTMF}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('mc_defaultRTMF', newValue?.recordId || '')
                }}
                error={formik.touched.mc_defaultRTMF && Boolean(formik.errors.mc_defaultRTMF)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={MultiCurrencyRepository.RateType.qry}
                name='mc_defaultRTFI'
                label={_labels.mc_defaultRTFI}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('mc_defaultRTFI', newValue?.recordId || '')
                }}
                error={formik.touched.mc_defaultRTFI && Boolean(formik.errors.mc_defaultRTFI)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={MultiCurrencyRepository.RateType.qry}
                name='mc_defaultRTTAX'
                label={_labels.mc_defaultRTTAX}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('mc_defaultRTTAX', newValue?.recordId || '')
                }}
                error={formik.touched.mc_defaultRTTAX && Boolean(formik.errors.mc_defaultRTTAX)}
              />
            </Grid>
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
                onChange={(event, newValue) => {
                  formik.setFieldValue('baseMetalCuId', newValue?.recordId || '')
                }}
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
                onChange={(event, newValue) => {
                  formik.setFieldValue('baseSalesMetalId', newValue?.recordId || '')
                }}
                error={formik.touched.baseSalesMetalId && Boolean(formik.errors.baseSalesMetalId)}
                readOnly={isReadOnly('baseSalesMetalId')}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default MCDefault
