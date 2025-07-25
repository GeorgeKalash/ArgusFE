import { Grid } from '@mui/material'
import { useContext, useEffect, useRef } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import ImageUpload from 'src/components/Inputs/ImageUpload'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ProductModelingRepository } from 'src/repositories/ProductModelingRepository'
import { DataSets } from 'src/resources/DataSets'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import useResourceParams from 'src/hooks/useResourceParams'
import useSetWindow from 'src/hooks/useSetWindow'

export default function SketchForm({ recordId, invalidate, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const imageUploadRef = useRef(null)
  const systemFunction = SystemFunction.Sketch

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.Sketch,
    editMode: !!recordId
  })

  useSetWindow({ title: labels?.Sketch, window })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: systemFunction,
    access,
    enabled: !recordId
  })

  function refresh() {
    invalidate && invalidate()
  }

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId: null,
      reference: '',
      dtId: null,
      date: new Date(),
      designerId: null,
      itemGroupId: null,
      productionClassId: null,
      productionStandardId: null,
      metalId: null,
      collectionId: null,
      source: null,
      statusName: '',
      notes: '',
      status: 1,
      wip: 1
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.date().required(),
      itemGroupId: yup.string().required(),
      source: yup.string().required()
    }),
    onSubmit: async values => {
      const data = { ...values, date: formatDateToApi(values?.date) }

      const res = await postRequest({
        extension: ProductModelingRepository.Sketch.set,
        record: JSON.stringify(data)
      })

      if (imageUploadRef.current) {
        imageUploadRef.current.value = res.recordId

        await imageUploadRef.current.submit()
      }

      await getData(res.recordId)

      refresh()

      toast.success(editMode ? platformLabels.Edited : platformLabels.Added)
    }
  })

  async function getDTD(dtId) {
    if (dtId) {
      const res = await getRequest({
        extension: ProductModelingRepository.DocumentTypeDefault.get,
        parameters: `_dtId=${dtId}`
      })

      formik.setFieldValue('productionLineId', res?.record?.productionLineId || null)

      return res
    }
  }

  useEffect(() => {
    if (formik.values.dtId && !recordId) getDTD(formik?.values?.dtId)
  }, [formik.values.dtId])

  const isClosed = formik.values.wip === 2
  const isPosted = formik.values.status === 3
  const editMode = !!formik.values.recordId

  async function getData(recordId) {
    const res = await getRequest({
      extension: ProductModelingRepository.Sketch.get,
      parameters: `_recordId=${recordId}`
    })

    res.record.date = formatDateFromApi(res?.record?.date)

    formik.setValues({
      ...res.record
    })
  }

  const onClose = async () => {
    await postRequest({
      extension: ProductModelingRepository.Sketch.close,
      record: JSON.stringify({ recordId: formik.values.recordId })
    })

    await getData(formik.values.recordId)
    toast.success(platformLabels.Closed)
    refresh()
  }

  const onReopen = async () => {
    const header = { ...formik.values, date: formatDateToApi(formik.values?.date) }

    await postRequest({
      extension: ProductModelingRepository.Sketch.reopen,
      record: JSON.stringify(header)
    })

    await getData(formik.values.recordId)
    toast.success(platformLabels.Reopened)
    refresh()
  }

  const onPost = async () => {
    const header = { ...formik.values, date: formatDateToApi(formik.values?.date) }

    await postRequest({
      extension: ProductModelingRepository.Sketch.post,
      record: JSON.stringify(header)
    })

    await getData(formik.values.recordId)
    toast.success(platformLabels.Posted)
    refresh()
  }

  const actions = [
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    },
    {
      key: 'Locked',
      condition: true,
      onClick: onPost,
      disabled: !editMode || isPosted || !isClosed
    },
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
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await getData(recordId)
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.Sketch}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      functionId={systemFunction}
      disabledSubmit={isClosed || isPosted}
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
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    readOnly={editMode}
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
                  <ResourceComboBox
                    datasetId={DataSets.SKETCH_SOURCE}
                    name='source'
                    label={labels.sketchSource}
                    valueField='key'
                    displayField='value'
                    required
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('source', newValue?.key || null)
                    }}
                    readOnly={isPosted || isClosed}
                    maxAccess={maxAccess}
                    error={formik.touched.source && Boolean(formik.errors.source)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ProductModelingRepository.Designer.qry}
                    name='designerId'
                    label={labels.designer}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name', width: 4 },
                      { key: 'typeName', value: 'Type' }
                    ]}
                    displayFieldWidth={2}
                    readOnly={isClosed}
                    maxAccess={maxAccess}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('designerId', newValue?.recordId || null)
                    }}
                    error={formik.touched.designerId && Boolean(formik.errors.designerId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik?.values?.date}
                    required
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('date', null)}
                    readOnly={isPosted || isClosed}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                    maxAccess={maxAccess}
                  />
                </Grid>
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
                    readOnly={isPosted || isClosed}
                    error={formik.touched.metalId && Boolean(formik.errors.metalId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Group.qry}
                    parameters='_startAt=0&_pageSize=1000'
                    values={formik.values}
                    name='itemGroupId'
                    required
                    label={labels.itemGroup}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    displayFieldWidth={1}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isPosted || isClosed}
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
                    displayField='name'
                    maxAccess={maxAccess}
                    readOnly={isPosted || isClosed}
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
                    readOnly={isPosted || isClosed}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('productionStandardId', newValue?.recordId || null)
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
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    maxAccess={maxAccess}
                    readOnly={isPosted || isClosed}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('collectionId', newValue?.recordId || null)
                    }}
                    error={formik.touched.collectionId && Boolean(formik.errors.collectionId)}
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
                  <CustomTextField name='statusName' label={labels.status} readOnly value={formik.values.statusName} />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    type='text'
                    label={labels.notes}
                    value={formik.values.notes}
                    readOnly={isPosted || isClosed}
                    rows={3}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('notes', e.target.value || null)}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <ImageUpload
                ref={imageUploadRef}
                resourceId={ResourceIds.Sketch}
                seqNo={0}
                recordId={recordId}
                width={250}
                height={'auto'}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
