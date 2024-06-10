import { useContext } from 'react'

import toast from 'react-hot-toast'

import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

import Tree from 'src/components/Shared/Tree'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useWindow } from 'src/windows'

import { useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import PlantGroupsForm from './forms/PlantGroupsForm'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const Plant = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

  async function fetchGridData() {
    return await getRequest({
      extension: SystemRepository.PlantGroup.qry,
      parameters: `_filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    invalidate,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.PlantGroup.qry,
    datasetId: ResourceIds.PlantGroups
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'parentName',
      headerName: _labels.parent,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: SystemRepository.PlantGroup.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success('Record Deleted Successfully')
    } catch (error) {}
    try {
      await postRequest({
        extension: SystemRepository.PlantGroup.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success('Record Deleted Successfully')
    } catch (error) {}
  }

  function openForm(recordId) {
    stack({
      Component: PlantGroupsForm,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 600,
      height: 300,
      title: _labels.plantGroup
    })
  }

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    }
  ]
  function onTreeClick() {
    stack({
      Component: Tree,
      props: {
        data: data
      },
      width: 500,
      height: 400,
      title: _labels.tree
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} actions={actions} maxAccess={access} onTree={onTreeClick} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationType='client'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default Plant
