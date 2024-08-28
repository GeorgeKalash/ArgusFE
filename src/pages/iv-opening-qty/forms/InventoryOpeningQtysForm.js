import { Checkbox, fabClasses, FormControlLabel, Grid } from '@mui/material'
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
      itemId: '',
      itemName: '',
      qty: '',
      pieces: '',
      avgWeight: '',
      lotCategoryId: '',
      trackBy: '',
      pieces: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      year: yup.string().required(),
      siteId: yup.string().required(),
      sku: yup.string().required(),
      itemId: yup.string().required(),
      qty: yup.number().required().min(0.01, 'Quantity must be greater than 0'),
      avgWeight: yup.number().nullable().max(999999, 'Quantity must be less than 999999')
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
                readOnly={editMode}
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
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='sku'
                refresh={editMode}
                readOnly={editMode}
                secondDisplayField={false}
                label={labels.sku}
                valueField='sku'
                displayField='sku'
                valueShow='sku'
                required
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('itemId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('itemName', newValue ? newValue.name : '')
                  formik.setFieldValue('sku', newValue ? newValue.sku : '')
                  formik.setFieldValue('trackBy', newValue ? newValue.trackBy : '')
                  formik.setFieldValue('lotCategory', newValue ? newValue.lotCategory : '')
                }}
                errorCheck={'sku'}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                endpointId={InventoryRepository.Item.snapshot}
                name='itemName'
                value={formik.values.itemName}
                readOnly
                label={labels.item}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='qty'
                required
                label={labels.qty}
                value={formik?.values?.qty}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('qty', '')}
                error={formik.touched.qty && Boolean(formik.errors.qty)}
                decimalScale={3}
                allowNegative={false}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='pieces'
                label={labels.pieces}
                readOnly
                value={formik?.values?.pieces}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('pieces', '')}
                decimalScale={2}
                error={formik.touched.pieces && Boolean(formik.errors.pieces)}
                allowNegative={false}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='avgWeight'
                label={labels.avgWeight}
                value={formik?.values?.avgWeight}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('avgWeight', '')}
                decimalScale={2}
                error={formik.touched.avgWeight && Boolean(formik.errors.avgWeight)}
                maxLength={8}
                allowNegative={false}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default InventoryOpeningQtysForm
