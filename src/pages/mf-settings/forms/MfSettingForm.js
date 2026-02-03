import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import { useForm } from 'src/hooks/form'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { DataSets } from 'src/resources/DataSets'
import Form from 'src/components/Shared/Form'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

const MfSettingForm = ({ _labels, access }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  const DefaultFields = {
    AVA_SITE_ID: 'mf_ava_siteId',
    FG_SITE_ID: 'mf_fg_siteId',
    RM_SITE_ID: 'mf_rm_siteId',
    JO_PIC_SOURCE: 'mf_jo_pic_source',
    PICO_DATASOURCE: 'mf_pico_dataSource',
    MAX_ALLOW_QTY_VARIATION: 'mfMaxAllowQtyVariation'
  }

  const DecimalFields = {
    MAX_ALLOW_QTY_VARIATION: DefaultFields.MAX_ALLOW_QTY_VARIATION
  }

  const { formik } = useForm({
    maxAccess: access,
    initialValues: Object.values(DefaultFields).reduce(
      (acc, key) => ({ ...acc, [key]: null }),
      {}
    ),
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

  const parseDefaultValue = (key, value) => {
    if (!value) return null

    return Object.values(DecimalFields).includes(key) ? Number(value) : parseInt(value, 10)
  }

  useEffect(() => {
    if (!defaultsData?.list?.length) return

    defaultsData.list.forEach(({ key, value }) => {
      if (!Object.values(DefaultFields).includes(key)) return
      formik.setFieldValue(key, parseDefaultValue(key, value))
    })
  }, [defaultsData])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Site.qry}
              name='mf_fg_siteId'
              label={_labels.finishedGoodSites}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              maxAccess={access}
              onChange={(_, newValue) => formik.setFieldValue('mf_fg_siteId', newValue?.recordId || null) }
              error={formik.touched.mf_fg_siteId && Boolean(formik.errors.mf_fg_siteId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Site.qry}
              name='mf_ava_siteId'
              label={_labels.availabilitySite}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              maxAccess={access}
              onChange={(_, newValue) => formik.setFieldValue('mf_ava_siteId', newValue?.recordId || null) }
              error={formik.touched.mf_ava_siteId && Boolean(formik.errors.mf_ava_siteId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Site.qry}
              name='mf_rm_siteId'
              label={_labels.rawMaterialsSite}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              maxAccess={access}
              onChange={(_, newValue) => formik.setFieldValue('mf_rm_siteId', newValue?.recordId || null) }
              error={formik.touched.mf_rm_siteId && Boolean(formik.errors.mf_rm_siteId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.JOB_PICTURE}
              name='mf_jo_pic_source'
              label={_labels.jobPicture}
              valueField='key'
              displayField='value'
              values={formik.values}
              onChange={(_, newValue) => formik.setFieldValue('mf_jo_pic_source', newValue?.key || null)}
              error={formik.touched.mf_jo_pic_source && Boolean(formik.errors.mf_jo_pic_source)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.MF_PRODUCED_ITEM_COST_DATA_SOURCE}
              name='mf_pico_dataSource'
              label={_labels.producedItemCost}
              valueField='key'
              displayField='value'
              values={formik.values}
              maxAccess={access}
              onChange={(_, newValue) => formik.setFieldValue('mf_pico_dataSource', newValue?.key || null) }
              error={formik.touched.mf_pico_dataSource && Boolean(formik.errors.mf_pico_dataSource)}
            />
          </Grid>
           <Grid item xs={12}>
              <CustomNumberField
                name='mfMaxAllowQtyVariation'
                label={_labels.mfMaxAllowQtyVariation}
                value={formik.values.mfMaxAllowQtyVariation}
                maxAccess={access}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('mfMaxAllowQtyVariation', null)}
                error={formik.touched.mfMaxAllowQtyVariation && Boolean(formik.errors.mfMaxAllowQtyVariation)}
              />
            </Grid>
        </Grid>
      </VertLayout>
    </Form>
  )
}

export default MfSettingForm
