import { Grid } from '@mui/material'
import { useContext, useEffect, useRef } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ProductModelingRepository } from '@argus/repositories/src/repositories/ProductModelingRepository'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import ImageUpload from '@argus/shared-ui/src/components/Inputs/ImageUpload'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { useRefBehavior } from '@argus/shared-hooks/src/hooks/useReferenceProxy'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'

export default function DesignsForm({ labels, access, store, setStore }) {
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const imageUploadRef = useRef(null)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Design.page
  })

  const { changeDT, maxAccess } = useRefBehavior({
    access,
    readOnlyOnEditMode: false,
    name: 'reference'
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      groupId: null,
      familyId: null,
      reference: '',
      designDate: null,
      description: '',
      threeDDId: null,
      rubberId: null,
      itemId: null,
      routingId: null,
      lineId: null,
      classId: null,
      standardId: null,
      stdWeight: 0,
      designerId: null,
      itemCategoryId: null,
      designerRef: '',
      designerName: '',
      isInactive: false
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      itemId: yup.number().required()
    }),
    onSubmit: async obj => {
      const data = {
        ...obj,
        designDate: obj.designDate ? formatDateToApi(obj.designDate) : null
      }

      const res = await postRequest({
        extension: ManufacturingRepository.Design.set,
        record: JSON.stringify(data)
      })
      if (imageUploadRef.current) {
        imageUploadRef.current.value = res.recordId

        await imageUploadRef.current.submit()
      }
      fetchData(res.recordId)

      if (!obj.recordId) {
        formik.setFieldValue('recordId', res.recordId)
        setStore({ recordId: res.recordId })
      }
      toast.success(!obj.recordId ? platformLabels.Edited : platformLabels.Added)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    if (recordId) {
      fetchData(recordId)
    }
  }, [])

  async function fetchData(recordId) {
    getRequest({
      extension: ManufacturingRepository.Design.get,
      parameters: `_recordId=${recordId}`
    }).then(async res => {
      if (res?.record?.groupId) {
        const res2 = await getRequest({
          extension: ManufacturingRepository.DesignGroup.get,
          parameters: `_recordId=${res?.record?.groupId}`
        })

        changeDT(res2.record)
      }

      formik.setValues({
        ...res.record,
        designDate: formatDateFromApi(res?.record?.designDate)
      })

      setStore({
        recordId: res.record.recordId
      })
    })
  }

  return (
    <FormShell
      resourceId={ResourceIds.Design}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.DesignGroup.qry}
                    name='groupId'
                    label={labels.designGroup}
                    valueField='recordId'
                    displayField={'name'}
                    readOnly={!!editMode}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('groupId', newValue?.recordId || null)
                      changeDT(newValue)
                    }}
                    error={formik.touched.groupId && Boolean(formik.errors.groupId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    readOnly={editMode}
                    label={labels.reference}
                    value={formik.values.reference}
                    onChange={formik.handleChange}
                    maxLength='10'
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='name'
                    label={labels.name}
                    value={formik.values.name}
                    required
                    maxAccess={maxAccess}
                    maxLength='30'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('name', '')}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='designDate'
                    label={labels.designDate}
                    value={formik.values?.designDate}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('designDate', null)}
                    error={formik.touched.designDate && Boolean(formik.errors.designDate)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='description'
                    label={labels.description}
                    value={formik.values.description}
                    maxLength='200'
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('description', '')}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={InventoryRepository.Item.snapshot}
                    name='itemId'
                    label={labels.sku}
                    valueField='sku'
                    displayField='name'
                    valueShow='sku'
                    secondValueShow='itemName'
                    form={formik}
                    required
                    columnsInDropDown={[
                      { key: 'sku', value: 'SKU' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('itemId', newValue?.recordId || null)
                      formik.setFieldValue('itemName', newValue?.name || '')
                      formik.setFieldValue('sku', newValue?.sku || '')
                      formik.setFieldValue('itemCategoryId', newValue?.categoryId || null)
                    }}
                    displayFieldWidth={2}
                    maxAccess={maxAccess}
                    errorCheck={'itemId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.ProductionLine.qry}
                    parameters='_startAt=0&_pageSize=1000'
                    values={formik.values}
                    name='lineId'
                    label={labels.productionLine}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    displayFieldWidth={1}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('lineId', newValue?.recordId || null)
                    }}
                    error={formik.touched.lineId && formik.errors.lineId}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Category.qry}
                    parameters='_name=&_pageSize=1000&_startAt=0'
                    values={formik.values}
                    name='itemCategoryId'
                    label={labels.category}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    readOnly
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ManufacturingRepository.Routing.snapshot2}
                    parameters={{
                      _lineId: formik.values.lineId || 0
                    }}
                    valueField='reference'
                    displayField='name'
                    name='routingId'
                    label={labels.routing}
                    readOnly={!formik.values.lineId}
                    form={formik}
                    minChars={2}
                    firstValue={formik.values.routingRef}
                    secondValue={formik.values.routingName}
                    errorCheck={'routingId'}
                    maxAccess={maxAccess}
                    displayFieldWidth={2}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('routingId', newValue?.recordId || null)
                      formik.setFieldValue('routingRef', newValue?.reference || null)
                      formik.setFieldValue('routingName', newValue?.name || null)
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.DesignFamily.qry}
                    values={formik.values}
                    name='familyId'
                    label={labels.designFamily}
                    valueField='recordId'
                    displayField='name'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('familyId', newValue?.recordId || '')
                    }}
                    error={formik.touched.familyId && Boolean(formik.errors.familyId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.ProductionClass.qry}
                    values={formik.values}
                    name='classId'
                    label={labels.productionClass}
                    valueField='recordId'
                    displayField='name'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('classId', newValue?.recordId || '')
                    }}
                    error={formik.touched.classId && Boolean(formik.errors.classId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.ProductionStandard.qry}
                    values={formik.values}
                    name='standardId'
                    label={labels.productionStandard}
                    valueField='recordId'
                    displayField='reference'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('standardId', newValue?.recordId || '')
                    }}
                    error={formik.touched.standardId && Boolean(formik.errors.standardId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ProductModelingRepository.ThreeDDrawing.snapshot2}
                    valueField='reference'
                    displayField='reference'
                    secondDisplayField={false}
                    name='threeDDId'
                    label={labels.threeDD}
                    form={formik}
                    valueShow='threeDDRef'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('threeDDId', newValue?.recordId || null)
                      formik.setFieldValue('threeDDRef', newValue?.reference || '')
                      formik.setFieldValue('fileReference', newValue?.fileReference || '')
                    }}
                    errorCheck={'threeDDId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ProductModelingRepository.Rubber.snapshot}
                    valueField='reference'
                    displayField='reference'
                    secondDisplayField={false}
                    name='rubberId'
                    label={labels.rubber}
                    form={formik}
                    valueShow='rubberRef'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('rubberId', newValue?.recordId || null)
                      formik.setFieldValue('rubberRef', newValue?.reference || '')
                    }}
                    errorCheck={'rubberId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='stdWeight'
                    label={labels.weight}
                    value={formik.values.stdWeight}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    maxLength={12}
                    decimalScale={3}
                    onClear={() => formik.setFieldValue('stdWeight', 0)}
                    error={formik.touched.stdWeight && Boolean(formik.errors.stdWeight)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ImageUpload
                    ref={imageUploadRef}
                    resourceId={ResourceIds.Design}
                    seqNo={0}
                    recordId={formik?.values?.recordId}
                    height={250}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ProductModelingRepository.Designer.snapshot}
                    parameters={{
                      _productionLineId: formik.values.productionLineId || 0
                    }}
                    valueField='name'
                    displayField='name'
                    secondDisplayField={true}
                    firstValue={formik.values.designerRef}
                    secondValue={formik.values.designerName}
                    name='designerId'
                    displayFieldWidth={2}
                    label={labels.designer}
                    form={formik}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('designerName', newValue?.name || '')
                      formik.setFieldValue('designerRef', newValue?.reference || '')
                      formik.setFieldValue('designerId', newValue?.recordId || null)
                    }}
                    errorCheck={'designerId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomCheckBox
                    name='isInactive'
                    value={formik.values.isInactive}
                    onChange={event => formik.setFieldValue('isInactive', event.target.checked)}
                    label={labels.isInactive}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
