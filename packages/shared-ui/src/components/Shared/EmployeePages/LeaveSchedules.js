import { useEffect, useState, useContext } from 'react'
import toast from 'react-hot-toast'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { useForm } from '@argus/shared-hooks/src/hooks/form.js'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { LeaveManagementRepository } from '@argus/repositories/src/repositories/LeaveManagementRepository'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'

export default function LeaveSchedules({ labels, maxAccess, row, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [schedules, setSchedules] = useState([])
  const { platformLabels } = useContext(ControlContext)
  const isActive = row?.activeStatus ? row?.activeStatus == 1 : true

  const conditions = {
    lsName: row => row?.lastGeneratedEarnedLeave != null
  }
  const { schema } = createConditionalSchema(conditions, true, maxAccess, 'items')


  const { formik } = useForm({
    conditionSchema: ['items'],
    maxAccess,
    validateOnChange: true,
    initialValues: {
      items: [],
      ...row
    },
    validationSchema: yup.object({
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const updatedRows = formik.values.items
        .filter(row => row.lsId != null && row.lsId !== '')
        .map(scheduleRow => ({
          employeeId: row.recordId,
          ltId: scheduleRow.ltId,
          lsId: scheduleRow.lsId
        }))

      const resultObject = {
        employeeId: row.recordId,
        items: updatedRows
      }
        await postRequest({
          extension: EmployeeRepository.Leaves.set2,
          record: JSON.stringify(resultObject)
        })
      toast.success(platformLabels.Edited)
      window.close()
    }
  })

  const columns = [
    {
      component: 'textfield',
      label: labels.leaveType,
      name: 'ltName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      name: 'lsName',
      label: labels.leaveSchedule,
      props: {
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'lsId' },
          { from: 'name', to: 'lsName' }
        ]
      },
      propsReducer({ row, props }) {
        return {
            ...props,
            store: schedules.filter(
                schedule => schedule.ltId === row?.ltId
            )
        }
      }
    },
    {
      component: 'date',
      label: labels.lastGeneratedEarnedLeave,
      name: 'lastGeneratedEarnedLeave',
      props: {
        readOnly: true
      }
    }
  ]

  useEffect(() => {
    ;(async function () {
        const schedules = await getRequest({
            extension: LeaveManagementRepository.LeaveScheduleFilters.qry,
            parameters: `_filter=`
        })

        setSchedules(schedules.list || [])

        const res = await getRequest({
        extension: LeaveManagementRepository.LeaveTypes.qry,
        parameters: `_filter=`
        })

        const empSchedules = await getRequest({
        extension: EmployeeRepository.Leaves.qry,
        parameters: `_employeeId=${row.recordId}`
        })

        const mergedRows = (res.list || []).map((leaveType, index) => {
            const matchingSchedule = (empSchedules.list || []).find(
                schedule => schedule.ltId === leaveType.recordId
            )

            return {
                id: index + 1,
                ltId: leaveType.recordId,
                ltName: leaveType.name,
                lsId: matchingSchedule?.lsId ?? null,
                lsName: matchingSchedule?.lsName ?? null,
            }
        })

        formik.setFieldValue('items', mergedRows)
    })()
    }, [])


  function handleRowsChange(newValues) {
    const updatedRows = formik.values.items.map(row => {
      const newValue = newValues.find(newRow => newRow.id === row.id)

      return newValue || row
    })

    formik.setFieldValue('items', updatedRows)
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} disabledSubmit={!isActive}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='employeeRef'
                label={labels.reference}
                value={formik.values.reference}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='fullName'
                label={labels.name}
                value={formik.values.fullName}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            name='items'
            maxAccess={maxAccess}
            onChange={value => handleRowsChange(value)}
            value={formik.values.items}
            error={formik.errors.items}
            enableFilters
            columns={columns}
            disabled={!isActive}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

LeaveSchedules.width = 550
LeaveSchedules.height = 500
