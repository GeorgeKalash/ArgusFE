import { Grid } from '@mui/material'
import { useContext, useEffect, useRef } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import ImageUpload from 'src/components/Inputs/ImageUpload'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
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
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ProductModelingRepository } from 'src/repositories/ProductModelingRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function ThreeDPrintForm({ labels, maxAccess: access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const imageUploadRef = useRef(null)
  const systemFunction = SystemFunction.ThreeDPrint

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: systemFunction,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: ProductModelingRepository.ThreeDPrint.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      dtId: documentType?.dtId,
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
      density: null,
      status: 1,
      wip: 1
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.date().required(),
      fileReference: yup.string().required(),
      threeDDId: yup.string().required(),
      machineId: yup.string().required(),
      setPcs: yup.number().nullable().min(0).max(1000)
    }),
    onSubmit: async values => {
      const data = { ...values, date: formatDateToApi(values?.date) }

      const res = await postRequest({
        extension: ProductModelingRepository.ThreeDPrint.set,
        record: JSON.stringify(data)
      })

      if (imageUploadRef.current) {
        imageUploadRef.current.value = res.recordId

        await imageUploadRef.current.submit()
      }

      await getData(res.recordId)
      invalidate()

      toast.success(!values.recordId ? platformLabels.Edited : platformLabels.Added)
    }
  })

  const isPosted = formik.values.status === 3
  const editMode = !!formik.values.recordId

  async function getData(recordId) {
    const res = await getRequest({
      extension: ProductModelingRepository.ThreeDPrint.get,
      parameters: `_recordId=${recordId}`
    })

    formik.setValues({
      ...res.record,
      date: formatDateFromApi(res?.record?.date),
      startDate: formatDateFromApi(res?.record?.startDate),
      endDate: formatDateFromApi(res?.record?.endDate)
    })
  }

  const onPost = async () => {
    const header = {
      ...formik.values,
      date: formatDateToApi(formik.values?.date)
    }

    await postRequest({
      extension: ProductModelingRepository.ThreeDPrint.post,
      record: JSON.stringify(header)
    })

    await getData(formik.values.recordId)
    toast.success(platformLabels.Posted)
    invalidate()
  }

  const actions = [
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !editMode || isPosted
    },
    {
      key: 'Start',
      condition: true,
      onClick: onStart,
      disabled: !editMode || isPosted
    }
  ]

  async function onStart() {
    const header = {
      ...formik.values,
      date: formatDateToApi(formik.values?.date)
    }

    const res = await postRequest({
      extension: ProductModelingRepository.ThreeDPrint.start,
      record: JSON.stringify(header)
    })
    toast.success(platformLabels.Started)
    invalidate()
    await getData(res.recordId)
  }

  useEffect(() => {
    if (documentType?.dtId) {
      formik.setFieldValue('dtId', documentType.dtId)
    }
  }, [documentType?.dtId])

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await getData(recordId)
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.ThreeDPrint}
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
                    displayFieldWidth={2}
                    valueShow='jobRef'
                    maxAccess={maxAccess}
                    editMode={editMode}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'itemName', value: 'Item Name' }
                    ]}
                    readOnly={isPosted}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('jobId', newValue?.recordId || null)
                      formik.setFieldValue('jobRef', newValue?.reference || '')
                    }}
                    errorCheck={'jobId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ProductModelingRepository.ThreeDDrawing.snapshot}
                    valueField='reference'
                    displayField='reference'
                    secondDisplayField={false}
                    name='threeDDId'
                    label={labels.threeDD}
                    form={formik}
                    valueShow='threeDDRef'
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    required
                    onChange={(event, newValue) => {
                      formik.setFieldValue('threeDDId', newValue?.recordId || null)
                      formik.setFieldValue('threeDDRef', newValue?.reference || '')
                      formik.setFieldValue('fileReference', newValue?.fileReference || '')
                    }}
                    errorCheck={'threeDDId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='fileReference'
                    label={labels.threeDDFile}
                    value={formik.values.fileReference}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik?.values?.date}
                    required
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='startDate'
                    label={labels.startDate}
                    value={formik.values?.startDate}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker name='endDate' label={labels.endDate} value={formik.values?.endDate} readOnly />
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
                    readOnly={isPosted}
                    error={formik.touched.machineId && Boolean(formik.errors.machineId)}
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
                    readOnly={isPosted}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('productionClassId', newValue?.recordId || null)
                    }}
                    error={formik.touched.productionClassId && Boolean(formik.errors.productionClassId)}
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
                    onClear={() => formik.setFieldValue('density', '')}
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
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('setPcs', '')}
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
                    onClear={() => formik.setFieldValue('weight', '')}
                    error={formik.touched.weight && Boolean(formik.errors.weight)}
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
            <Grid item xs={6}>
              <ImageUpload
                ref={imageUploadRef}
                resourceId={ResourceIds.ThreeDPrint}
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
