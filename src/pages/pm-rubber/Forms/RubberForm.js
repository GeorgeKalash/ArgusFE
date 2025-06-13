import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { ProductModelingRepository } from 'src/repositories/ProductModelingRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useWindow } from 'src/windows'
import ConfirmationDialog from 'src/components/ConfirmationDialog'
import ThreeDPrintForm from 'src/pages/pm-3d-printing/Forms/ThreeDPrintForm'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

export default function RubberForm({ labels, access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.Rubber,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: ProductModelingRepository.Rubber.page
  })

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      dtId: null,
      reference: '',
      date: new Date(),
      productionLineId: null,
      metalId: null,
      modelId: null,
      modelRef: '',
      threeDPId: null,
      laborId: null,
      startDate: null,
      endDate: null,
      pcs: 0,
      jobId: null,
      status: 1,
      notes: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      pcs: yup.number().required().moreThan(0, 'min'),
      laborId: yup.number().required(),
      modelId: yup.number().required(),
      date: yup.date().required()
    }),
    onSubmit: async obj => {
      postRequest({
        extension: ProductModelingRepository.Rubber.set,
        record: JSON.stringify({
          ...obj,
          startDate: obj.startDate ? formatDateToApi(obj.startDate) : null,
          endDate: obj.endDate ? formatDateToApi(obj.endDate) : null
        })
      }).then(async res => {
        const actionMessage = obj.recordId ? platformLabels.Edited : platformLabels.Added
        toast.success(actionMessage)
        await refetchForm(res.recordId)
        invalidate()
      })
    }
  })

  const editMode = !!formik.values.recordId
  const isReleased = formik.values.status == 4
  const isPosted = formik.values.status == 3

  async function refetchForm(damageId) {
    await getRequest({
      extension: ProductModelingRepository.Rubber.get,
      parameters: `_recordId=${damageId}`
    }).then(res => {
      formik.setValues({
        ...res?.record,
        startDate: formatDateFromApi(res?.record?.startDate),
        endDate: formatDateFromApi(res?.record?.endDate),
        date: formatDateFromApi(res?.record?.date)
      })
    })
  }

  const onPost = async () => {
    await postRequest({
      extension: ProductModelingRepository.Rubber.post,
      record: JSON.stringify({
        ...formik.values,
        startDate: formatDateToApi(formik.values.startDate)
      })
    })

    toast.success(platformLabels.Posted)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  async function onStart() {
    const res = await postRequest({
      extension: ProductModelingRepository.Rubber.start,
      record: JSON.stringify(formik.values)
    })
    toast.success(platformLabels.Started)
    invalidate()
    await refetchForm(res.recordId)
  }

  function confirmation(dialogText, titleText, event) {
    stack({
      Component: ConfirmationDialog,
      props: {
        DialogText: dialogText,
        okButtonAction: async () => {
          await event()
        },
        fullScreen: false,
        close: true
      },
      width: 400,
      height: 150,
      title: titleText
    })
  }

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      disabled: !editMode || isPosted
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || isPosted || !isReleased
    },
    {
      key: 'Start',
      condition: !isReleased,
      onClick: () => {
        confirmation(platformLabels.StartRecord, platformLabels.Confirmation, onStart)
      },
      disabled: !editMode || isReleased || isPosted
    },
    {
      key: 'threeDPrinting',
      condition: true,
      onClick: () => {
        stack({
          Component: ThreeDPrintForm,
          props: {
            recordId: formik.values?.threeDPId,
            labels
          },
          width: 750,
          height: 650,
          title: platformLabels.threeDPrinting
        })
      },
      disabled: !formik.values.threeDPId
    }
  ]

  useEffect(() => {
    if (recordId) {
      refetchForm(recordId)
    }
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.Rubber}
      functionId={SystemFunction.Rubber}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      editMode={editMode}
      disabledSubmit={isReleased || isPosted}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.Rubber}`}
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
                  formik.setFieldValue('dtId', newValue?.recordId)
                  changeDT(newValue)

                  formik.setFieldValue('productionLineId', null)

                  if (newValue?.recordId) {
                    const { record } = await getRequest({
                      extension: ProductModelingRepository.DocumentTypeDefault.get,
                      parameters: `_dtId=${newValue?.recordId}`
                    })

                    if (record?.productionLineId) {
                      formik.setFieldValue('modelRef', '')
                      formik.setFieldValue('threeDPId', null)
                      formik.setFieldValue('laborId', null)
                      formik.setFieldValue('laborName', '')
                      formik.setFieldValue('modelId', null)
                      formik.setFieldValue('pcs', '')
                      formik.setFieldValue('jobId', '')
                    }
                    formik.setFieldValue('productionLineId', record?.productionLineId || null)
                  }
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
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionLine.qry}
                values={formik.values}
                name='productionLineId'
                readOnly
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
                  formik.setFieldValue('productionLineId', newValue?.recordId || null)
                }}
                error={formik.touched.productionLineId && formik.errors.productionLineId}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceLookup
                endpointId={ProductModelingRepository.ModelMaker.snapshot2}
                parameters={{
                  _productionLineId: formik.values.productionLineId || 0
                }}
                valueField='reference'
                name='modelId'
                label={labels.model}
                form={formik}
                required
                valueShow='modelRef'
                secondDisplayField={false}
                readOnly={isReleased || isPosted}
                maxAccess={access}
                columnsInDropDown={[
                  { key: 'reference', value: 'Ref' },
                  { key: 'date', value: 'Date', type: 'date' }
                ]}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('modelRef', newValue?.reference || '')
                  formik.setFieldValue('threeDPId', newValue?.threeDPId || '')
                  formik.setFieldValue('laborId', newValue?.laborId || null)
                  formik.setFieldValue('laborName', newValue?.laborName || '')
                  formik.setFieldValue('metalId', newValue?.metalId || null)

                  if (newValue?.threeDPId) {
                    const response = await getRequest({
                      extension: ProductModelingRepository.Printing.get,
                      parameters: `_recordId=${newValue?.threeDPId}`
                    })

                    const jobId = response?.record?.jobId
                    formik.setFieldValue('jobId', jobId || null)

                    if (jobId) {
                      const result = await getRequest({
                        extension: ManufacturingRepository.MFJobOrder.get,
                        parameters: `_recordId=${response?.record?.jobId}`
                      })

                      formik.setFieldValue('pcs', result?.record?.pcs)
                    } else {
                      formik.setFieldValue('pcs', '')
                    }
                  }
                  formik.setFieldValue('modelId', newValue?.recordId || null)
                }}
                errorCheck={'modelId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                required
                readOnly={isReleased || isPosted}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>

            <Grid item xs={12}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={InventoryRepository.Metals.qry}
                  name='metalId'
                  label={labels.metal}
                  valueField='recordId'
                  displayField={['reference']}
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('metalId', newValue?.recordId || null)
                    formik.setFieldValue('metalPurity', newValue?.purity || null)
                  }}
                  readOnly={isReleased || isPosted}
                  error={formik.touched.metalId && Boolean(formik.errors.metalId)}
                  maxAccess={maxAccess}
                />
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.Labor.qry}
                parameters={`_startAt=0&_pageSize=200&_params=`}
                name='laborId'
                required
                readOnly={isReleased || isPosted}
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
              <CustomNumberField
                name='pcs'
                decimalScale={0}
                required
                label={labels.silverPieces}
                value={formik?.values?.pcs}
                maxAccess={maxAccess}
                readOnly={isReleased || isPosted}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('pcs', '')}
                maxLength={4}
                error={formik.touched.pcs && Boolean(formik.errors.pcs)}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={labels.startDate}
                value={formik?.values?.startDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={labels.endDate}
                value={formik?.values?.endDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                name='status'
                label={labels.status}
                value={formik?.values?.statusName}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.notes}
                rows={4}
                readOnly={isReleased || isPosted}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('notes', e.target.value)}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
