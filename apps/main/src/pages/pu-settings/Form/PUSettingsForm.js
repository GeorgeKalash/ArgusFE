import { useContext, useEffect } from 'react'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import toast from 'react-hot-toast'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const PUSettingsForm = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels: _labels, access } = useResourceQuery({
    datasetId: ResourceIds.PUSettings
  })

  const arrayAllow = ['PUCurrencyId', 'PUSiteId', 'PUFIIntegration', 'POSHPVarPct']

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      PUCurrencyId: '',
      PUSiteId: '',
      PUFIIntegration: '',
      POSHPVarPct: ''
    },
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      POSHPVarPct: yup.number().min(0).max(100)
    }),
    onSubmit: async obj => {
      try {
        var data = []

        Object.entries(obj).forEach(([key, value], i) => {
          if (arrayAllow.includes(key)) {
            const newObj = { key: key, value: value }
            data.push(newObj)
          }
        })

        const response = await postRequest({
          extension: SystemRepository.Defaults.set,
          record: JSON.stringify({ sysDefaults: data })
        })

        if (response) {
          toast.success(platformLabels.Added)
        }
      } catch (error) {}
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        const response = await getRequest({
          extension: SystemRepository.Defaults.qry,
          parameters: `_filter=`
        })
        response.list.forEach(obj => {
          if (arrayAllow.includes(obj.key)) {
            formik.setFieldValue(obj.key, parseInt(obj.value))
          }
        })
      } catch (error) {}
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='PUCurrencyId'
                label={_labels.currency}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('PUCurrencyId', newValue ? newValue?.recordId : '')
                }}
                error={formik.touched.PUCurrencyId && Boolean(formik.errors.PUCurrencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='PUSiteId'
                label={_labels.site}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('PUSiteId', newValue ? newValue?.recordId : '')
                }}
                error={formik.touched.PUSiteId && Boolean(formik.errors.PUSiteId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.SA_FI_INTEGRATION}
                name='PUFIIntegration'
                label={_labels.financialIntegration}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('PUFIIntegration', newValue ? newValue?.key : '')
                }}
                error={formik.touched.PUFIIntegration && Boolean(formik.errors.PUFIIntegration)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='POSHPVarPct'
                label={_labels.POSHPVarPct}
                value={formik.values.POSHPVarPct}
                onChange={formik.handleChange}
                allowNegative={false}
                maxLength={3}
                decimalScale={0}
                onClear={() => formik.setFieldValue('POSHPVarPct', '')}
                error={formik.touched.POSHPVarPct && Boolean(formik.errors.POSHPVarPct)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default PUSettingsForm
