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
import { SystemChecks } from 'src/resources/SystemChecks'
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
      priority: null,
      type: null,
      progress: null,
      notes: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      equipmentId: yup.number().required(),
      type: yup.number().required()
    }),

    onSubmit: async obj => {
      const response = await postRequest({
        extension: RepairAndServiceRepository.WorkOrder.set,
        record: JSON.stringify(obj)
      })
      if (!obj.recordId) {
        setStore(prevStore => ({
          ...prevStore,
          recordId: response.recordId
        }))
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isRaw = formik.values.status === 1
  const isPosted = formik.values.status === 2

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.WorkOrder.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          date: formatDateFromApi(res.record?.date),
          schedule: res.record?.schedule ? formatDateFromApi(res.record?.schedule) : null,
          dueDate: res.record?.dueDate ? formatDateFromApi(res.record.dueDate) : null
        })
      }
    })()
  }, [])

  const onPost = async () => {
    await postRequest({
      extension: RepairAndServiceRepository.WorkTask.post,
      record: JSON.stringify({
        ...formik?.values,
        date: formatDateToApi(formik?.values?.date),
        schedule: formik?.values?.schedule ? formatDateToApi(formik?.values?.schedule) : null,
        dueDate: formik?.values?.dueDate ? formatDateToApi(formik?.values?.dueDate) : null
      })
    })

    toast.success(platformLabels.Posted)
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
                required
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
                label={labels?.sku}
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
                  formik.setFieldValue('equipmentId', newValue?.recordId || null)
                  formik.setFieldValue('equipmentName', newValue?.description || '')
                  formik.setFieldValue('equipmentRef', newValue?.reference || '')
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
                label={labels.scheduled}
                value={formik.values?.scheduled}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('scheduled', '')}
                error={formik.touched.scheduled && Boolean(formik.errors.scheduled)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='dueDate'
                label={labels.dueDate}
                value={formik.values?.dueDate}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('dueDate', '')}
                error={formik.touched.date && Boolean(formik.errors.dueDate)}
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
                name='type'
                label={labels.type}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('type', newValue.recordId)
                }}
                error={formik.touched.type && Boolean(formik.errors.type)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.remarks}
                value={formik.values.notes}
                rows={4}
                editMode={editMode}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('notes', e.target.value)}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                datasetId={DataSets.RS_PRIORITY}
                name='progress'
                label={labels.progress}
                valueField='key'
                displayField='value'
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
                label={labels.currentPM}
                value={formik.values?.currentPM}
                readOnly={!formik.values?.currentPM}
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
                label={labels.currentSM}
                value={formik.values?.currentSM}
                readOnly={!formik.values?.currentSM}
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
