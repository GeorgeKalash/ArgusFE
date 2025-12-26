import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'

export default function ProdSheetDtdForm({ labels, maxAccess, recordId }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.DocumentTypeDefault.page
  })

  const { formik } = useForm({
    initialValues: {
      dtId: '',
      recordId: recordId || null,
      siteId: '',
      disableSKULookup: false
    },
    maxAccess,
    validationSchema: yup.object({
      dtId: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: ManufacturingRepository.DocumentTypeDefault.set,
        record: JSON.stringify(obj)
      })

      if (!obj.dtId) {
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Updated)
      formik.setFieldValue('recordId', formik.values.dtId)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: ManufacturingRepository.DocumentTypeDefault.get,
          parameters: `_dtId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          recordId: recordId
        })
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.ProdSheetDocumentTypeDefault}
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
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.ProductionSheet}`}
                name='dtId'
                required
                label={labels.docType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={'name'}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('dtId', newValue?.recordId || '')
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
                  formik && formik.setFieldValue('siteId', newValue?.recordId)
                }}
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
