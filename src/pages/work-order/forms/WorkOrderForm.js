import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { DataSets } from 'src/resources/DataSets'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

export default function WorkOrderForm({ labels, access, setStore, store }) {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { maxAccess, documentType, changeDT } = useDocumentType({
    functionId: SystemFunction.WorkOrder,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.WorkOrder.page
  })

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId, reference: documentType?.reference },
    initialValues: {
      recordId: store.recordId,
      dtId: null,
      reference: '',
      equipmentId: null,
      equipmentRef: '',
      equipmentName: '',
      date: new Date(),
      dueDate: null,
      schedule: null,
      priority: 2,
      wotId: null,
      progress: 1,
      description: '',
      status: 1
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      equipmentId: yup.number().required(),
      wotId: yup.number().required(),
      progress: yup.number().required(),
      priority: yup.number().required()
    }),

    onSubmit: async obj => {
      const response = await postRequest({
        extension: RepairAndServiceRepository.WorkOrder.set,
        extension: RepairAndServiceRepository.WorkOrder.set,
        record: JSON.stringify(obj)
      })

      refetchForm(response.recordId)
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isRaw = formik.values.status === 1
  const isPosted = store.isPosted

  const refetchForm = async recordId => {
    if (recordId) {
      const res = await getRequest({
        extension: RepairAndServiceRepository.WorkOrder.get,
        parameters: `_recordId=${recordId}`
      })

      formik.setValues({
        ...res.record,
        date: formatDateFromApi(res.record?.date),
        scheduled: res.record?.scheduled ? formatDateFromApi(res.record?.scheduled) : null,
        dueDate: res.record?.dueDate ? formatDateFromApi(res.record.dueDate) : null
      })

      setStore(prevStore => ({
        ...prevStore,
        recordId: res.record.recordId,
        equipmentId: res.record.equipmentId,
        reference: res.record.reference,
        isPosted: res.record.status === 3
      }))
    }
  }
  useEffect(() => {
    refetchForm(recordId)
  }, [])

  const onPost = async () => {
    await postRequest({
      extension: RepairAndServiceRepository.WorkTask.post,
      record: JSON.stringify({
        ...formik?.values,
        date: formatDateToApi(formik?.values?.date),
        scheduled: formik?.values?.scheduled ? formatDateToApi(formik?.values?.scheduled) : null,
        dueDate: formik?.values?.dueDate ? formatDateToApi(formik?.values?.dueDate) : null
      })
    })

    toast.success(platformLabels.Posted)
    refetchForm(formik.values.recordId)
    invalidate()
    window.close()
  }

  const actions = [
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      disabled: !editMode,
      datasetId: ResourceIds.GLBalanceTransferBetweenAccounts
    },
    {
      key: 'Unlocked',
      condition: true,
      onClick: onPost,
      disabled: !editMode || isPosted
    },
    {
      key: 'IV',
      condition: true,
      onClick: 'onInventoryTransaction',
      disabled: !editMode || isRaw
    }
  ]

  return (
    <FormShell
      actions={actions}
      functionId={SystemFunction.WorkOrder}
      resourceId={ResourceIds.WorkOrder}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.WorkOrder}`}
                filter={!editMode ? item => item.activeStatus === 1 : undefined}
                name='dtId'
                label={labels.docType}
                readOnly={editMode}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                  changeDT(newValue)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                maxAccess={!editMode && maxAccess}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                readOnly={editMode || !formik.values.dtId}
                maxAccess={!editMode && maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={RepairAndServiceRepository.Equipment.snapshot}
                name='equipmentId'
                label={labels?.equipment}
                secondFieldLabel={labels?.equipmentName}
                valueField='recordId'
                displayField='reference'
                valueShow='equipmentRef'
                secondValueShow='equipmentName'
                form={formik}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'description', value: 'Description' }
                ]}
                onChange={(_, newValue) => {
                  formik.setFieldValue('equipmentName', newValue?.description || '')
                  formik.setFieldValue('equipmentRef', newValue?.reference || '')
                  formik.setFieldValue('equipmentId', newValue?.recordId || null)
                }}
                maxAccess={maxAccess}
                errorCheck={'equipmentId'}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values?.date}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='scheduled'
                label={labels.Scheduled}
                value={formik.values?.scheduled}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('scheduled', null)}
                error={formik.touched.scheduled && Boolean(formik.errors.scheduled)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='dueDate'
                label={labels.dueBy}
                value={formik.values?.dueDate}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('dueDate', null)}
                error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.RS_PRIORITY}
                name='priority'
                label={labels.priority}
                valueField='key'
                displayField='value'
                required
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('priority', newValue?.key || null)
                }}
                error={formik.touched.priority && Boolean(formik.errors.priority)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={RepairAndServiceRepository.WorkOrderTypes.qry}
                name='wotId'
                label={labels.type}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('wotId', newValue?.recordId || null)
                }}
                error={formik.touched.wotId && Boolean(formik.errors.wotId)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='description'
                label={labels.notes}
                value={formik.values.description}
                rows={4}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('description', e.target.value)}
                onClear={() => formik.setFieldValue('description', '')}
                error={formik.touched.description && Boolean(formik.errors.description)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                datasetId={DataSets.RS_WO_PROGRESS}
                name='progress'
                label={labels.progress}
                valueField='key'
                displayField='value'
                required
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('progress', newValue?.key || null)
                }}
                error={formik.touched.progress && Boolean(formik.errors.progress)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='currentPM'
                label={labels.cpm}
                value={formik.values?.currentPM}
                readOnly={!formik.values?.equipmentId}
                maxLength={6}
                decimalScale={3}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('currentPM', '')}
                maxAccess={maxAccess}
                error={formik.touched.currentPM && Boolean(formik.errors.currentPM)}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='currentSM'
                label={labels.csm}
                value={formik.values?.currentSM}
                readOnly={!formik.values?.equipmentId}
                maxLength={6}
                decimalScale={3}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('currentSM', '')}
                maxAccess={maxAccess}
                error={formik.touched.currentSM && Boolean(formik.errors.currentSM)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
