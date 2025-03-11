import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import CustomDateTimePicker from 'src/components/Inputs/CustomDateTimePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ProductModelingRepository } from 'src/repositories/ProductModelingRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

export default function ModellingForm({ labels, access, setStore, store }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store
  const editMode = !!recordId

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.ModelMaker,
    access: access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: ProductModelingRepository.ModelMaker.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      dtId: documentType?.dtId,
      reference: null,
      date: new Date(),
      threeDPId: null,
      laborId: null,
      startDate: null,
      endDate: null,
      weight: 0,
      wip: null,
      notes: '',
      status: 1
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      laborId: yup.string().required(),
      threeDPId: yup.string().required()
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: ProductModelingRepository.ModelMaker.set,
        record: JSON.stringify({
          ...obj,
          date: formatDateToApi(obj.date),
          startDate: obj.startDate ? formatDateToApi(obj.startDate) : null,
          endDate: obj.endDate ? formatDateToApi(obj.endDate) : null
        })
      })

      toast.success(recordId ? platformLabels.Edited : platformLabels.Added)
      refetchForm(res?.recordId)
      invalidate()
    }
  })
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
      recordId: res.record.recordId,
      isClosed: res.record.wip === 2
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
                onClear={() => formik.setFieldValue('reference', null)}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDateTimePicker
                name='startDate'
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
              <ResourceLookup
                endpointId={ManufacturingRepository.Labor.snapshot}
                parameters={{ _workCenterId: 0 }}
                valueField='reference'
                displayField='name'
                name='laborId'
                label={labels.labor}
                form={formik}
                required
                readOnly={isClosed}
                displayFieldWidth={2}
                valueShow='laborRef'
                secondValueShow='laborName'
                maxAccess={maxAccess}
                editMode={editMode}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('laborName', newValue?.name)
                  formik.setFieldValue('laborRef', newValue?.reference)
                  formik.setFieldValue('laborId', newValue?.recordId)
                }}
                errorCheck={'laborId'}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={ProductModelingRepository.Printing.snapshot}
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
                onChange={async (event, newValue) => {
                  formik.setFieldValue('threeDPRef', newValue?.reference)
                  formik.setFieldValue('threeDPId', newValue?.recordId)
                }}
                errorCheck={'threeDPId'}
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
