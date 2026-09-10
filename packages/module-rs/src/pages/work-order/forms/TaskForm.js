import { useContext, useState } from 'react'
import { Grid } from '@mui/material'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RepairAndServiceRepository } from '@argus/repositories/src/repositories/RepairAndServiceRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const TaskForm = ({ labels, access, store, seqNo, record, window }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [options, setOptions] = useState([])
  const isPosted = store.isPosted
  const isCompleted = record?.status == 2

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.WorkTask.qry
  })
  const editMode = !!record?.seqNo

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      workOrderId: store.recordId,
      seqNo,
      dueDate: null,
      taskType: null,
      priority: null,
      status: 1,
      rnId: null,
      pmtId: null,
      notes: '',
      eqNotes: '',
      otherName: ''
    },
    validationSchema: yup.object({
      taskType: yup.number().required(),
      priority: yup.number().required()
    }),
    onSubmit: async obj => {
      const { eqNotes, dueDate, ...data } = obj
      await postRequest({
        extension: RepairAndServiceRepository.WorkTask.set,

        record: JSON.stringify({
          ...data,
          dueDate: dueDate ? formatDateToApi(dueDate) : null
        })
      })

      toast.success(!record?.seqNo ? platformLabels.Added : platformLabels.Edited)
      window.close()
      invalidate()
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      if (record?.seqNo) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.WorkTask.get,
          parameters: `_workOrderId=${store.recordId}&_seqNo=${record.seqNo}`
        })

        formik.setValues({ ...res.record, dueDate: formatDateFromApi(res.record.dueDate) })
      }
    }

    fetchData()
  }, [])

  const taskNotes = options?.list?.find(item => item.pmtId === formik?.values.pmtId)?.notes || ''

  return (
    <Form
      onSave={formik.handleSubmit}
      maxAccess={access}
      editMode={editMode}
      disabledSubmit={store.isPosted || isCompleted}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.RS_WO_TASK_TYPE}
                    name='taskType'
                    label={labels.type}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    readOnly={isPosted || isCompleted}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('taskType', newValue?.key || null)
                      formik.setFieldValue('pmtId', null)
                      formik.setFieldValue('rnId', null)
                    }}
                    error={formik.touched.taskType && Boolean(formik.errors.taskType)}
                    maxAccess={access}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={RepairAndServiceRepository.EquipmentType.qry}
                    parameters={`_equipmentId=${store?.equipmentId}`}
                    setData={setOptions}
                    name='pmtId'
                    label={`${labels.task} / ${labels.repair}`}
                    hidden={formik.values.taskType == 2 || formik.values.taskType == 3}
                    valueField='pmtId'
                    displayField='pmtName'
                    values={formik.values}
                    readOnly={!formik.values.taskType || isPosted || isCompleted}
                    maxAccess={access}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('pmtId', newValue?.pmtId || null)
                    }}
                    error={formik.touched.pmtId && Boolean(formik.errors.pmtId)}
                  />
                  <ResourceComboBox
                    endpointId={RepairAndServiceRepository.RepairName.qry}
                    name='rnId'
                    label={`${labels.task} / ${labels.repair}`}
                    hidden={formik.values.taskType == 1 || formik.values.taskType == 3 || !formik.values.taskType}
                    valueField='recordId'
                    displayField='name'
                    readOnly={isPosted || isCompleted}
                    values={formik.values}
                    maxAccess={access}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('rnId', newValue?.recordId || null)
                    }}
                    error={formik.touched.rnId && Boolean(formik.errors.rnId)}
                  />
                  <CustomTextField
                    name='otherName'
                    label={`${labels.task} / ${labels.repair}`}
                    value={formik.values.otherName}
                    maxAccess={access}
                    readOnly={isPosted || isCompleted}
                    hidden={formik.values.taskType == 2 || formik.values.taskType == 1 || !formik.values.taskType}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('otherName', '')}
                    error={formik.touched.otherName && Boolean(formik.errors.otherName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='dueDate'
                    label={labels.dueBy}
                    value={formik.values?.dueDate}
                    readOnly={isPosted || isCompleted}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('dueDate', null)}
                    error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.RS_PRIORITY}
                    name='priority'
                    label={labels.priority}
                    readOnly={isPosted || isCompleted}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('priority', newValue?.key || null)
                    }}
                    error={formik.touched.priority && Boolean(formik.errors.priority)}
                    maxAccess={access}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    label={labels.notes}
                    value={formik.values.notes}
                    readOnly={isPosted || isCompleted}
                    rows={3}
                    editMode={editMode}
                    maxAccess={access}
                    onChange={e => formik.setFieldValue('notes', e.target.value)}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6} sx={{ mt: 10 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='eqNotes'
                    label={labels.taskNotes}
                    value={taskNotes}
                    rows={3}
                    hidden={formik.values.taskType != 1}
                    readOnly
                    maxAccess={access}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default TaskForm
