import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomDateTimePicker from '@argus/shared-ui/src/components/Inputs/CustomDateTimePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ProductModelingRepository } from '@argus/repositories/src/repositories/ProductModelingRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'

export default function ModellingForm({ labels, access, setStore, store }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { recordId } = store

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.ModelMaker,
    access: access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: ProductModelingRepository.ModelMaker.page
  })

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      dtId: null,
      reference: null,
      date: new Date(),
      threeDPId: null,
      laborId: null,
      startDate: null,
      endDate: null,
      productionClassId: null,
      productionStandardId: null,
      collectionId: null,
      itemGroupId: null,
      designGroupId: null,
      designFamilyId: null,
      metalId: null,
      weight: 0,
      wip: null,
      notes: '',
      status: 1,
      productionLineId: null
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      laborId: yup.string().required(),
      threeDPId: yup.string().required(),
      date: yup.date().required(),
      startDate: yup.date().required(),
      endDate: yup.date().required()
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: ProductModelingRepository.ModelMaker.set,
        record: JSON.stringify({
          ...obj,
          date: formatDateToApi(obj.date),
          startDate: formatDateToApi(obj.startDate),
          endDate: formatDateToApi(obj.endDate)
        })
      })

      toast.success(recordId ? platformLabels.Edited : platformLabels.Added)
      refetchForm(res?.recordId)
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip == 2
  const isPosted = formik.values.status == 3

  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: ProductModelingRepository.ModelMaker.get,
      parameters: `_recordId=${recordId}`
    })

    formik.setValues({
      ...res.record,
      date: formatDateFromApi(res?.record?.date),
      startDate: formatDateFromApi(res?.record?.startDate),
      endDate: formatDateFromApi(res?.record?.endDate)
    })
    setStore(prevStore => ({
      ...prevStore,
      recordId: res?.record?.recordId,
      isClosed: res?.record?.wip === 2
    }))
  }
  async function onClose() {
    const res = await postRequest({
      extension: ProductModelingRepository.ModelMaker.close,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik?.values?.date),
        startDate: formik?.values?.startDate ? formatDateToApi(formik?.values?.startDate) : null,
        endDate: formik?.values?.endDate ? formatDateToApi(formik?.values?.endDate) : null
      })
    })
    toast.success(platformLabels.Closed)
    invalidate()
    refetchForm(res.recordId)
  }
  async function onReopen() {
    const res = await postRequest({
      extension: ProductModelingRepository.ModelMaker.reopen,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik?.values?.date),
        startDate: formik?.values?.startDate ? formatDateToApi(formik?.values?.startDate) : null,
        endDate: formik?.values?.endDate ? formatDateToApi(formik?.values?.endDate) : null
      })
    })
    toast.success(platformLabels.Reopened)
    invalidate()
    refetchForm(res.recordId)
  }

  async function onPost() {
    const res = await postRequest({
      extension: ProductModelingRepository.ModelMaker.post,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik?.values?.date),
        startDate: formik?.values?.startDate ? formatDateToApi(formik?.values?.startDate) : null,
        endDate: formik?.values?.endDate ? formatDateToApi(formik?.values?.endDate) : null
      })
    })
    toast.success(platformLabels.Posted)
    invalidate()
    refetchForm(res.recordId)
  }

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      disabled: isPosted
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || !isClosed
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || !editMode || isPosted
    }
  ]
  useEffect(() => {
    if (recordId) refetchForm(recordId)
  }, [])

  const getProduct = async recordId => {
    return await getRequest({
      extension: ProductModelingRepository.Printing.get,
      parameters: `_recordId=${recordId}`
    })
  }

  const getDesign = async recordId => {
    return await getRequest({
      extension: ProductModelingRepository.ThreeDDesign.get,
      parameters: `_recordId=${recordId}`
    })
  }

  return (
    <FormShell
      resourceId={ResourceIds.ModelMaker}
      functionId={SystemFunction.ModelMaker}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.ModelMaker}`}
                name='dtId'
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={editMode}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={async (event, newValue) => {
                  changeDT(newValue)

                  formik.setFieldValue('productionLineId', null)

                  if (newValue?.recordId) {
                    const { record } = await getRequest({
                      extension: ProductModelingRepository.DocumentTypeDefault.get,
                      parameters: `_dtId=${newValue?.recordId}`
                    })

                    formik.setFieldValue('productionLineId', record?.productionLineId)

                    if (record?.productionLineId) {
                      formik.setFieldValue('threeDPRef', '')
                      formik.setFieldValue('threeDPId', null)

                      formik.setFieldValue('designGroupId', null)
                      formik.setFieldValue('designFamilyId', null)
                      formik.setFieldValue('productionClassId', null)
                      formik.setFieldValue('productionStandardId', null)
                      formik.setFieldValue('collectionId', null)
                      formik.setFieldValue('itemGroupId', null)
                      formik.setFieldValue('metalId', null)
                      formik.setFieldValue('productionClassRef', '')
                      formik.setFieldValue('productionClassName', '')
                    }
                  }
                  formik.setFieldValue('dtId', newValue?.recordId)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.reference}
                maxAccess={!editMode && maxAccess}
                readOnly={editMode}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', null)}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
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
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('productionLineId', newValue?.recordId || null)
                }}
                readOnly
                error={formik.touched.productionLineId && formik.errors.productionLineId}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                readOnly={isClosed}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDateTimePicker
                name='startDate'
                required
                label={labels.startDate}
                value={formik.values.startDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                readOnly={isClosed}
                onClear={() => formik.setFieldValue('startDate', null)}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDateTimePicker
                name='endDate'
                required
                label={labels.endDate}
                value={formik.values.endDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                readOnly={isClosed}
                onClear={() => formik.setFieldValue('endDate', null)}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.Labor.qry}
                parameters={`_startAt=0&_pageSize=200&_params=`}
                name='laborId'
                required
                readOnly={isClosed}
                label={labels.labor}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('laborId', newValue?.recordId || null)
                }}
                error={formik.touched.laborId && Boolean(formik.errors.laborId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={ProductModelingRepository.Printing.snapshot2}
                parameters={{ _productionLineId: formik.values.productionLineId || 0 }}
                valueLink={{
                  resourceId: ResourceIds.ThreeDPrint,
                  props: {
                    recordId: formik.values.threeDPId
                  }
                }}
                valueField='reference'
                displayField='reference'
                name='threeDPId'
                label={labels.print}
                form={formik}
                readOnly={isClosed}
                valueShow='threeDPRef'
                maxAccess={maxAccess}
                editMode={editMode}
                secondDisplayField={false}
                required
                columnsInDropDown={[
                  { key: 'reference', value: 'Ref' },
                  { key: 'date', value: 'Date', type: 'date' }
                ]}
                onChange={async (event, newValue) => {
                  if (newValue?.recordId) {
                    const res = await getProduct(newValue?.recordId)
                    const res2 = await getDesign(newValue?.threeDDId)
                    formik.setFieldValue('designFamilyId', res?.record?.designFamilyId || null)
                    formik.setFieldValue('designGroupId', res?.record?.designGroupId || null)
                    formik.setFieldValue('productionClassId', res2?.record?.productionClassId || null)
                    formik.setFieldValue('productionStandardId', res2?.record?.productionStandardId || null)
                    formik.setFieldValue('collectionId', res2?.record?.collectionId || null)
                    formik.setFieldValue('itemGroupId', res2?.record?.itemGroupId || null)
                    formik.setFieldValue('metalId', res2?.record?.metalId || null)
                  }
                  formik.setFieldValue('threeDPRef', newValue?.reference)
                  formik.setFieldValue('threeDPId', newValue?.recordId)
                }}
                errorCheck={'threeDPId'}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.DesignFamily.qry}
                name='designFamilyId'
                label={labels.familyGroup}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                readOnly
                onChange={(_, newValue) => formik.setFieldValue('designFamilyId', newValue?.recordId || null)}
                error={formik?.touched?.designFamilyId && Boolean(formik?.errors?.designFamilyId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.DesignGroup.qry}
                name='designGroupId'
                label={labels.designGroup}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                readOnly
                onChange={(_, newValue) => formik.setFieldValue('designGroupId', newValue?.recordId || null)}
                error={formik?.touched?.designGroupId && Boolean(formik?.errors?.designGroupId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionClass.qry}
                values={formik.values}
                name='productionClassId'
                label={labels.productionClass}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                readOnly
                onChange={(event, newValue) => {
                  formik.setFieldValue('productionClassId', newValue?.recordId || null)
                }}
                error={formik.touched.productionClassId && Boolean(formik.errors.productionClassId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionStandard.qry}
                values={formik.values}
                name='productionStandardId'
                label={labels.productionStandard}
                valueField='recordId'
                displayField='reference'
                maxAccess={maxAccess}
                readOnly
                onChange={(_, newValue) => formik.setFieldValue('productionStandardId', newValue?.recordId || null)}
                error={formik.touched.productionStandardId && Boolean(formik.errors.productionStandardId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Collections.qry}
                name='collectionId'
                label={labels.collection}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly
                maxAccess={maxAccess}
                values={formik.values}
                onChange={(_, newValue) => formik.setFieldValue('collectionId', newValue?.recordId || null)}
                error={formik?.touched?.collectionId && Boolean(formik?.errors?.collectionId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Group.qry}
                parameters='_startAt=0&_pageSize=1000'
                values={formik.values}
                name='itemGroupId'
                label={labels.itemGroup}
                valueField='recordId'
                displayField={['reference', 'name']}
                displayFieldWidth={1}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('itemGroupId', newValue?.recordId || null)}
                error={formik.touched.itemGroupId && formik.errors.itemGroupId}
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
                readOnly
                onChange={(_, newValue) => formik.setFieldValue('metalId', newValue?.recordId)}
                error={formik.touched.metalId && Boolean(formik.errors.metalId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='weight'
                maxAccess={maxAccess}
                label={labels.weight}
                value={formik.values.weight}
                maxLength={10}
                decimalScale={2}
                readOnly={isClosed}
                onChange={e => formik.setFieldValue('weight', e.target.value)}
                onClear={() => {
                  formik.setFieldValue('weight', 0)
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='statusName'
                label={labels.status}
                value={formik?.values?.statusName}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('statusName', null)}
                error={formik.touched.statusName && Boolean(formik.errors.statusName)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.notes}
                rows={3}
                editMode={editMode}
                maxAccess={maxAccess}
                readOnly={isClosed}
                onChange={e => formik.setFieldValue('notes', e.target.value)}
                onClear={() => formik.setFieldValue('notes', null)}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
