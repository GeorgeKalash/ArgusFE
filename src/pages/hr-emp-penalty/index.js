import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { Grid } from '@mui/material'

import EmpPenaltyForm from './forms/EmpPenaltyForm'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'

const EmpPenalty = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [values, setValues] = useState({ employeeId: null, employeeRef: '', employeeName: '' })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: EmployeeRepository.EmployeePenalty.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_size=50&_sortBy=date&_employeeId=${
        values.employeeId || 0
      }`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access,
    filterBy,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.EmployeePenalty.page,
    datasetId: ResourceIds.EmployeePenalties,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.ref,
      flex: 1
    },
    {
      field: 'employeeName',
      headerName: labels.empName,
      flex: 1
    },
    {
      field: 'penaltyName',
      headerName: labels.penalty,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'amount',
      headerName: labels.amount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: labels.releaseStatus,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: labels.wip,
      flex: 1
    }
  ]

  const add = async () => {
    await proxyAction()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: EmployeeRepository.EmployeePenalty.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.Penalty,
    action: openForm,
    hasDT: false
  })

  function openForm(recordId) {
    stack({
      Component: EmpPenaltyForm,
      props: {
        labels,
        recordId,
        access
      },
      width: 600,
      height: 450,
      title: labels.empPenalty
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onAdd={add}
          maxAccess={access}
          hasSearch={false}
          filterBy={filterBy}
          leftSection={
            <Grid container sx={{ width: '500px', mt: 5, ml: 5 }}>
              <Grid item xs={12}>
                <ResourceLookup
                  endpointId={EmployeeRepository.Employee.snapshot}
                  parameters={{ _branchId: 0 }}
                  filter={{ activeStatus: 1 }}
                  valueField='reference'
                  displayField='fullName'
                  name='employeeId'
                  label={labels.employee}
                  secondFieldLabel={labels.empName}
                  formObject={values}
                  displayFieldWidth={2}
                  valueShow='employeeRef'
                  secondValueShow='employeeName'
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'fullName', value: 'Name' }
                  ]}
                  maxAccess={access}
                  onChange={(_, newValue) => {
                    setValues({
                      employeeId: newValue?.recordId || null,
                      employeeRef: newValue?.reference || '',
                      employeeName: newValue?.fullName || ''
                    })
                  }}
                />
              </Grid>
            </Grid>
          }
        />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          paginationType='api'
          maxAccess={access}
          refetch={refetch}
          paginationParameters={paginationParameters}
        />
      </Grow>
    </VertLayout>
  )
}

export default EmpPenalty
