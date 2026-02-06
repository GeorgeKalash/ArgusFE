import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { CommonContext } from '@argus/shared-providers/src/providers/CommonContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const SchedulesTab = ({ store, setStore, _labels, editMode, maxAccess }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  const { formik } = useForm({
    initialValues: {
      plantId: recordId,
      schedules: [
        {
          id: 1,
          plantId: recordId,
          day: '',
          startTime: '',
          endTime: ''
        }
      ]
    },
    validationSchema: yup.object({
      schedules: yup
        .array()
        .of(
          yup.object().shape({
            startTime: yup.string().required(),
            endTime: yup.string().required(),
            description: yup.string().required()
          })
        )
        .required()
    }),
    validateOnChange: true,
    maxAccess,
    onSubmit: async values => {
      const data = {
        plantId: recordId,
        items: values.schedules.map((schedule, index) => ({
          ...schedule,
          id: index + 1,
          plantId: recordId,
          dow: schedule.dow
        }))
      }
      try {
        const res = await postRequest({
          extension: SystemRepository.PlantsSchedule.set2,
          record: JSON.stringify(data)
        })

        if (res) toast.success(platformLabels.Edited)
        setStore(prevStore => ({
          ...prevStore,
          schedules: values.schedules.map((item, index) => ({
            ...item,
            id: index + 1,
            plantId: recordId,
            dow: item.dow
          }))
        }))
      } catch (error) {}
    }
  })

  const columns = [
    {
      component: 'resourcecombobox',
      label: _labels.day,
      name: 'day',
      props: {
        datasetId: DataSets.WEEK_DAY,
        valueField: 'key',
        displayField: 'value',
        displayFieldWidth: 2,
        mapping: [
          { from: 'key', to: 'scheduleId' },
          { from: 'value', to: 'dayName' }
        ],
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: _labels.startTime,
      name: 'startTime'
    },
    {
      component: 'textfield',
      label: _labels.endTime,
      name: 'endTime'
    },
    {
      component: 'textfield',
      label: _labels.description,
      name: 'description'
    }
  ]

  async function getDays() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.WEEK_DAY,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId)
        try {
          const days = await getDays()

          const res = await getRequest({
            extension: SystemRepository.PlantsSchedule.qry,
            parameters: `_plantId=${recordId}`
          })

          const mergedSchedules = days.map(day => {
            const item = {
              dow: parseInt(day.key),
              dayName: day.value,
              startTime: '',
              endTime: ''
            }

            const matchingSchedule = res.list.find(schedule => schedule.dow == item.dow)

            if (matchingSchedule) {
              item.startTime = matchingSchedule.startTime
              item.endTime = matchingSchedule.endTime
              item.description = matchingSchedule.description
            }

            return item
          })

          formik.setValues({
            ...formik.values,
            schedules: mergedSchedules.map((items, index) => ({
              ...items,
              id: index + 1
            }))
          })
          setStore(prevStore => ({
            ...prevStore,
            schedules: mergedSchedules.map((items, index) => ({
              ...items,
              id: index + 1
            }))
          }))
        } catch (error) {}
    })()
  }, [recordId])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode} isParentWindow={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('schedules', value)}
            value={formik.values?.schedules}
            error={formik.errors?.schedules}
            columns={columns}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default SchedulesTab
