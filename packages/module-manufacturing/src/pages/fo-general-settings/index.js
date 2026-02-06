import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { FoundryRepository } from '@argus/repositories/src/repositories/FoundryRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const FoGeneralSettings = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.GeneralSettings
  })

  useEffect(() => {
    ;(async function () {
      const res = await getRequest({
        extension: SystemRepository.Defaults.qry,
        parameters: `_filter=`
      })

      const keysToExtract = [
        'waxSiteId',
        'castingSiteId',
        'meltingSiteId',
        'mfCentralSiteId',
        'castingWorkCenterId',
        'mfRestoredMetalItem',
        'waxOperationId',
        'castingOperationId'
      ]

      const myObject = {}

      for (const { key, value } of res.list) {
        if (keysToExtract.includes(key)) {
          myObject[key] = value ? parseInt(value) : null

          if (key === 'mfRestoredMetalItem' && parseInt(value)) {
            const itemRes = await getRequest({
              extension: InventoryRepository.Item.get,
              parameters: `_recordId=${parseInt(value)}`
            })

            myObject['mfRestoredMetalItemRef'] = itemRes.record?.sku || null
            myObject['mfRestoredMetalItemName'] = itemRes.record?.name || ''
          }
        }
      }

      formik.setValues(myObject)
    })()
  }, [])

  const { formik } = useForm({
    maxAccess: access,
    validateOnChange: true,
    initialValues: {
      waxSiteId: null,
      castingSiteId: null,
      meltingSiteId: null,
      mfCentralSiteId: null,
      castingWorkCenterId: null,
      mfRestoredMetalItem: null,
      mfRestoredMetalItemRef: '',
      mfRestoredMetalItemName: '',
      waxOperationId: null,
      castingOperationId: null
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

  return (
    <FormShell
      resourceId={ResourceIds.GeneralSettings}
      form={formik}
      isInfo={false}
      isCleared={false}
      maxAccess={access}
    >
      <VertLayout>
        <Grid container spacing={2} xs={5}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Site.qry}
              name='waxSiteId'
              label={labels.waxSite}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField={['reference', 'name']}
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('waxSiteId', newValue?.recordId || null)
              }}
              error={formik.touched.waxSiteId && Boolean(formik.errors.waxSiteId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Site.qry}
              name='castingSiteId'
              label={labels.castingSite}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField={['reference', 'name']}
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('castingSiteId', newValue?.recordId || null)
              }}
              error={formik.touched.castingSiteId && Boolean(formik.errors.castingSiteId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Site.qry}
              name='meltingSiteId'
              label={labels.meltingSite}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField={['reference', 'name']}
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('meltingSiteId', newValue?.recordId || null)
              }}
              error={formik.touched.meltingSiteId && Boolean(formik.errors.meltingSiteId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Site.qry}
              name='mfCentralSiteId'
              label={labels.centralSite}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField={['reference', 'name']}
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('mfCentralSiteId', newValue?.recordId || null)
              }}
              error={formik.touched.mfCentralSiteId && Boolean(formik.errors.mfCentralSiteId)}
            />
          </Grid>

          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={FoundryRepository.WorkCenter.qry}
              name='castingWorkCenterId'
              label={labels.castingWorkCenter}
              valueField='workCenterId'
              displayField='workCenterName'
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('castingWorkCenterId', newValue?.workCenterId || null)
              }}
              error={formik.touched.castingWorkCenterId && Boolean(formik.errors.castingWorkCenterId)}
            />
          </Grid>

          <Grid item xs={12}>
            <ResourceLookup
              endpointId={InventoryRepository.Item.snapshot}
              name='mfRestoredMetalItem'
              label={labels.restoredMetalLossItem}
              valueField='sku'
              displayField='name'
              valueShow='mfRestoredMetalItemRef'
              secondValueShow='mfRestoredMetalItemName'
              form={formik}
              columnsInDropDown={[
                { key: 'sku', value: 'SKU' },
                { key: 'name', value: 'Name' }
              ]}
              onChange={(event, newValue) => {
                formik.setFieldValue('mfRestoredMetalItem', newValue?.recordId || null)
                formik.setFieldValue('mfRestoredMetalItemName', newValue?.name || '')
                formik.setFieldValue('mfRestoredMetalItemRef', newValue?.sku || '')
              }}
              displayFieldWidth={2}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={ManufacturingRepository.Operation.qry}
              parameters='_workCenterId=0'
              name='waxOperationId'
              label={labels.waxOperation}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField={['reference', 'name']}
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('waxOperationId', newValue?.recordId || null)
              }}
              error={formik.touched.waxOperationId && Boolean(formik.errors.waxOperationId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={ManufacturingRepository.Operation.qry}
              parameters='_workCenterId=0'
              name='castingOperationId'
              label={labels.castingOperation}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField={['reference', 'name']}
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('castingOperationId', newValue?.recordId || null)
              }}
              error={formik.touched.castingOperationId && Boolean(formik.errors.castingOperationId)}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}

export default FoGeneralSettings
