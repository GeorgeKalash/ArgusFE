import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'

export default function SalaryForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.SalaryChangeReasonFilters.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: EmployeeRepository.SalaryChangeReasonFilters.set,
        record: JSON.stringify(obj)
      })

      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      if (!obj.recordId) {
        formik.setFieldValue('recordId', response.recordId)
      }
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: EmployeeRepository.SalaryChangeReasonFilters.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res?.record)
      }
    })()
  }, [])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: EmployeeRepository.Employee.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.Employee.page,
    datasetId: ResourceIds.HrSalary
  })

  const columns = [
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'basicAmount',
      headerName: _labels.basicAmount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'finalAmount',
      headerName: _labels.finalAmount,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: SalaryForm,
      props: {
        _labels,
        recordId,
        maxAccess: access
      },
      width: 500,
      height: 250,
      title: _labels.folder
    })
  }

  const del = async obj => {
    await postRequest({
      extension: AccessControlRepository.NotificationLabel.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <FormShell
      resourceId={ResourceIds.SalaryChangeReasonFilter}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <CustomTextField
                name='employee'
                label={labels.employee}
                value={formik.values.employee}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('employee', '')}
                error={formik.touched.employee && Boolean(formik.errors.employee)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='department'
                label={labels.department}
                value={formik.values.department}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('department', '')}
                error={formik.touched.department && Boolean(formik.errors.department)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='position'
                label={labels.position}
                value={formik.values.position}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('position', '')}
                error={formik.touched.position && Boolean(formik.errors.position)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='branch'
                label={labels.branch}
                value={formik.values.branch}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('branch', '')}
                error={formik.touched.branch && Boolean(formik.errors.branch)}
              />
            </Grid>
          </Grid>
        </Grow>
        <Fixed>
          <GridToolbar onAdd={add} maxAccess={access} />
        </Fixed>
        <Grow>
          <Table
            columns={columns}
            gridData={data}
            rowId={['recordId']}
            onEdit={edit}
            onDelete={del}
            pageSize={50}
            paginationType='api'
            paginationParameters={paginationParameters}
            refetch={refetch}
            maxAccess={access}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
