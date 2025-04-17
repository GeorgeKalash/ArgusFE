import { Grid } from '@mui/material'
import { useContext, useEffect, useRef } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { ProductModelingRepository } from 'src/repositories/ProductModelingRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { DataSets } from 'src/resources/DataSets'
import ImageUpload from 'src/components/Inputs/ImageUpload'
import SketchForm from 'src/pages/pm-sketch/Forms/SketchForm'
import { useWindow } from 'src/windows'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import CustomDateTimePicker from 'src/components/Inputs/CustomDateTimePicker'

export default function ThreeDDesignForm({ labels, access, recordId }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const functionId = SystemFunction.ThreeDDesign
  const imageUploadRef = useRef(null)

  const invalidate = useInvalidate({
    endpointId: ProductModelingRepository.ThreeDDesign.page
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId,
    access,
    enabled: !recordId
  })

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId: null,
      wip: 1,
      status: 1,
      dtId: null,
      reference: '',
      source: null,
      sketchId: null,
      sketchRef: '',
      sketchName: '',
      designerId: null,
      designerRef: '',
      designerName: '',
      setPcs: 0,
      weight: 0,
      statusName: '',
      castingType: null,
      notes: '',
      date: new Date(),
      startDate: null,
      endDate: null,
      fileReference: '',
      itemGroupId: null,
      itemGroupRef: '',
      itemGroupName: '',
      productionClassId: null,
      productionClassRef: '',
      productionClassName: '',
      productionStandardId: null,
      productionStandardRef: '',
      productionStandardName: '',
      metalId: null,
      collectionId: null
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      source: yup.number().required(),
      designerId: yup.number().required(),
      sketchId: yup.number().required(),
      castingType: yup.number().required(),
      fileReference: yup.string().required()
    }),
    onSubmit: async obj => {
      const data = {
        ...obj,
        date: formatDateToApi(obj.date),
        startDate: obj.startDate ? formatDateToApi(obj.startDate) : null,
        endDate: obj.endDate ? formatDateToApi(obj.endDate) : null
      }

      const res = await postRequest({
        extension: ProductModelingRepository.ThreeDDesign.set,
        record: JSON.stringify(data)
      })
      if (imageUploadRef.current) {
        imageUploadRef.current.value = res.recordId

        await imageUploadRef.current.submit()
      }
      await fetchData(res.recordId)
      invalidate()
      toast.success(recordId ? platformLabels.Edited : platformLabels.Added)
    }
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2
  const isPosted = formik.values.status === 3

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await fetchData(recordId)
      }
    })()
  }, [])

  async function fetchData(recordId) {
    await getRequest({
      extension: ProductModelingRepository.ThreeDDesign.get,
      parameters: `_recordId=${recordId}`
    }).then(res => {
      formik.setValues({
        ...res.record,
        date: formatDateFromApi(res?.record?.date),
        startDate: formatDateFromApi(res?.record?.startDate),
        endDate: formatDateFromApi(res?.record?.endDate)
      })
    })
  }

  const onPost = async () => {
    const data = {
      ...formik.values,
      date: formatDateToApi(formik.values.date),
      startDate: formik.values.startDate ? formatDateToApi(formik.values.startDate) : null,
      endDate: formik.values.endDate ? formatDateToApi(formik.values.endDate) : null
    }
    await postRequest({
      extension: ProductModelingRepository.ThreeDDesign.post,
      record: JSON.stringify(data)
    }).then(async () => {
      await fetchData(data.recordId)
      toast.success(platformLabels.Posted)
      invalidate()
    })
  }

  async function onClose() {
    const data = {
      ...formik.values,
      date: formatDateToApi(formik.values.date),
      startDate: formik.values.startDate ? formatDateToApi(formik.values.startDate) : null,
      endDate: formik.values.endDate ? formatDateToApi(formik.values.endDate) : null
    }

    await postRequest({
      extension: ProductModelingRepository.ThreeDDesign.close,
      record: JSON.stringify(data)
    }).then(async res => {
      await fetchData(res.recordId)
      toast.success(platformLabels.Closed)
      invalidate()
    })
  }

  async function onReopen() {
    const data = {
      ...formik.values,
      date: formatDateToApi(formik.values.date),
      startDate: formik.values.startDate ? formatDateToApi(formik.values.startDate) : null,
      endDate: formik.values.endDate ? formatDateToApi(formik.values.endDate) : null
    }

    await postRequest({
      extension: ProductModelingRepository.ThreeDDesign.reopen,
      record: JSON.stringify(data)
    }).then(async res => {
      await fetchData(res.recordId)
      toast.success(platformLabels.Reopened)
      invalidate()
    })
  }

  async function onSketch() {
    stack({
      Component: SketchForm,
      props: {
        labels: labels,
        recordId: formik?.values?.sketchId,
        maxAccess: access
      },
      width: 700,
      height: 700,
      title: labels.Sketch
    })
  }

  const actions = [
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: !editMode || isPosted
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !editMode || isPosted
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || !isClosed
    },
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      disabled: true
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    },
    {
      key: 'Sketch',
      condition: true,
      onClick: onSketch,
      disabled: !formik?.values?.sketchId
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.ThreeDDesign}
      functionId={functionId}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
                    name='dtId'
                    label={labels.doctype}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId || ''), changeDT(newValue)
                    }}
                    readOnly={editMode}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.reference}
                    rows={2}
                    maxAccess={!editMode && maxAccess}
                    onChange={formik.handleChange}
                    readOnly={editMode}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.THREED_DESIGN_SOURCE}
                    name='source'
                    label={labels.source}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('source', newValue?.key || null)
                    }}
                    error={formik.touched.source && Boolean(formik.errors.source)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ProductModelingRepository.Sketch.snapshot2}
                    name='sketchRef'
                    required
                    label={labels.sketchRef}
                    secondDisplayField={false}
                    valueField='reference'
                    valueShow='sketchRef'
                    form={formik}
                    readOnly={isClosed}
                    onChange={(event, newValue) => {
                      formik.setValues({
                        ...formik.values,
                        sketchId: newValue?.recordId || null,
                        sketchRef: newValue?.reference || '',
                        sketchName: newValue?.name || '',
                        itemGroupId: newValue?.itemGroupId || null,
                        itemGroupRef: newValue?.itemGroupRef || '',
                        itemGroupName: newValue?.itemGroupName || '',
                        productionClassId: newValue?.productionClassId || null,
                        productionClassRef: newValue?.productionClassRef || '',
                        productionClassName: newValue?.productionClassName || '',
                        productionStandardId: newValue?.productionStandardId || null,
                        productionStandardRef: newValue?.productionStandardRef || '',
                        productionStandardName: newValue?.productionStandardName || '',
                        collectionId: newValue?.collectionId || null,
                        metalPurity: newValue?.metalPurity || null,
                        metalId: newValue?.metalId || null
                      })
                    }}
                    errorCheck={'sketchId'}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ProductModelingRepository.Designer.snapshot}
                    name='designerRef'
                    required
                    label={labels.designer}
                    displayFieldWidth={2}
                    valueField='reference'
                    displayField='name'
                    valueShow='designerRef'
                    readOnly={isClosed}
                    secondValueShow='designerName'
                    form={formik}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('designerId', newValue?.recordId || null),
                        formik.setFieldValue('designerRef', newValue?.reference || ''),
                        formik.setFieldValue('designerName', newValue?.name || '')
                    }}
                    errorCheck={'designerId'}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={InventoryRepository.Metals.qry}
                      name='metalId'
                      label={labels.purity}
                      valueField='recordId'
                      displayField={['reference']}
                      values={formik.values}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('metalId', newValue?.recordId || null)
                        formik.setFieldValue('metalPurity', newValue?.purity || null)
                      }}
                      readOnly={isClosed}
                      error={formik.touched.metalId && Boolean(formik.errors.metalId)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
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
                    readOnly={isClosed}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('itemGroupId', newValue?.recordId || null)
                    }}
                    error={formik.touched.itemGroupId && formik.errors.itemGroupId}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.ProductionClass.qry}
                    values={formik.values}
                    name='productionClassId'
                    label={labels.productionClass}
                    valueField='recordId'
                    readOnly={isClosed}
                    displayField='name'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('productionClassId', newValue?.recordId || '')
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
                    readOnly={isClosed}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('productionStandardId', newValue?.recordId || '')
                    }}
                    error={formik.touched.productionStandardId && Boolean(formik.errors.productionStandardId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Collections.qry}
                    name='collectionId'
                    label={labels.collection}
                    valueField='recordId'
                    readOnly={isClosed}
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    maxAccess={maxAccess}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('collectionId', newValue?.recordId)
                    }}
                    error={formik.touched.collectionId && Boolean(formik.errors.collectionId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.CASTING_TYPE}
                    name='castingType'
                    required
                    label={labels.castingType}
                    valueField='key'
                    readOnly={isClosed}
                    displayField='value'
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('castingType', newValue?.key)
                    }}
                    error={formik.touched.castingType && Boolean(formik.errors.castingType)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='statusName'
                    label={labels.statusName}
                    value={formik.values.statusName}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    label={labels.notes}
                    value={formik.values.notes}
                    maxLength='100'
                    rows={2}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    readOnly={isClosed}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{ marginTop: 20.5 }}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik?.values?.date}
                    onChange={formik.setFieldValue}
                    editMode={editMode}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', null)}
                    readOnly={isClosed}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDateTimePicker
                    name='startDate'
                    readOnly={isClosed}
                    label={labels.startDate}
                    onChange={formik.setFieldValue}
                    editMode={editMode}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('startDate', null)}
                    value={formik.values?.startDate}
                    error={formik.errors?.startDate && Boolean(formik.errors?.startDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDateTimePicker
                    name='endDate'
                    readOnly={isClosed}
                    label={labels.endDate}
                    onChange={formik.setFieldValue}
                    editMode={editMode}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('endDate', null)}
                    value={formik.values?.endDate}
                    error={formik.errors?.endDate && Boolean(formik.errors?.endDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='setPcs'
                    label={labels.setPcs}
                    value={formik.values.setPcs}
                    maxAccess={maxAccess}
                    readOnly={isClosed}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('setPcs', 0)}
                    error={formik.touched.setPcs && Boolean(formik.errors.setPcs)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='weight'
                    label={labels.weight}
                    value={formik.values.weight}
                    maxAccess={maxAccess}
                    readOnly={isClosed}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('weight', 0)}
                    error={formik.touched.weight && Boolean(formik.errors.weight)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='fileReference'
                    required
                    label={labels.fileReference}
                    value={formik.values.fileReference}
                    rows={2}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    readOnly={isClosed}
                    onClear={() => formik.setFieldValue('fileReference ', '')}
                    error={formik.touched.fileReference && Boolean(formik.errors.fileReference)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <ImageUpload
                ref={imageUploadRef}
                resourceId={ResourceIds.Items}
                seqNo={0}
                recordId={recordId}
                width={300}
                height={'auto'}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
