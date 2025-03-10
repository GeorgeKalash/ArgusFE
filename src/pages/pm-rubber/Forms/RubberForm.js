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
    initialValues: {
      recordId,
      dtId: documentType?.dtId,
      reference: '',
      date: new Date(),
      modelId: null,
      threeDPId: null,
      laborId: null,
      startDate: null,
      endDate: null,
      pcs: null,
      jobId: null,
      status: 1,
      weight: null,
      notes: ''
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      pcs: yup.number().moreThan(0, 'min'),
      laborId: yup.number().required(),
      modelId: yup.number().required()
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
        endDate: formatDateFromApi(res?.record?.endDate)
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

  useEffect(() => {
    if (documentType?.dtId) {
      formik.setFieldValue('dtId', documentType.dtId)
    }
  }, [documentType?.dtId])

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
                onChange={(event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId)
                  changeDT(newValue)
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
                endpointId={ProductModelingRepository.Modeling.qry}
                parameters={`_startAt=0&_pageSize=200&_params=`}
                name='modelId'
                label={labels.model}
                valueField='recordId'
                displayField='reference'
                values={formik.values}
                required
                readOnly={isReleased || isPosted}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('modelId', newValue?.recordId || '')
                  formik.setFieldValue('threeDPId', newValue?.threeDPId || '')
                  formik.setFieldValue('laborId', newValue?.laborId || null)
                  formik.setFieldValue('laborName', newValue?.laborName || '')
                  if (newValue?.threeDPId) {
                    const response = await getRequest({
                      extension: ProductModelingRepository.Printing.get,
                      parameters: `_recordId=${newValue?.threeDPId}`
                    })

                    const jobId = response?.record?.jobId
                    formik.setFieldValue('jobId', jobId || '')

                    if (jobId) {
                      const result = await getRequest({
                        extension: ManufacturingRepository.MFJobOrder.get,
                        parameters: `_recordId=${response?.record?.jobId}`
                      })

                      formik.setFieldValue('pcs', result?.record?.pcs)
                    } else {
                      formik.setFieldValue('pcs', null)
                    }
                  }
                }}
                error={formik.touched.modelId && Boolean(formik.errors.modelId)}
              />
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
                onClear={() => formik.setFieldValue('pcs', null)}
                maxLength={4}
                error={formik.touched.weight && Boolean(formik.errors.pcs)}
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
              <CustomNumberField
                name='weight'
                label={labels.weight}
                value={formik?.values?.weight}
                maxAccess={maxAccess}
                maxLength={8}
                decimalScale={2}
                readOnly={isReleased || isPosted}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('weight', null)}
                error={formik.touched.weight && Boolean(formik.errors.weight)}
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
