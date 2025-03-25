import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import { ResourceIds } from 'src/resources/ResourceIds'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'

export default function PurchaseDTDForm({ labels, maxAccess, recordId, functionId }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: PurchaseRepository.DocumentTypeDefault.page
  })

  const { formik } = useForm({
    initialValues: {
      dtId: null,
      recordId,
      plantId: null,
      spId: null,
      siteId: null,
      disableSKULookup: false,
      commitItems: false,
      postMetalToFinancials: false,
      updateDocDateOnPost: false
    },
    maxAccess,
    validationSchema: yup.object({
      dtId: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: PurchaseRepository.DocumentTypeDefault.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        formik.setFieldValue('recordId', formik.values.dtId)

        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: PurchaseRepository.DocumentTypeDefault.get,
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
      resourceId={ResourceIds.PUDocumentTypeDefaults}
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
                parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
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
                  formik.setFieldValue('dtId', newValue?.recordId)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
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
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                label={labels.site}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue?.recordId)
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='commitItems'
                value={formik.values?.commitItems}
                onChange={event => formik.setFieldValue('commitItems', event.target.checked)}
                label={labels.commitItems}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='postMetalToFinancials'
                value={formik.values?.postMetalToFinancials}
                onChange={event => formik.setFieldValue('postMetalToFinancials', event.target.checked)}
                label={labels.postMetalToFinancials}
                maxAccess={maxAccess}
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
            <Grid item xs={12}>
              <CustomCheckBox
                name='updateDocDateOnPost'
                value={formik.values?.updateDocDateOnPost}
                onChange={event => formik.setFieldValue('updateDocDateOnPost', event.target.checked)}
                label={labels.updateDocDateOnPost}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
