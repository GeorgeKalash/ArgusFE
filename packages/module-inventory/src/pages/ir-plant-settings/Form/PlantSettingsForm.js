import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { IVReplenishementRepository } from '@argus/repositories/src/repositories/IVReplenishementRepository'

export default function PlantSettingsForm({ labels, maxAccess, recordId, window }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.Plant.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      functionId: SystemFunction.MaterialTransfer,
      dtId: null,
      siteId: null,
      plantId: recordId
    },
    maxAccess,
    validationSchema: yup.object({
      dtId: yup.number().required(),
      siteId: yup.number().required(),
      plantId: yup.number().required()
    }),
    validateOnChange: true,
    onSubmit: async obj => {
      await postRequest({
        extension: IVReplenishementRepository.PlantSettings.set,
        record: JSON.stringify(obj)
      })

      toast.success(platformLabels.Edited)

      invalidate()
      window.close()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
      const res = await getRequest({
        extension: IVReplenishementRepository.PlantSettings.get,
        parameters: `_plantId=${recordId}`
      })

      formik.setValues({
        ...formik.values,
        ...(res?.record || {}),
        recordId,
        plantId: recordId
      })
    }
    })()
  }, [])

  const onClear = async () => {
    await postRequest({
      extension: IVReplenishementRepository.PlantSettings.del,
      record: JSON.stringify(formik.values)
    })

    if (recordId) {
      formik.setValues({
        recordId,
        plantId: recordId
      })
    }
    toast.success(platformLabels.Deleted)
  }

  const actions = [
    {
      key: 'Clear',
      condition: true,
      onClick: onClear,
      disabled: !formik.values.siteId || !formik.values.dtId
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.IRPlantSettings}
      form={formik}
      maxAccess={maxAccess}
      editMode={true}
      actions={actions}
      disabledSubmit={!formik.values.siteId || !formik.values.dtId}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                values={formik.values}
                maxAccess={maxAccess}
                readOnly
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || null)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.MaterialTransfer}`}
                name='dtId'
                required
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                label={labels.site}
                required
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue?.recordId || null)
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
