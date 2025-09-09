import { useContext } from 'react'
import { useWindow } from 'src/windows'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import TaskForm from './TaskForm'
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
import { Box, IconButton } from '@mui/material'
import Image from 'next/image'
import GridToolbar from 'src/components/Shared/GridToolbar'
import PartsForm from './PartsForm'

const TaskList = ({ store, labels, access }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData() {
    const response = await getRequest({
      extension: RepairAndServiceRepository.WorkTask.qry,
      parameters: `&_workOrderId=${recordId}`
    })

    return response
  }
  console.log(access)

  const {
    query: { data },
    refetch
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.WorkOrder,
    queryFn: fetchGridData,
    endpointId: RepairAndServiceRepository.WorkTask.qry
  })

  const columns = [
    {
      field: 'typeName',
      headerName: labels.type,
      flex: 1
    },
    {
      field: 'taskName',
      headerName: labels.taskName,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'parts',
      headerName: labels.parts,
      flex: 1,
      cellRenderer: row => {
        console.log(row)

        return (
          <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
            <IconButton
              size='small'
              onClick={() =>
                stack({
                  Component: PartsForm,
                  props: {
                    labels,
                    recordId,
                    access,
                    store,
                    seqNo: row?.data?.seqNo
                  },

                  title: labels.vendor
                })
              }
            >
              <Image src={`/images/buttonsicons/partGrid.png`} width={18} height={18} alt='post.png' />
            </IconButton>
          </Box>
        )
      }
    },
    {
      field: 'labors',
      headerName: labels.labors,
      flex: 1,
      cellRenderer: row => {
        return (
          <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
            <IconButton size='small' onClick={() => confirmationPost(row.data)}>
              <Image src={`/images/buttonsicons/labor2Grid.png`} width={18} height={18} alt='post.png' />
            </IconButton>
          </Box>
        )
      }
    },
    {
      field: 'mark',
      headerName: labels.markAsComplete,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: RepairAndServiceRepository.WorkTask.del,
      record: JSON.stringify(obj)
    })
    refetch()

    toast.success(platformLabels.Deleted)
  }

  const edit = obj => {
    openForm(obj)
  }

  function openForm(record) {
    stack({
      Component: TaskForm,
      props: {
        labels,
        recordId: record?.recordId,
        seqNo: data.list.length + 1,
        record,
        access,
        store
      },

      title: labels.vendor
    })
  }

  const add = () => {
    openForm()
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          name='task'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          pageSize={50}
          onEdit={edit}
          pagination={false}
          onDelete={del}
          maxAccess={access}
          height={200}
        />
      </Grow>
    </VertLayout>
  )
}

export default TaskList
