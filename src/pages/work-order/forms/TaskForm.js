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
import { formatDateToApi } from 'src/lib/date-helper'

const TaskForm = ({ labels, editMode, access, store, seqNo }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [options, setOptions] = useState([])

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.WorkTask.qry
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      workOrderId: store.recordId,
      seqNo: null,
      dueDate: null,
      taskType: null,
      priority: null,
      status: 1,
      pmtId: null,
      notes: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      taskType: yup.number().required(),
      priority: yup.number().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: RepairAndServiceRepository.WorkTask.set,
        record: JSON.stringify({
          ...obj,
          dueDate: obj.dueDate ? formatDateToApi(obj.dueDate) : null
        })
      })

      toast.success(!obj.seqNo ? platformLabels.Added : platformLabels.Edited)

      invalidate()
    }
  })

  useEffect(() => {
    const equipmentId = 10

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

      console.log(merged)
      setOptions(merged)
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (store?.workOrderId && record.seqNo) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.WorkTask.get,
          parameters: `_workOrderId=${store.workOrderId}&_seqNo=${eqNo}`
        })

        if (res.record) {
          formik.setValues(res.record)
        }
      } else {
        formik.setFieldValue('seqNo', seqNo)
      }
    }

    fetchData()
  }, [])

  return (
    <FormShell
      form={formik}
      infoVisible={false}
      resourceId={ResourceIds.WorkOrder}
      maxAccess={access}
      editMode={editMode}
      isCleared={false}
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
                    label={labels.priority}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('taskType', newValue?.key || null)
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
                    label={labels.taskRepair}
                    valueField='pmtId'
                    displayField='taskName'
                    values={formik.values}
                    required
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('pmtId', newValue?.recordId || null)
                    }}
                    error={formik.touched.pmtId && Boolean(formik.errors.pmtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='dueDate'
                    label={labels.dueDate}
                    value={formik.values?.dueDate}
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
                    label={labels.remarks}
                    value={formik.values.notes}
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
                    name='notes'
                    label={labels.remarks}
                    value={formik.values.notes}
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
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default TaskForm
