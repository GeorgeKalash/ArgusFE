import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataSets } from 'src/resources/DataSets'

export default function DocumentTypeDefaultForm({ labels, maxAccess, recordId, functionId }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.DocumentTypeDefault.qry
  })

  const { formik } = useForm({
    initialValues: {
      dtId: '',
      recordId: recordId || null,
      commitItems: false,
      plantId: '',
      spId: '',
      allocateBy: null,
      postMetalToFinancials: false,
      siteId: '',
      disableSKULookup: false
    },
    maxAccess,
    enableReinitialize: false,
    validationSchema: yup.object({
      dtId: yup.string().required(),
      allocateBy: yup
        .string()
        .transform(value => (value === null ? '' : value))
        .test('required-allocateBy', ' ', function (value) {
          const { commitItems } = this.parent
          if (commitItems) {
            return !!value
          }

          return true
        })
    }),
    onSubmit: async obj => {
      try {
        const submitObj = {
          ...obj,
          allocateBy: obj.allocateBy === null ? '' : obj.allocateBy
        }

        const response = await postRequest({
          extension: SaleRepository.DocumentTypeDefault.set,
          record: JSON.stringify(submitObj)
        })

        if (!formik.values.recordId) {
          formik.setFieldValue('recordId', formik.values.dtId)

          toast.success(platformLabels.Added)
        } else toast.success(platformLabels.Edited)

        invalidate()
      } catch (error) {}
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: SaleRepository.DocumentTypeDefault.get,
            parameters: `_dtId=${recordId}`
          })

          formik.setValues({
            ...res.record,
            recordId: res.record.dtId,
            allocateBy: res.record.allocateBy || '',
            disableSKULookup: Boolean(res.record.disableSKULookup)
          })
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.DocumentTypeDefault}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      functionId={functionId}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
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
                  formik && formik.setFieldValue('dtId', newValue?.recordId || '')
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.SalesPerson.qry}
                name='spId'
                label={labels.salesPerson}
                columnsInDropDown={[{ key: 'name', value: 'Name' }]}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('spId', newValue?.recordId)
                  } else {
                    formik.setFieldValue('spId', '')
                  }
                }}
                error={formik.touched.spId && Boolean(formik.errors.spId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                readOnly={formik.values.status == '3'}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'plant Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  const plantId = newValue?.recordId || ''
                  formik.setFieldValue('plantId', plantId)
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
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue?.recordId)
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    maxAccess={maxAccess}
                    name='commitItems'
                    checked={formik.values?.commitItems}
                    onChange={event => {
                      formik.handleChange(event)
                      if (!event.target.checked) {
                        formik.setFieldValue('allocateBy', '')
                      }
                    }}
                  />
                }
                label={labels.commitItems}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.SA_ALLOCATE_BY}
                name='allocateBy'
                required={!!formik.values.commitItems}
                readOnly={!formik.values.commitItems}
                label={labels.allocateBy}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('allocateBy', newValue?.key || '')
                }}
                error={formik.touched.allocateBy && formik.values.commitItems && Boolean(formik.errors.allocateBy)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    maxAccess={maxAccess}
                    name='postMetalToFinancials'
                    checked={formik.values?.postMetalToFinancials}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.postMetalToFinancials}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    maxAccess={maxAccess}
                    name='disableSKULookup'
                    checked={formik.values?.disableSKULookup}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.dsl}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
