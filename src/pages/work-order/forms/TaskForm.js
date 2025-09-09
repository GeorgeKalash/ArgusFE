import { useContext } from 'react'
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

import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
import { DataSets } from 'src/resources/DataSets'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

const TaskForm = ({ labels, editMode, maxAccess, store, record }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.WorkTask.qry
  })

  const { recordId: itemId } = store

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      itemId,
      vendorId: record?.vendorId || '',
      currencyId: record?.currencyId || '',
      baseLaborPrice: '',
      priceList: '',
      markdown: '',
      sku: '',
      isPreferred: false,
      deliveryLeadDays: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      type: yup.number().required(),
      priority: yup.string().required()
    }),
    onSubmit: async obj => {
      const vendorId = formik.values.vendorId
      const currencyId = formik.values.currencyId

      const submitData = {
        ...obj,
        markdown: obj.markdown || 0
      }

      const response = await postRequest({
        extension: RepairAndServiceRepository.WorkTask.set,
        record: JSON.stringify(submitData)
      })

      if (!vendorId && !currencyId) {
        toast.success(platformLabels.Added)
      } else {
        toast.success(platformLabels.Edited)
      }

      formik.setValues(submitData)

      invalidate()
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      if (record && record.currencyId && record.vendorId) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.WorkTask.get,
          parameters: `_itemId=${itemId}&_vendorId=${formik.values.vendorId}&_currencyId=${formik.values.currencyId}`
        })

        if (res.record) {
          formik.setValues(res.record)
        }
      }
    }

    fetchData()
  }, [record])

  return (
    <FormShell
      form={formik}
      infoVisible={false}
      resourceId={ResourceIds.PriceList}
      maxAccess={maxAccess}
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
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={RepairAndServiceRepository.PreventiveMaintenanceTasks.qry}
                    parameters='_filter=&_size=30&_startAt=0'
                    name='currencyId'
                    label={labels.currency}
                    valueField='recordId'
                    displayField={'name'}
                    values={formik.values}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
                <Grid item xs={12}>
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
                    maxAccess={maxAccess}
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
