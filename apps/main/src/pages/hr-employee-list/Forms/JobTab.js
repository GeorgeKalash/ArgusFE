import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { Typography, Grid } from '@mui/material'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import EmploymentHistory from './EmploymentHistory'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'

const JobTab = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { recordId } = store

  const [searchEmployment, setSearchEmployment] = useState('')
  const [searchJobInfo, setSearchJobInfo] = useState('')

  async function fetchGridData() {
    return await getRequest({
      extension: EmployeeRepository.EmployementHistory.qry,
      parameters: `_filter=&_size=30&_startAt=0&_employeeId=${recordId}`
    })
  }

  async function fetchGridJobInfoData() {
    return await getRequest({
      extension: EmployeeRepository.JobInfo.qry,
      parameters: `_filter=&_size=30&_startAt=0&_params=1|${recordId}&_employeeId=&_sortBy=recordId desc`
    })
  }

  const {
    query: { data },
    refetch,
    invalidate
  } = useResourceQuery({
    enabled: !!recordId,
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.EmployementHistory.qry,
    datasetId: ResourceIds.EmployeeFilter,
    params: { disabledReqParams: true, maxAccess }
  })

  const {
    query: { data: jobInfo },
    refetch: refetchJobInfo
  } = useResourceQuery({
    enabled: !!recordId,
    queryFn: fetchGridJobInfoData,
    endpointId: EmployeeRepository.JobInfo.qry,
    datasetId: ResourceIds.EmployeeFilter,
    params: { disabledReqParams: true, maxAccess }
  })

  const filteredEmploymentData = searchEmployment
    ? {
        list: data?.list?.filter(item => item.statusName?.toLowerCase().includes(searchEmployment.toLowerCase()))
      }
    : data

  const filteredJobInfoData = searchJobInfo
    ? {
        list: jobInfo?.list?.filter(item =>
          [item.positionName, item.branchName, item.departmentName]
            .filter(Boolean)
            .some(field => field.toLowerCase().includes(searchJobInfo.toLowerCase()))
        )
      }
    : jobInfo

  const columns = [
    { field: 'statusName', headerName: labels.status, flex: 1 },
    { field: 'date', headerName: labels.date, flex: 1, type: 'date' }
  ]

  const jobInfoColumns = [
    { field: 'date', headerName: labels.date, flex: 1, type: 'date' },
    { field: 'departmentName', headerName: labels.department, flex: 1 },
    { field: 'branchName', headerName: labels.branch, flex: 1 },
    { field: 'positionName', headerName: labels.position, flex: 1 },
    { field: 'reportToName', headerName: labels.reportTo, flex: 1 },
    { field: 'statusName', headerName: labels.status, flex: 1 }
  ]

  const del = async obj => {
    await postRequest({
      extension: EmployeeRepository.EmployementHistory.del,
      record: JSON.stringify(obj)
    })

    toast.success(platformLabels.Deleted)
    invalidate()
  }

  const openForm = obj => {
    stack({
      Component: EmploymentHistory,
      props: {
        labels,
        maxAccess,
        employeeId: recordId,
        recordId: obj?.recordId
      },
      width: 500,
      height: 400,
      title: labels.EmploymentHistory
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <Typography variant='h6' padding={2}>
          {labels.EmploymentHistory}
        </Typography>
      </Fixed>
      <Fixed>
        <Grid container xs={12}>
          <Grid item xs={1.3}>
            <GridToolbar onAdd={openForm} maxAccess={maxAccess} />
          </Grid>
          <Grid item xs={3} paddingTop={1}>
            <CustomTextField
              name='searchEmployment'
              value={searchEmployment}
              label={platformLabels.Search}
              onClear={() => setSearchEmployment('')}
              onChange={e => setSearchEmployment(e.target.value)}
              onSearch={val => setSearchEmployment(val)}
              search
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          name='EmploymentHistoryTable'
          columns={columns}
          gridData={filteredEmploymentData}
          rowId={['recordId']}
          onEdit={openForm}
          onDelete={del}
          pageSize={50}
          pagination={false}
          refetch={refetch}
          maxAccess={maxAccess}
        />
      </Grow>

      <Fixed>
        <Typography variant='h6' padding={2}>
          {labels.JobInfo}
        </Typography>
      </Fixed>
      <Fixed>
        <Grid container xs={12} paddingBottom={2}>
          <Grid item xs={3}>
            <CustomTextField
              name='searchJobInfo'
              value={searchJobInfo}
              label={platformLabels.Search}
              onClear={() => setSearchJobInfo('')}
              onChange={e => setSearchJobInfo(e.target.value)}
              onSearch={val => setSearchJobInfo(val)}
              search
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          name='JobInfoTable'
          columns={jobInfoColumns}
          gridData={filteredJobInfoData}
          rowId={['recordId']}
          pageSize={50}
          pagination={false}
          refetch={refetchJobInfo}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default JobTab
