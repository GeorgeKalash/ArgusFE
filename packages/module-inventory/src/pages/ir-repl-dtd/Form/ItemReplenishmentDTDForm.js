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
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { IVReplenishementRepository } from '@argus/repositories/src/repositories/IVReplenishementRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'

export default function ItemReplenishmentDTDForm({ labels, maxAccess, recordId, window }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: IVReplenishementRepository.DocumentTypeDefault.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      functionId: SystemFunction.MaterialRequest,
      dtId: null,
      siteId: null,
      disableSKULookup: false
    },
    maxAccess,
    validationSchema: yup.object({
      dtId: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: IVReplenishementRepository.DocumentTypeDefault.set,
        record: JSON.stringify(obj)
      })

      formik.setFieldValue('recordId', formik.values.dtId)

      toast.success(!recordId ? platformLabels.Added : platformLabels.Edited)

      invalidate()
      window.close()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: IVReplenishementRepository.DocumentTypeDefault.get,
          parameters: `_dtId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          recordId: res.record.dtId
        })
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.IRMaterialDocTypeDefaults}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.MaterialRequest}`}
                name='dtId'
                required
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                readOnly={editMode}
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
            <Grid item xs={12}>
              <CustomCheckBox
                name='disableSKULookup'
                value={formik.values?.disableSKULookup}
                onChange={event => formik.setFieldValue('disableSKULookup', event.target.checked)}
                label={labels.dsl}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
