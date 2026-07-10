import { Grid } from '@mui/material'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { OpeningSerialsForm } from './OpeningSerialsForm'

const InventoryOpeningQtysForm = ({ labels, maxAccess, recordId, record }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.InventoryOpeningQtys.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: recordId,
      year: null,
      siteId: null,
      sku: '',
      itemId: null,
      itemName: '',
      qty: null,
      pieces: null,
      lotCategoryId: null,
      trackBy: null,
      periodId: null
    },
    validationSchema: yup.object({
      year: yup.number().required(),
      siteId: yup.number().required(),
      sku: yup.string().required(),
      itemId: yup.number().required(),
      qty: yup.number().required().min(0.01),
      periodId: yup.number().required()
    }),
    onSubmit: async obj => {
      const year = formik.values.year
      const itemId = formik.values.itemId
      const siteId = formik.values.siteId

      await postRequest({
        extension: InventoryRepository.InventoryOpeningQtys.set,
        record: JSON.stringify(obj)
      })

      if (!year && !siteId && !itemId && !periodId) {
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)

      formik.setFieldValue(
        'recordId',
        String(obj.year * 100) + String(obj.itemId * 10) + String(obj.siteId) + String(obj.periodId)
      )

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (record && record.year && record.itemId && record.siteId && recordId) {
        const res = await getRequest({
          extension: InventoryRepository.InventoryOpeningQtys.get,
          parameters: `_fiscalYear=${record.year}&_itemId=${record.itemId}&_siteId=${record.siteId}&_periodId=${record.periodId}`
        })

        formik.setValues({
          ...res.record,

          recordId:
            String(res.record.year * 100) +
            String(res.record.itemId * 10) +
            String(res.record.siteId) +
            String(res.record.periodId)
        })
      }
    })()
  }, [])

  const OpenSerialsForm = () => {
    stack({
      Component: OpeningSerialsForm,
      props: {
        parentForm: formik.values
      },
      width: 700,
      height: 600,
      title: labels.Serials
    })
  }

  const actions = [
    {
      key: 'Serials',
      condition: true,
      onClick: OpenSerialsForm,
      disabled: !editMode || formik.values.trackBy != 1
    }
  ]

  return (
    <FormShell
      form={formik}
      actions={actions}
      resourceId={ResourceIds.InventoryOpeningQtys}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
                onChange={(_, newValue) => formik.setFieldValue('year', newValue?.fiscalYear || null)}
                error={formik.touched.year && Boolean(formik.errors.year)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalPeriod.qry}
                name='periodId'
                label={labels.fiscalPeriod}
                valueField='periodId'
                displayField='name'
                values={formik.values}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('periodId', newValue?.periodId || null)}
                error={formik.touched.periodId && Boolean(formik.errors.periodId)}
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
                onChange={(_, newValue) => formik.setFieldValue('siteId', newValue?.recordId || null)}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='sku'
                readOnly={editMode}
                secondDisplayField={false}
                label={labels.sku}
                valueField='itemId'
                displayField='sku'
                columnsInDropDown={[
                  { key: 'sku', value: 'SKU' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'FL Name' },
                ]}
                valueShow='sku'
                required
                form={formik}
                onChange={(_, newValue) => {
                  formik.setFieldValue('itemName', newValue ? newValue.name : '')
                  formik.setFieldValue('sku', newValue ? newValue.sku : '')
                  formik.setFieldValue('trackBy', newValue ? newValue.trackBy : null)
                  formik.setFieldValue('lotCategory', newValue ? newValue.lotCategory : null)
                  formik.setFieldValue('itemId', newValue?.recordId || null)
                }}
                errorCheck={'sku'}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
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
                onClear={() => formik.setFieldValue('qty', null)}
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
                onClear={() => formik.setFieldValue('pieces', null)}
                decimalScale={2}
                error={formik.touched.pieces && Boolean(formik.errors.pieces)}
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
