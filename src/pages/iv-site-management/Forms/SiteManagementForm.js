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
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { IVReplenishementRepository } from 'src/repositories/IVReplenishementRepository'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { DataGrid } from 'src/components/Shared/DataGrid'

export default function SiteManagementForm({ labels, maxAccess, record }) {
  const { platformLabels } = useContext(ControlContext)
  const { recordId, name, sku } = record

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Items.page
  })

  const { formik } = useForm({
    initialValues: {
      itemId: recordId,
      recordId,
      itemName: name,
      sku,
      min: null,
      purchaseRequestFactor: '',
      amcShortTerm: '',
      max: '',
      amcLongTerm: '',
      replenishmentGroupId: '',
      manageByWH: false,
      items: []
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      min: yup
        .number()
        .required()
        .test(function (value) {
          const { max } = this.parent

          return value <= max
        }),

      max: yup
        .number()
        .required()
        .test(function (value) {
          const { min } = this.parent

          return value >= min
        }),
      items: yup
        .array()
        .of(
          yup.object().shape({
            siteMin: yup
              .number()
              .required()
              .test(function (value) {
                const { siteMax } = this.parent

                return value <= siteMax
              }),

            siteMax: yup
              .number()
              .required()
              .test(function (value) {
                const { siteMin } = this.parent

                return value >= siteMin
              })
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const copy = { ...obj }
      delete copy.items

      const updatedRows = formik?.values?.items.map((itemDetail, index) => {
        return {
          ...itemDetail,
          seqNo: index + 1
        }
      })

      const resultObject = {
        header: copy,
        items: updatedRows
      }

      const res = await postRequest({
        extension: InventoryRepository.Management.set2,
        record: JSON.stringify(resultObject)
      })

      refetchForm(res.recordId)
      toast.success(platformLabels.Updated)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  async function refetchForm(recordId) {
    if (recordId) {
      const res = await getRequest({
        extension: InventoryRepository.Management.get,
        parameters: `_itemId=${recordId}`
      })

      const res2 = await getRequest({
        extension: InventoryRepository.SManagement.qry,
        parameters: `_itemId=${recordId}`
      })

      formik.setValues({
        ...res.record,
        recordId: res?.record?.itemId,
        min: res?.record?.min ?? null,
        max: res?.record?.max ?? null,
        items: res2?.list?.map((item, index) => ({
          ...item,
          id: index + 1
        }))
      })
    }
  }

  useEffect(() => {
    ;(async function () {
      await refetchForm(recordId)
    })()
  }, [])

  const columns = [
    {
      component: 'textfield',
      label: labels.reference,
      name: 'siteRef',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'siteName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'checkbox',
      label: labels.locked,
      name: 'isLocked',
      props: {
        disabled: !formik.values.manageByWH
      }
    },
    {
      component: 'numberfield',
      name: 'firstBinLocation',
      label: labels.bin
    },
    {
      component: 'numberfield',
      name: 'onhand',
      label: labels.onhand,
      defaultValue: 0,
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      name: 'committed',
      label: labels.committed,
      defaultValue: 0,
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      name: 'ordered',
      label: labels.ordered,
      defaultValue: 0,
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      name: 'siteMin',
      defaultValue: 0,
      label: labels.min
    },
    {
      component: 'numberfield',
      name: 'siteMax',
      defaultValue: 0,
      label: labels.max
    },
    {
      component: 'numberfield',
      name: 'siteRequired',
      defaultValue: 0,
      label: labels.required
    }
  ]

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: false
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.SManagement}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
      actions={actions}
    >
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <CustomTextField
              name='itemName'
              label={labels.itemName}
              value={formik.values.itemName}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={4}>
            <CustomNumberField
              name='min'
              required
              label={labels.min}
              value={formik.values.min}
              maxAccess={maxAccess}
              maxLength={11}
              decimalScale={2}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('min', '')}
              error={formik.touched.min && Boolean(formik.errors.min)}
            />
          </Grid>
          <Grid item xs={4}>
            <CustomNumberField
              name='purchaseRequestFactor'
              label={labels.purchaseRequestFactor}
              value={formik.values.purchaseRequestFactor}
              maxAccess={maxAccess}
              maxLength={11}
              decimalScale={2}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('purchaseRequestFactor', 0)}
              error={formik.touched.purchaseRequestFactor && Boolean(formik.errors.purchaseRequestFactor)}
            />
          </Grid>
          <Grid item xs={4}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={formik.values.sku}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>

          <Grid item xs={4}>
            <CustomNumberField
              name='max'
              label={labels.max}
              value={formik.values.max}
              required
              maxLength={11}
              decimalScale={2}
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('max', '')}
              error={formik.touched.max && Boolean(formik.errors.max)}
            />
          </Grid>

          <Grid item xs={4}>
            <CustomNumberField
              name='amcShortTerm'
              label={labels.amcShortTerm}
              value={formik.values.amcShortTerm}
              maxAccess={maxAccess}
              maxLength={11}
              decimalScale={2}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('amcShortTerm', 0)}
              error={formik.touched.amcShortTerm && Boolean(formik.errors.amcShortTerm)}
            />
          </Grid>
          <Grid item xs={4}>
            <CustomCheckBox
              name='manageByWH'
              value={formik.values?.manageByWH}
              onChange={event => formik.setFieldValue('manageByWH', event.target.checked)}
              label={labels.manageByWH}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={4}>
            <CustomNumberField
              name='required'
              label={labels.required}
              value={formik.values.required}
              maxAccess={maxAccess}
              maxLength={11}
              decimalScale={2}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('required', 0)}
              error={formik.touched.required && Boolean(formik.errors.required)}
            />
          </Grid>
          <Grid item xs={4}>
            <CustomNumberField
              name='amcLongTerm'
              label={labels.amcLongTerm}
              value={formik.values.amcLongTerm}
              maxAccess={maxAccess}
              maxLength={12}
              decimalScale={2}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('amcLongTerm', 0)}
              error={formik.touched.amcLongTerm && Boolean(formik.errors.amcLongTerm)}
            />
          </Grid>
          <Grid item xs={4}>
            <ResourceComboBox
              endpointId={IVReplenishementRepository.ReplenishmentGroups.qry}
              name='replenishmentGroupId'
              label={labels.replenishmentGroup}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Ref' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik.setFieldValue('replenishmentGroupId', newValue?.recordId)
              }}
              error={formik.touched.replenishmentGroupId && Boolean(formik.errors.replenishmentGroupId)}
            />
          </Grid>
        </Grid>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            allowDelete={false}
            allowAddNewLine={false}
            maxAccess={maxAccess}
            disabled={!formik.values.manageByWH}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
