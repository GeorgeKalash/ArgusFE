import React, { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { CTCLRepository } from '@argus/repositories/src/repositories/CTCLRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ClientCorporateForm from './forms/ClientCorporateForm'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useError } from '@argus/shared-providers/src/providers/error'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const ClientsCorporateList = () => {
  const { stack } = useWindow()
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { userDefaults } = useContext(DefaultsContext)
  const { stack: stackError } = useError()
  const [editMode, setEditMode] = useState(null)

  const plantId = parseInt(userDefaults?.list?.find(({ key }) => key === 'plantId')?.value)

  const {
    query: { data },
    filterBy,
    clearFilter,
    labels: _labels,
    access
  } = useResourceQuery({
    datasetId: ResourceIds.ClientCorporate,
    filter: {
      endpointId: CTCLRepository.ClientCorporate.snapshot,
      filterFn: fetchWithSearch,
      default: { category: 2 }
    }
  })

  async function fetchWithSearch({ filters }) {
    return (
      filters.qry &&
      (await getRequest({
        extension: CTCLRepository.ClientCorporate.snapshot,
        parameters: `_filter=${filters.qry}&_category=2`
      }))
    )
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1,
      editable: false
    },
    {
      field: 'name',
      headerName: _labels?.name,
      flex: 1,
      editable: false
    },
    {
      field: 'cellPhone',
      headerName: _labels.cellPhone,
      flex: 1,
      editable: false
    },
    {
      field: 'nationalityName',
      headerName: _labels.nationality,
      flex: 1,
      editable: false
    },
    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1,
      editable: false
    },
    {
      field: 'createdDate',
      headerName: _labels.createdDate,
      flex: 1,
      editable: false,
      type: 'date'
    },
    {
      field: 'expiryDate',
      headerName: _labels.expiryDate,
      flex: 1,
      editable: false,
      type: 'date'
    }
  ]

  const addClient = async () => {
    if (plantId !== '') {
      openForm('')
    } else {
      stackError({ message: platformLabels.noDefaultPlant })
    }
  }

  const editClient = obj => {
    setEditMode(true)
    const _recordId = obj.recordId
    openForm(_recordId)
  }

  function openForm(recordId) {
    stack({
      Component: ClientCorporateForm,
      props: {
        _labels: _labels,
        maxAccess: access,
        editMode: editMode,
        recordId: recordId ? recordId : null
      },
      title: _labels.clientCorporate
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={addClient}
          maxAccess={access}
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          labels={_labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data ? data : { list: [] }}
          rowId={['recordId']}
          isLoading={false}
          maxAccess={access}
          onEdit={editClient}
          pageSize={50}
          paginationType='client'
        />
      </Grow>
    </VertLayout>
  )
}

export default ClientsCorporateList
