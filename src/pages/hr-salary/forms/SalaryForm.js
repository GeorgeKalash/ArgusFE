import { Grid } from '@mui/material'
import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import Table from 'src/components/Shared/Table'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { formatDateFromApi } from 'src/lib/date-helper'
import { getFormattedNumber } from 'src/lib/numberField-helper'
import SalaryWindow from '../Windows/SalaryWindow'
import { useWindow } from 'src/windows'
import GridToolbar from 'src/components/Shared/GridToolbar'

export default function SalaryForm({ employeeInfo, maxAccess, labels }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    refetch,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.EmployeeSalary.qry,
    datasetId: ResourceIds.Salaries,
    params: { disabledReqParams: true, maxAccess }
  })

  const { formik } = useForm({
    initialValues: {
      employeeName: employeeInfo?.name || null,
      positionName: employeeInfo?.positionName || null,
      branchName: employeeInfo?.branchName || null,
      departmentName: employeeInfo?.departmentName || null
    },
    maxAccess
  })

  async function fetchGridData() {
    if (!employeeInfo?.recordId) return

    const response = await getRequest({
      extension: EmployeeRepository.EmployeeSalary.qry,
      parameters: `_employeeId=${employeeInfo?.recordId}`
    })

    return response.list.map(record => ({
      ...record,
      effectiveDate: record.effectiveDate ? formatDateFromApi(record.effectiveDate) : null,
      basicAmount: `${record.currencyRef} ${getFormattedNumber(record.basicAmount, 2)}`,
      finalAmount: `${record.currencyRef} ${getFormattedNumber(record.finalAmount, 2)}`
    }))
  }

  const columns = [
    {
      field: 'effectiveDate',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'basicAmount',
      headerName: labels.basicAmount,
      flex: 1
    },
    {
      field: 'finalAmount',
      headerName: labels.finalAmount,
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
      Component: SalaryWindow,
      props: {
        labels,
        recordId,
        maxAccess,
        employeeInfo
      },
      width: 900,
      height: 600,
      title: labels.salary
    })
  }

  const del = async obj => {
    await postRequest({
      extension: EmployeeRepository.EmployeeSalary.del,
      record: JSON.stringify({
        ...obj,
        finalAmount: 0,
        comments: '',
        accountNumber: '',
        basicAmount: 0,
        currencyId: 0,
        effectiveDate: new Date(),
        paymentFrequency: 0,
        paymentMethod: 0,
        salaryType: 0,
        scrId: 0
      })
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={maxAccess}
          leftSection={
            <Grid item xs={11} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <CustomTextField
                    name='employeeName'
                    label={labels.employee}
                    value={formik?.values?.employeeName}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('employeeName', '')}
                    error={formik.touched.employeeName && Boolean(formik.errors.employeeName)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='positionName'
                    label={labels.position}
                    value={formik?.values?.positionName}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('positionName', '')}
                    error={formik.touched.positionName && Boolean(formik.errors.positionName)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='departmentName'
                    label={labels.department}
                    value={formik?.values?.departmentName}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('departmentName', '')}
                    error={formik.touched.departmentName && Boolean(formik.errors.departmentName)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='branchName'
                    label={labels.branch}
                    value={formik?.values?.branchName}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('branchName', '')}
                    error={formik.touched.branchName && Boolean(formik.errors.branchName)}
                  />
                </Grid>
              </Grid>
            </Grid>
          }
        />
      </Fixed>
      <Grow>
        <Table
          name='salaryTable'
          columns={columns}
          gridData={{ list: data }}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pagination={false}
          refetch={refetch}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}
