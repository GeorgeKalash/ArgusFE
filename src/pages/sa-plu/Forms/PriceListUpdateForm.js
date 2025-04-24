import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { SystemFunction } from 'src/resources/SystemFunction'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { DataSets } from 'src/resources/DataSets'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'

export default function PriceListUpdateForm({ labels, maxAccess: access, setStore, store }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.PriceListUpdate,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: SaleRepository.PriceListUpdate.page
  })

  const { formik } = useForm({
    maxAccess,
    validateOnChange: true,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      reference: '',
      status: 1,
      releaseStatus: 1,
      date: new Date(),
      type: '',
      amount: null,
      plId: null,
      groupId: null,
      dtId: null,
      currencyId: null,
      pgId: null,
      productionLineId: null,
      categoryId: null
    },
    validationSchema: yup.object({
      date: yup.date().required(),
      type: yup.string().required(),
      amount: yup.number().required(),
      plId: yup.number().required(),
      currencyId: yup.number().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: SaleRepository.PriceListUpdate.set,
        record: JSON.stringify({ ...obj, date: formatDateToApi(obj.date) })
      })
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      await getData(response.recordId)
      setStore({ ...store, recordId: response.recordId })
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status === 3

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await getData(recordId)
      }
    })()
  }, [])

  async function getData(recordId) {
    if (recordId) {
      const res = await getRequest({
        extension: SaleRepository.PriceListUpdate.get,
        parameters: `_recordId=${recordId}`
      })

      formik.setValues({ ...res.record, date: formatDateFromApi(res.record.date) })
    }
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: SaleRepository.PriceListUpdate.unpost,
      record: JSON.stringify(formik.values)
    })

    if (res) {
      toast.success(platformLabels.Unposted)
      invalidate()
      await getData(formik.values.recordId)
    }
  }

  const onPost = async () => {
    const res = await postRequest({
      extension: SaleRepository.PriceListUpdate.post,
      record: JSON.stringify(formik.values)
    })

    if (res) {
      toast.success(platformLabels.Posted)
      invalidate()
      await getData(formik.values.recordId)
    }
  }

  const onGenerate = async () => {
    await postRequest({
      extension: SaleRepository.PriceListUpdate.generate,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Generated)
    invalidate()
  }

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !editMode
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    },
    {
      key: 'generate',
      condition: true,
      onClick: onGenerate,
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.PriceListUpdates}
      functionId={SystemFunction.PriceListUpdate}
      form={formik}
      actions={actions}
      maxAccess={maxAccess}
      editMode={editMode}
      disabledSubmit={isPosted}
      previewReport={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${SystemFunction.PriceListUpdate}&_startAt=${0}&_pageSize=${50}`}
                filter={!editMode ? item => item.activeStatus === 1 : undefined}
                name='dtId'
                label={labels.documentType}
                readOnly={editMode}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                  changeDT(newValue)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                readOnly={editMode}
                maxAccess={!editMode && maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                readOnly={isPosted}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.PRICE_LIST_UPDATE_TYPE}
                name='type'
                label={labels.type}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                readOnly={isPosted}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('type', newValue?.key || null)
                }}
                error={formik.touched.type && Boolean(formik.errors.type)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='amount'
                label={labels.amount}
                value={formik?.values?.amount}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('amount', e.target.value)}
                onClear={() => formik.setFieldValue('amount', null)}
                required
                readOnly={isPosted}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                maxLength={12}
                decimalScale={3}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.PriceLevel.qry}
                name='plId'
                label={labels.priceLevel}
                valueField='recordId'
                required
                displayField={'name'}
                displayFieldWidth={1}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                readOnly={isPosted}
                onChange={(_, newValue) => {
                  formik.setFieldValue('plId', newValue?.recordId || '')
                }}
                error={formik.touched.plId && Boolean(formik.errors.plId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Group.qry}
                parameters='_startAt=0&_pageSize=1000'
                name='groupId'
                label={labels.itemGroupFilter}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                readOnly={isPosted}
                onChange={(_, newValue) => {
                  formik.setFieldValue('groupId', newValue?.recordId || null)
                }}
                error={formik.touched.groupId && Boolean(formik.errors.groupId)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionLine.qry}
                parameters='_startAt=0&_pageSize=1000'
                values={formik.values}
                name='productionLineId'
                label={labels.productionLine}
                valueField='recordId'
                displayField={['reference', 'name']}
                displayFieldWidth={1}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={isPosted}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('productionLineId', newValue?.recordId || null)
                }}
                error={formik.touched.productionLineId && formik.errors.productionLineId}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Category.qry}
                parameters='_pagesize=30&_startAt=0&_name='
                name='categoryId'
                label={labels.category}
                valueField='recordId'
                displayField={'name'}
                displayFieldWidth={1}
                values={formik?.values}
                maxAccess={access}
                readOnly={isPosted}
                onChange={(_, newValue) => {
                  formik.setFieldValue('categoryId', newValue?.recordId || null)
                }}
                error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                readOnly={isPosted}
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.PriceGroups.qry}
                name='pgId'
                label={labels.priceGroup}
                valueField='recordId'
                displayField='name'
                readOnly={isPosted}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('pgId', newValue?.recordId || null)
                }}
                onClear={() => formik.setFieldValue('pgId', null)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
