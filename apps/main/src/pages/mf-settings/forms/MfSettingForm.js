import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/components/Shared/ResourceComboBox'
import { useResourceQuery } from '@argus/shared-hooks/hooks/resource'
import { InventoryRepository } from '@argus/repositories/repositories/InventoryRepository'
import { VertLayout } from '@argus/shared-ui/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/providers/ControlContext'
import { DataSets } from '@argus/shared-domain/resources/DataSets'
import Form from '@argus/shared-ui/components/Shared/Form'

const MfSettingForm = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels } = useResourceQuery({
    datasetId: ResourceIds.MF_Settings
  })

  const formik = useFormik({
    initialValues: {
      mf_ava_siteId: null,
      mf_fg_siteId: null,
      mf_rm_siteId: null,
      mf_jo_pic_source: null,
      mf_pico_dataSource: null
    },
    onSubmit: async obj => {
      const data = Object.entries(obj).map(([key, value]) => ({
        key,
        value
      }))

      await postRequest({
        extension: SystemRepository.Defaults.set,
        record: JSON.stringify({ sysDefaults: data })
      })

      toast.success(platformLabels.Edited)
    }
  })

  useEffect(() => {
    ;(async function () {
      const res = await getRequest({
        extension: SystemRepository.Defaults.qry,
        parameters: `_filter=`
      })

      const keysToExtract = ['mf_fg_siteId', 'mf_rm_siteId', 'mf_ava_siteId', 'mf_jo_pic_source', 'mf_pico_dataSource']

      const myObject = res.list.reduce((acc, { key, value }) => {
        if (keysToExtract.includes(key)) {
          acc[key] = value ? parseInt(value) : null
        }

        return acc
      }, {})

      formik.setValues(myObject)
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit}>
      <VertLayout>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Site.qry}
              name='mf_fg_siteId'
              label={labels.finishedGoodSites}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('mf_fg_siteId', newValue?.recordId || null)
              }}
              error={formik.touched.mf_fg_siteId && Boolean(formik.errors.mf_fg_siteId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Site.qry}
              name='mf_ava_siteId'
              label={labels.availabilitySite}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('mf_ava_siteId', newValue?.recordId || null)
              }}
              error={formik.touched.mf_ava_siteId && Boolean(formik.errors.mf_ava_siteId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Site.qry}
              name='mf_rm_siteId'
              label={labels.rawMaterialsSite}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('mf_rm_siteId', newValue?.recordId || null)
              }}
              error={formik.touched.mf_rm_siteId && Boolean(formik.errors.mf_rm_siteId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.JOB_PICTURE}
              name='mf_jo_pic_source'
              label={labels.jobPicture}
              valueField='key'
              displayField='value'
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('mf_jo_pic_source', newValue?.key || null)
              }}
              error={formik.touched.mf_jo_pic_source && Boolean(formik.errors.mf_jo_pic_source)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.MF_PRODUCED_ITEM_COST_DATA_SOURCE}
              name='mf_pico_dataSource'
              label={labels.producedItemCost}
              valueField='key'
              displayField='value'
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('mf_pico_dataSource', newValue?.key || null)
              }}
              error={formik.touched.mf_pico_dataSource && Boolean(formik.errors.mf_pico_dataSource)}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </Form>
  )
}

export default MfSettingForm
