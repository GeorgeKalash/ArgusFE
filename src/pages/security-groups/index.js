import { useContext } from 'react'
import { Box } from '@mui/material'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import GroupInfoWindow from './Windows/GroupInfoWindow'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'

const SecurityGroup = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels: _labels,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: AccessControlRepository.SecurityGroup.qry,
    datasetId: ResourceIds.SecurityGroup
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: AccessControlRepository.SecurityGroup.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  const invalidate = useInvalidate({
    endpointId: AccessControlRepository.SecurityGroup.qry
  })

  function openForm(recordId) {
    stack({
      Component: GroupInfoWindow,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 600,
      height: 600,
      title: _labels.securityGroups
    })
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'description',
      headerName: _labels.description,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: AccessControlRepository.SecurityGroup.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  return (
    <>
      <Box>
        <GridToolbar onAdd={add} maxAccess={access} />
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          paginationType='client'
          refetch={refetch}
        />
      </Box>
    </>
  )
}

export default SecurityGroup
