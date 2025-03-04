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
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { DataSets } from 'src/resources/DataSets'
import ImageUpload from 'src/components/Inputs/ImageUpload'

export default function ThreeDDesignForm({ labels, access, recordId }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const functionId = SystemFunction.ThreeDDesign
  const imageUploadRef = useRef(null)

  const invalidate = useInvalidate({
    endpointId: ProductModelingRepository.ThreeDDesign.page
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId,
    access: access,
    enabled: !recordId
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      wip: 1,
      status: 1,
      dtId: documentType?.dtId,
      reference: '',
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
      date: new Date()
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      designerId: yup.number().required(),
      sketchId: yup.number().required(),
      castingType: yup.number().required(),
      fileReference: yup.string().required()
    }),
    onSubmit: async obj => {
      const data = {
        ...obj,
        date: formatDateToApi(obj.date)
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
      toast.success(editMode ? platformLabels.Edited : platformLabels.Added)
    }
  })

  const editMode = !!recordId || formik.values.recordId
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
        date: formatDateFromApi(res?.record?.date)
      })
    })
  }

  const onPost = async () => {
    const data = {
      ...formik.values,
      date: formatDateToApi(formik.values.date)
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

  //   const onUnpost = async () => {
  //     const data = {
  //       ...formik.values,
  //       date: formatDateToApi(formik.values.date)
  //     }

  //     await postRequest({
  //       extension: ProductModelingRepository.ThreeDDesign.unpost,
  //       record: JSON.stringify(data)
  //     }).then(async res => {
  //       await fetchData(res.recordId)
  //       toast.success(platformLabels.Unposted)
  //       invalidate()
  //     })
  //   }

  async function onClose() {
    const data = {
      ...formik.values,
      date: formatDateToApi(formik.values.date)
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
      date: formatDateToApi(formik.values.date)
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
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Grid container spacing={3}>
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
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    readOnly={editMode}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik?.values?.date}
                    onChange={formik.setFieldValue}
                    editMode={editMode}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', '')}
                    readOnly={isClosed}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    name='sketchId'
                    required
                    endpointId={ProductModelingRepository.Sketch.snapshot}
                    label={labels.sketchRef}
                    form={formik}
                    valueField='reference'
                    displayField='reference'
                    readOnly={isClosed}
                    firstValue={formik.values.sketchRef}
                    secondDisplayField={false}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'sourceName', value: 'Source' },
                      { key: 'designerRef', value: 'designer' }
                    ]}
                    displayFieldWidth={1.5}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('sketchId', newValue?.recordId || null)
                      formik.setFieldValue('sketchRef', newValue?.reference || '')
                      formik.setFieldValue('designerId', newValue?.designerId || null)
                      formik.setFieldValue('designerRef', newValue?.designerRef || '')
                      formik.setFieldValue('designerName', newValue?.designerName || '')
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
                    label={labels.Drawer}
                    valueField='reference'
                    displayField='name'
                    valueShow='designerRef'
                    secondValueShow='designerName'
                    readOnly={isClosed}
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
                  <CustomNumberField
                    name='setPcs'
                    label={labels.setPcs}
                    value={formik.values.setPcs}
                    maxAccess={maxAccess}
                    readOnly={isClosed}
                    maxLength={6}
                    decimalScale={5}
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
                    maxLength={11}
                    decimalScale={5}
                    readOnly={isClosed}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('weight', 0)}
                    error={formik.touched.weight && Boolean(formik.errors.weight)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.CASTING_TYPE}
                    name='castingType'
                    required
                    label={labels.castingType}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    maxAccess={maxAccess}
                    readOnly={isClosed}
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
                  <CustomTextField
                    name='fileReference'
                    label={labels.fileReference}
                    value={formik.values.fileReference}
                    maxAccess={maxAccess}
                    required
                    readOnly={isClosed}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('fileReference', '')}
                    error={formik.touched.fileReference && Boolean(formik.errors.fileReference)}
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
            <Grid item xs={6}>
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
