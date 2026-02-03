import { Grid } from '@mui/material'
import { useContext, useEffect, useRef } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import ImageUpload from '@argus/shared-ui/src/components/Inputs/ImageUpload'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { ProductModelingRepository } from '@argus/repositories/src/repositories/ProductModelingRepository'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomDateTimePicker from '@argus/shared-ui/src/components/Inputs/CustomDateTimePicker'
import { KVSRepository } from '@argus/repositories/src/repositories/KVSRepository'
import ThreeDDesignForm from '@argus/shared-ui/src/components/Shared/Forms/ThreeDDesignForm'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'

export default function ThreeDPrintForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const imageUploadRef = useRef(null)
  const systemFunction = SystemFunction.ThreeDPrint
  const { stack } = useWindow()

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.Printing,
    editMode: !!recordId
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: systemFunction,
    access,
    enabled: !recordId
  })

  useSetWindow({ title: platformLabels.threeDPrinting, window })

  const invalidate = useInvalidate({
    endpointId: ProductModelingRepository.Printing.page
  })

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId: null,
      reference: '',
      dtId: null,
      date: new Date(),
      threeDDId: null,
      fileReference: '',
      setPcs: null,
      weight: null,
      machineId: null,
      startDate: null,
      endDate: null,
      notes: '',
      jobId: null,
      productionClassId: null,
      productionLineId: null,
      collectionId: null,
      productionStandardRef: '',
      designGroupId: null,
      designFamilyId: null,
      designerName: '',
      metalRef: '',
      collectionName: '',
      itemGroupName: '',
      density: null,
      nbOfLayers: null,
      status: 1,
      wip: 1
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.date().required(),
      threeDDId: yup.number().required(),
      machineId: yup.number().required(),
      setPcs: yup.number().nullable()
    }),
    onSubmit: async values => {
      const data = { ...values, date: formatDateToApi(values?.date) }

      const res = await postRequest({
        extension: ProductModelingRepository.Printing.set,
        record: JSON.stringify(data)
      })

      if (imageUploadRef.current) {
        imageUploadRef.current.value = res.recordId

        await imageUploadRef.current.submit()
      }

      getData(res.recordId)
      invalidate()

      toast.success(!values.recordId ? platformLabels.Edited : platformLabels.Added)
    }
  })

  const isPosted = formik.values.status === 3
  const isReleased = formik.values.status == 4
  const editMode = !!formik.values.recordId

  async function getData(recordId) {
    const res = await getRequest({
      extension: ProductModelingRepository.Printing.get,
      parameters: `_recordId=${recordId}`
    })

    formik.setValues({
      ...res.record,
      date: formatDateFromApi(res?.record?.date),
      startDate: formatDateFromApi(res?.record?.startDate),
      endDate: formatDateFromApi(res?.record?.endDate)
    })
  }

  async function getDTD(dtId) {
    if (dtId) {
      const res = await getRequest({
        extension: ProductModelingRepository.DocumentTypeDefault.get,
        parameters: `_dtId=${dtId}`
      })

      formik.setFieldValue('productionLineId', res?.record?.productionLineId)
    }
  }

  useEffect(() => {
    if (formik.values.dtId && !recordId) getDTD(formik?.values?.dtId)
  }, [formik.values.dtId])

  const onPost = async () => {
    const header = {
      ...formik.values,
      date: formatDateToApi(formik.values?.date)
    }

    await postRequest({
      extension: ProductModelingRepository.Printing.post,
      record: JSON.stringify(header)
    })

    getData(formik.values.recordId)
    toast.success(platformLabels.Posted)
    invalidate()
  }

  async function getLabels(datasetId) {
    const res = await getRequest({
      extension: KVSRepository.getLabels,
      parameters: `_dataset=${datasetId}`
    })

    return res.list ? Object.fromEntries(res.list.map(({ key, value }) => [key, value])) : {}
  }

  const actions = [
    {
      key: 'Locked',
      condition: true,
      onClick: onPost,
      disabled: !editMode || isPosted || !isReleased
    },
    {
      key: 'threeDDesign',
      condition: true,
      onClick: async () => {
        const threeDFormLabels = await getLabels(ResourceIds.ThreeDDesign)

        stack({
          Component: ThreeDDesignForm,
          props: {
            recordId: formik.values?.threeDDId,
            labels: threeDFormLabels
          },
          width: 1200,
          height: 700,
          title: threeDFormLabels.ThreeDDesign
        })
      },
      disabled: !formik.values.threeDDId
    },
    {
      key: 'Start',
      condition: true,
      onClick: onStart,
      disabled: !editMode || isPosted || isReleased
    }
  ]

  async function onStart() {
    const header = {
      ...formik.values,
      date: formatDateToApi(formik.values?.date)
    }

    const res = await postRequest({
      extension: ProductModelingRepository.Printing.start,
      record: JSON.stringify(header)
    })
    toast.success(platformLabels.Started)
    invalidate()
    getData(res.recordId)
  }

  useEffect(() => {
    if (recordId) {
      getData(recordId)
    }
  }, [])

  const getDesign = async recordId => {
    return await getRequest({
      extension: ProductModelingRepository.ThreeDDrawing.get,
      parameters: `_recordId=${recordId}`
    })
  }

  return (
    <FormShell
      resourceId={ResourceIds.Printing}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      functionId={systemFunction}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_dgId=${systemFunction}&_startAt=0&_pageSize=50`}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
                    name='dtId'
                    label={labels.documentType}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField='name'
                    values={formik?.values}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId || null)
                      changeDT(newValue)
                      if (!newValue?.recordId) {
                        formik.setFieldValue('productionLineId', null)
                      }
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik?.values?.reference}
                    readOnly={editMode}
                    maxAccess={!editMode && maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ManufacturingRepository.MFJobOrder.snapshot}
                    valueField='reference'
                    displayField='reference'
                    secondDisplayField={false}
                    name='jobId'
                    label={labels.jobOrder}
                    form={formik}
                    valueShow='jobRef'
                    maxAccess={maxAccess}
                    editMode={editMode}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'itemName', value: 'Item Name' }
                    ]}
                    readOnly={isPosted || isReleased}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('jobId', newValue?.recordId || null)
                      formik.setFieldValue('jobRef', newValue?.reference || '')
                    }}
                    errorCheck={'jobId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ProductModelingRepository.ThreeDDrawing.snapshot3DD2}
                    parameters={{
                      _productionLineId: formik.values.productionLineId || 0
                    }}
                    valueField='reference'
                    displayField='reference'
                    secondDisplayField={false}
                    name='threeDDId'
                    label={labels.threeDD}
                    form={formik}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'date', value: 'Date', type: 'date' },
                      { key: 'designerRef', value: 'Designer' }
                    ]}
                    valueShow='threeDDRef'
                    maxAccess={maxAccess}
                    readOnly={isPosted || isReleased}
                    required
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('threeDDRef', newValue?.reference || '')
                      formik.setFieldValue('fileReference', newValue?.fileReference || '')
                      formik.setFieldValue('designerName', newValue?.designerName || '')
                      formik.setFieldValue('designerId', newValue?.designerId || '')
                      formik.setFieldValue('productionClassId', newValue?.productionClassId || null)
                      formik.setFieldValue('productionStandardId', newValue?.productionStandardId || null)
                      formik.setFieldValue('productionStandardRef', newValue?.productionStandardRef || '')
                      formik.setFieldValue('metalRef', newValue?.metalRef || '')
                      formik.setFieldValue('metalId', newValue?.metalId || null)
                      formik.setFieldValue('collectionName', newValue?.collectionName || '')
                      formik.setFieldValue('collectionId', newValue?.collectionId || null)
                      formik.setFieldValue('itemGroupName', newValue?.itemGroupName || '')
                      formik.setFieldValue('itemGroupId', newValue?.itemGroupId || null)

                      if (newValue?.recordId) {
                        const res = await getDesign(newValue?.recordId)
                        formik.setFieldValue('designFamilyId', res?.record?.designFamilyId || null)
                        formik.setFieldValue('designGroupId', res?.record?.designGroupId || null)
                      }

                      formik.setFieldValue('threeDDId', newValue?.recordId || null)
                    }}
                    errorCheck={'threeDDId'}
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
                  <CustomDatePicker
                    name='date'
                    required
                    label={labels.date}
                    readOnly={isPosted || isReleased}
                    value={formik?.values?.date}
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', '')}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDateTimePicker
                    name='startDate'
                    label={labels.startDate}
                    value={formik.values?.startDate}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDateTimePicker name='endDate' label={labels.endDate} value={formik.values?.endDate} readOnly />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.Machine.qry}
                    name='machineId'
                    label={labels.machine}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('machineId', newValue?.recordId || null)
                    }}
                    required
                    readOnly={isPosted || isReleased}
                    error={formik.touched.machineId && Boolean(formik.errors.machineId)}
                    maxAccess={maxAccess}
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
                    maxAccess={maxAccess}
                    readOnly
                    error={formik.touched.productionLineId && formik.errors.productionLineId}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.ProductionClass.qry}
                    values={formik.values}
                    name='productionClassId'
                    label={labels.productionClass}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    maxAccess={maxAccess}
                    readOnly={isPosted || isReleased}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('productionClassId', newValue?.recordId || null)
                    }}
                    error={formik.touched.productionClassId && Boolean(formik.errors.productionClassId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='nbOfLayers'
                    label={labels.nbOfLayers}
                    value={formik.values.nbOfLayers}
                    maxAccess={maxAccess}
                    maxLength={4}
                    decimalScale={0}
                    readOnly={isPosted}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('nbOfLayers', '')}
                    error={formik.touched.nbOfLayers && Boolean(formik.errors.nbOfLayers)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='density'
                    label={labels.density}
                    value={formik.values.density}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    maxLength={9}
                    decimalScale={3}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('density', null)}
                    error={formik.touched.density && Boolean(formik.errors.density)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='setPcs'
                    label={labels.pieces}
                    value={formik.values.setPcs}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    maxLength={4}
                    decimalScale={0}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('setPcs', null)}
                    error={formik.touched.setPcs && Boolean(formik.errors.setPcs)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomNumberField
                    name='weight'
                    label={labels.weight}
                    value={formik.values.weight}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    onChange={formik.handleChange}
                    maxLength={8}
                    decimalScale={2}
                    onClear={() => formik.setFieldValue('weight', null)}
                    error={formik.touched.weight && Boolean(formik.errors.weight)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ImageUpload
                    ref={imageUploadRef}
                    resourceId={ResourceIds.Printing}
                    seqNo={0}
                    recordId={recordId}
                    height={250}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='fileReference'
                    label={labels.threeDDFile}
                    value={formik.values.fileReference}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    readOnly={isPosted}
                    onClear={() => formik.setFieldValue('fileReference', '')}
                    error={formik.touched.fileReference && Boolean(formik.errors.fileReference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='designerName'
                    label={labels.designer}
                    value={formik.values.designerName}
                    maxAccess={maxAccess}
                    readOnly
                    error={formik.touched.designerName && Boolean(formik.errors.designerName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='productionStandardRef'
                    label={labels.productionStandard}
                    value={formik.values.productionStandardRef}
                    maxAccess={maxAccess}
                    readOnly
                    error={formik.touched.productionStandardRef && Boolean(formik.errors.productionStandardRef)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='metalRef'
                    label={labels.purity}
                    value={formik.values.metalRef}
                    maxAccess={maxAccess}
                    readOnly
                    error={formik.touched.metalRef && Boolean(formik.errors.metalRef)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='collectionName'
                    label={labels.collection}
                    value={formik.values.collectionName}
                    maxAccess={maxAccess}
                    readOnly
                    error={formik.touched.collectionName && Boolean(formik.errors.collectionName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='itemGroupName'
                    label={labels.itemGroup}
                    value={formik.values.itemGroupName}
                    maxAccess={maxAccess}
                    readOnly
                    error={formik.touched.itemGroupName && Boolean(formik.errors.itemGroupName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    type='text'
                    label={labels.notes}
                    value={formik.values.notes}
                    readOnly={isPosted}
                    rows={3}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('notes', e.target.value || null)}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

ThreeDPrintForm.width = 750
ThreeDPrintForm.height = 650
