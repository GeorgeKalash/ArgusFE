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

export default function RubberForm({ labels, access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.Damage,
    access: access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: ProductModelingRepository.Rubber.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: recordId,
      dtId: documentType?.dtId,
      reference: '',
      modelId: null,
      threeDPId: null,
      laborId: null,
      startDate: new Date(),
      endDate: new Date(),
      pcs: null,
      jobId: null,
      itemId: null,

      status: 1,
      statusName: '',
      jobId: null,
      seqNo: 0,
      pcs: 0,
      workCenterId: null,
      maxPcs: 50
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({}),
    onSubmit: async obj => {
      postRequest({
        extension: ManufacturingRepository.Damage.set,
        record: JSON.stringify({
          ...obj,
          startDate: formatDateToApi(obj.startDate),
          endDate: formatDateToApi(obj.endDate)
        })
      }).then(async res => {
        const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
        toast.success(actionMessage)
        await refetchForm(res.recordId)
        invalidate()
      })
    }
  })

  async function refetchForm(damageId) {
    await getRequest({
      extension: ManufacturingRepository.Damage.get,
      parameters: `_recordId=${damageId}`
    }).then(async res => {
      formik.setValues({
        ...res?.record,
        startDate: formatDateFromApi(res?.record?.startDate),
        endDate: formatDateFromApi(res?.record?.endDate)
      })
    })
  }

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status === 3

  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.Damage.post,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Posted)
    invalidate()

    await refetchForm(formik.values.recordId)
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
      disabled: !editMode || isPosted
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
      resourceId={ResourceIds.Damages}
      functionId={SystemFunction.Damage}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      isPosted={isPosted}
      actions={actions}
      editMode={editMode}
      disabledSubmit={isPosted}
      disabledSavedClear={isPosted}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item container xs={6} spacing={2}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.DocumentType.qry}
                  parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.Damage}`}
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
                  endpointId={ProductModelingRepository.Model.qry}
                  parameters={`_startAt=0&_pageSize=200&_params=`}
                  name='modelId'
                  label={labels.laborId}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  valueField='recordId'
                  displayField='reference'
                  values={formik.values}
                  onChange={async (event, newValue) => {
                    formik.setFieldValue('modelId', newValue?.recordId || '')
                    formik.setFieldValue('jobId', newValue?.jobId || '')
                    formik.setFieldValue('threeDPId', newValue?.threeDPId || '')
                    if (newValue?.jobId) {
                      const response = await getRequest({
                        extension: ManufacturingRepository.MFJobOrder.get,
                        parameters: `_recordId=${newValue?.jobId}`
                      })
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
                  label={labels.laborId}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  valueField='recordId'
                  displayField='name'
                  values={formik.values}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      formik.setFieldValue('laborId', newValue?.recordId)
                    } else {
                      formik.setFieldValue('laborId', '')
                    }
                  }}
                  error={formik.touched.laborId && Boolean(formik.errors.laborId)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='sku'
                  label={labels.item}
                  value={formik?.values?.sku}
                  maxAccess={maxAccess}
                  readOnly
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='itemName'
                  value={formik?.values?.itemName}
                  maxAccess={maxAccess}
                  readOnly
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('reference', '')}
                  error={formik.touched.reference && Boolean(formik.errors.reference)}
                />
              </Grid>

              <Grid item xs={12}>
                <CustomDatePicker
                  name='startDate'
                  required
                  label={labels.startDate}
                  value={formik?.values?.startDate}
                  onChange={formik.setFieldValue}
                  readOnly={editMode}
                  maxAccess={maxAccess}
                  onClear={() => formik.setFieldValue('startDate', null)}
                  error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomDatePicker
                  name='endDate'
                  required
                  label={labels.endDate}
                  value={formik?.values?.endDate}
                  onChange={formik.setFieldValue}
                  readOnly={editMode}
                  maxAccess={maxAccess}
                  onClear={() => formik.setFieldValue('endDate', null)}
                  error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                />
              </Grid>

              <Grid item xs={12}>
                <CustomNumberField
                  name='weight'
                  label={labels.workCenter}
                  value={formik?.values?.wcName}
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('weight', '')}
                  error={formik.touched.weight && Boolean(formik.errors.weight)}
                />
              </Grid>

              <Grid item xs={12}>
                <CustomTextArea
                  name='notes'
                  label={labels.remarks}
                  value={formik.values.notes}
                  rows={4}
                  editMode={editMode}
                  readOnly={isPosted}
                  maxAccess={maxAccess}
                  onChange={e => formik.setFieldValue('notes', e.target.value)}
                  onClear={() => formik.setFieldValue('notes', '')}
                  error={formik.touched.notes && Boolean(formik.errors.notes)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
