import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { BrokerageTradingRepository } from '@argus/repositories/src/repositories/BrokerageTradingRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

export default function CommodityPairsForm({ labels, maxAccess, record, recordId }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults } = useContext(DefaultsContext)
  const msId = parseInt(systemDefaults?.list?.find(obj => obj.key === 'fixing_msId')?.value) || null


  const invalidate = useInvalidate({
    endpointId: BrokerageTradingRepository.CommodityPair.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      currencyId: null,
      metalId: null,
      defQtyMUId: null,
      defUnitPriceMUId: null
    },
    maxAccess,
    validationSchema: yup.object({
      currencyId: yup.number().required(),
      metalId: yup.number().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: BrokerageTradingRepository.CommodityPair.set,
        record: JSON.stringify(obj)
      })

      !obj.recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)

      formik.setFieldValue('recordId', String(obj.metalId * 10) + obj.currencyId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    if (record && recordId)
      formik.setValues({
        ...record,
        recordId: String(record.metalId * 10) + record.currencyId
      })
  }, [])

  return (
    <FormShell resourceId={ResourceIds.CommodityPair} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Metals.qry}
                name='metalId'
                label={labels.metal}
                valueField='recordId'
                displayField={'reference'}
                values={formik.values}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('metalId', newValue?.recordId || null)
                }}
                error={formik.touched.metalId && Boolean(formik.errors.metalId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={msId && InventoryRepository.MeasurementUnit.qry}
                parameters={msId && `_msId=${msId}`}
                name='defQtyMUId'
                label={labels.defQtyMU}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('defQtyMUId', newValue?.recordId || null)
                }}
                error={formik.touched.defQtyMUId && Boolean(formik.errors.defQtyMUId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={msId && InventoryRepository.MeasurementUnit.qry}
                parameters={msId && `_msId=${msId}`}
                name='defUnitPriceMUId'
                label={labels.defUnitPriceMU}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('defUnitPriceMUId', newValue?.recordId || null)
                }}
                error={formik.touched.defUnitPriceMUId && Boolean(formik.errors.defUnitPriceMUId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
