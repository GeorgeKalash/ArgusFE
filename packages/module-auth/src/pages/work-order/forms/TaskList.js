import { useContext } from 'react'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import TaskForm from './TaskForm'
import { RepairAndServiceRepository } from '@argus/repositories/src/repositories/RepairAndServiceRepository'
import { Box, IconButton } from '@mui/material'
import Image from 'next/image'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import PartsForm from './PartsForm'
import LaborsForm from './LaborsForm'
import Link from '@mui/material/Link'

const TaskList = ({ store, labels, access }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData() {
    const response = await getRequest({
      extension: RepairAndServiceRepository.WorkTask.qry,
      parameters: `_workOrderId=${recordId}`
    })

    return response
  }

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
      headerName: labels.task,
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
        return (
          <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
            <IconButton
              size='small'
              onClick={() =>
                stack({
                  Component: PartsForm,
                  props: {
                    labels,
                    access,
                    store,
                    data: row?.data
                  },
                  width: 900,
                  title: labels.parts
                })
              }
            >
              <Image
                src={require('@argus/shared-ui/src/components/images/buttonsIcons/partGrid.png').default.src}
                width={18}
                height={18}
                alt='post.png'
              />
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
            <IconButton
              size='small'
              onClick={() =>
                stack({
                  Component: LaborsForm,
                  props: {
                    labels,
                    access,
                    store,
                    data: row?.data
                  },
                  width: 900,
                  title: labels.labors
                })
              }
            >
              <Image
                src={require('@argus/shared-ui/src/components/images/buttonsIcons/labor2Grid.png').default.src}
                width={18}
                height={18}
                alt='post.png'
              />
            </IconButton>
          </Box>
        )
      }
    },
    {
      field: 'mark',
      headerName: labels.markAsComplete,
      flex: 1,
      cellRenderer: row => {
        return (
          <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
            <Link
              component='button'
              disabled={store.isPosted}
              sx={{
                fontSize: 14,
                cursor: 'pointer',
                textDecoration: 'underline',
                textDecorationColor: 'blue',
                color: 'blue'
              }}
              onClick={async () => {
                await postRequest({
                  extension: RepairAndServiceRepository.WorkTask.set,
                  record: JSON.stringify({
                    ...row.data,
                    status: row.data.status === 1 ? 2 : 1
                  })
                })
                toast.success(platformLabels.Updated)

                refetch()
              }}
            >
              {row.data.status == 2 ? labels.incompleted : labels.completed}
            </Link>
          </Box>
        )
      }
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

  const maxSeqNo = (data?.list?.length ? Math.max(...data.list.map(item => item.seqNo)) : 0) + 1

  function openForm(record) {
    stack({
      Component: TaskForm,
      props: {
        labels,
        seqNo: maxSeqNo,
        record,
        access,
        store
      },
      height: 400,
      title: labels.task
    })
  }

  const add = () => {
    openForm()
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} disableAdd={store.isPosted} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          name='task'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          pagination={false}
          onDelete={!store.isPosted && del}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default TaskList
