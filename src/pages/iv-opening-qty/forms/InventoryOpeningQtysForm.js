import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

const InventoryOpeningQtysForm = ({ labels, maxAccess, recordId, record }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.InventoryOpeningQtys.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: recordId || null,
      year: '',
      siteId: '',
      sku: '',
      itemId: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      year: yup.string().required(),
      siteId: yup.string().required(),
      sku: yup.string().required(),
      itemId: yup.string().required()
    }),
    onSubmit: async obj => {
      const year = formik.values.year
      const itemId = formik.values.itemId
      const siteId = formik.values.siteId

      await postRequest({
        extension: InventoryRepository.InventoryOpeningQtys.set,
        record: JSON.stringify(obj)
      })

      if (!year && !siteId && !itemId) {
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)

      formik.setFieldValue(
        'recordId',

        String(obj.year) + String(obj.itemId) + String(obj.siteId)
      )

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId || !!recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (record && record.year && record.itemId && record.siteId && recordId) {
          const res = await getRequest({
            extension: InventoryRepository.InventoryOpeningQtys.get,
            parameters: `_fiscalYear=${record.year}&_itemId=${record.itemId}&_siteId=${record.siteId}`
          })

          formik.setValues({
            ...res.record,

            recordId: String(res.record.year) + String(res.record.itemId) + String(res.record.siteId)
          })
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell form={formik} resourceId={ResourceIds.InventoryOpeningQtys} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                readOnly={editMode}
                name='year'
                label={labels.fiscalYear}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                refresh={editMode}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('year', newValue?.fiscalYear)
                }}
                error={formik.touched.year && Boolean(formik.errors.year)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                required
                refresh={editMode}
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
              <CustomTextField
                name='sku'
                refresh={editMode}
                label={labels.sku}
                value={formik.values.sku}
                required
                maxLength='50'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('sku', '')}
                error={formik.touched.sku && Boolean(formik.errors.sku)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                refresh={editMode}
                label={labels.item}
                valueField='sku'
                displayField='name'
                valueShow='itemRef'
                required
                secondValueShow='itemName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('itemId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('itemName', newValue ? newValue.name : '')
                  formik.setFieldValue('itemRef', newValue ? newValue.sku : '')
                }}
                errorCheck={'itemId'}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default InventoryOpeningQtysForm
