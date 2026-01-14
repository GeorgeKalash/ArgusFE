import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import CustomComboBox from '@argus/shared-ui/src/components/Inputs/CustomComboBox'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function DeliverySettingsForm({ _labels, access }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults} = useContext(ControlContext)
  const [store, setStore] = useState([]) 

  const defaultKeys = ['smsInvoiceReportLayout']

  const { formik } = useForm({
    maxAccess: access,
    initialValues: defaultKeys.reduce((acc, key) => ({ ...acc, [key]: null }), {}),
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

  async function fillSalesInvReportLayout(){
    const reportPack = await getRequest({
      extension: SystemRepository.ReportLayout.get,
      parameters: `_resourceId=${ResourceIds.SalesInvoice}`
    })
    const pack = reportPack?.record || {}

    const firstStore = (pack?.layouts || []).map(item => ({
      id: item.id,
      api_url: item.api,
      reportClass: item.instanceName,
      parameters: item.parameters,
      layoutName: item.layoutName,
      assembly: 'ArgusRPT.dll'
    }))

    const secondStore = (pack?.reportTemplates || []).map(item => ({
      id: item.id,
      api_url: item.wsName,
      reportClass: item.reportName,
      parameters: item.parameters,
      layoutName: item.caption,
      assembly: item.assembly
    }))

    const combinedStore = [...firstStore, ...secondStore]
    setStore(combinedStore || [])
  }
  
  useEffect(() => {
    const updated = {}
    defaultsData.list?.forEach(obj => {
     if (defaultKeys.includes(obj.key)) {
      updated[obj.key] = obj.value ? parseFloat(obj.value) : null
      formik.setFieldValue(obj.key, updated[obj.key])
     }
    })
  }, [defaultsData])
  

  useEffect(() => { 
    fillSalesInvReportLayout()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
             <CustomComboBox
               label={_labels.SMS_INVOICE_REPORT_LAYOUT}
               valueField='id'
               displayField='layoutName'
               store={store}
               value={formik.values.smsInvoiceReportLayout}
               maxAccess={access}
               onChange={(_, newValue) => formik.setFieldValue('smsInvoiceReportLayout', newValue?.id || null)}
            />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
