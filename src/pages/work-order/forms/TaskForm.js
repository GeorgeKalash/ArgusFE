import { useContext, useState } from 'react'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { ControlContext } from 'src/providers/ControlContext'
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
import { DataSets } from 'src/resources/DataSets'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import CustomTextField from 'src/components/Inputs/CustomTextField'

const TaskForm = ({ labels, access, store, seqNo, record }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [options, setOptions] = useState([])
  const isPosted = store.isPosted
  const isCompleted = record.status == 2

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.WorkTask.qry
  })
  const editMode = !!record?.seqNo

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      workOrderId: store.recordId,
      seqNo: null,
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
    validateOnChange: true,
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

      toast.success(!obj.seqNo ? platformLabels.Added : platformLabels.Edited)

      invalidate()
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      const [rnRes, pmtRes] = await Promise.all([
        getRequest({
          extension: RepairAndServiceRepository.EquipmentType.qry,
          parameters: `_equipmentId=${store?.equipmentId}`
        }),
        getRequest({
          extension: RepairAndServiceRepository.PreventiveMaintenanceTasks.qry,
          parameters: ``
        })
      ])

      const taskMap = {}
      pmtRes?.list.forEach(t => {
        taskMap[t.recordId] = t.name
      })

      const merged = rnRes?.list.map(item => ({
        ...item,
        taskName: taskMap[item.pmtId] || null
      }))

      setOptions(merged)
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (record?.seqNo) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.WorkTask.get,
          parameters: `_workOrderId=${store.recordId}&_seqNo=${record.seqNo}`
        })

        if (res.record) {
          formik.setValues({ ...res.record, dueDate: formatDateFromApi(res.record.dueDate) })
        }
      } else {
        formik.setFieldValue('seqNo', seqNo)
      }
    }

    fetchData()
  }, [])

  const taskNotes = options?.find(item => item.pmtId === formik?.values.pmtId)?.notes || ''

  return (
    <FormShell
      form={formik}
      infoVisible={false}
      resourceId={ResourceIds.WorkOrder}
      maxAccess={access}
      editMode={editMode}
      isCleared={false}
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
                    store={options}
                    name='pmtId'
                    label={`${labels.task} / ${labels.repair}`}
                    hidden={formik.values.taskType == 2 || formik.values.taskType == 3}
                    valueField='pmtId'
                    displayField='taskName'
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
                  <Grid item xs={12}>
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
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='dueDate'
                    label={labels.dueBy}
                    value={formik.values?.dueDate}
                    readOnly={isPosted || isCompleted}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('dueDate', '')}
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
                    rows={4}
                    editMode={editMode}
                    maxAccess={access}
                    onChange={e => formik.setFieldValue('notes', e.target.value)}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
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
    </FormShell>
  )
}

export default TaskForm
