import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import EmploymentHistory from './EmploymentHistory'
import { Typography } from '@mui/material'

const JobTab = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { recordId } = store

  async function fetchGridData() {
    const response = await getRequest({
      extension: RepairAndServiceRepository.EquipmentType.qry,
      parameters: `_filter=&_size=30_startAt=0&_equipmentId=${recordId}`
    })

    return response
  }

  const {
    query: { data },
    refetch,
    invalidate
  } = useResourceQuery({
    enabled: !!recordId,
    queryFn: fetchGridData,
    endpointId: RepairAndServiceRepository.EquipmentType.qry,
    datasetId: ResourceIds.EmployeeFilter
  })

  const {
    query: { data: jobInfo },
    refetch: refetchJobInfo
  } = useResourceQuery({
    enabled: !!recordId,
    queryFn: fetchGridData,
    endpointId: RepairAndServiceRepository.EquipmentType.qry,
    datasetId: ResourceIds.EmployeeFilter
  })

  const columns = [
    {
      field: 'status',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    }
  ]

  const jobInfoColumns = [
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'department',
      headerName: labels.department,
      flex: 1
    },
    {
      field: 'branch',
      headerName: labels.branch,
      flex: 1
    },
    {
      field: 'position',
      headerName: labels.position,
      flex: 1
    },
    {
      field: 'reportTo',
      headerName: labels.reportTo,
      flex: 1
    },
    {
      field: 'status',
      headerName: labels.status,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: RepairAndServiceRepository.EquipmentType.del,
      record: JSON.stringify(obj)
    })

    toast.success(platformLabels.Deleted)
    invalidate()
  }

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  const openForm = id => {
    stack({
      Component: EmploymentHistory,
      props: {
        labels,
        maxAccess,
        recordId: id
      },
      width: 500,
      height: 400,
      title: labels.EmploymentHistory
    })
  }

  return (
    <VertLayout>
      <>
        <Fixed>
          <Typography variant='h6' padding={2}>
            {labels.EmploymentHistory}
          </Typography>
        </Fixed>
        <Fixed>
          <GridToolbar onAdd={add} maxAccess={maxAccess} />
        </Fixed>
        <Grow>
          <Table
            name='EmploymentHistoryTable'
            columns={columns}
            gridData={data}
            rowId={['recordId']}
            onEdit={edit}
            onDelete={del}
            pageSize={50}
            pagination={false}
            refetch={refetch}
            maxAccess={maxAccess}
          />
        </Grow>
      </>
      <Fixed>
        <Typography variant='h6' padding={2}>
          {labels.JobInfo}
        </Typography>
      </Fixed>
      <Grow>
        <Table
          name='JobInfoTable'
          columns={jobInfoColumns}
          gridData={jobInfo}
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
