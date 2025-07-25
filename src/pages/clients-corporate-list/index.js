import React, { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { ResourceIds } from 'src/resources/ResourceIds'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { useWindow } from 'src/windows'
import ClientCorporateForm from './forms/ClientCorporateForm'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useError } from 'src/error'
import { ControlContext } from 'src/providers/ControlContext'

const ClientsCorporateList = () => {
  const { stack } = useWindow()
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { stack: stackError } = useError()
  const [editMode, setEditMode] = useState(null)

  const plantId = parseInt(userDefaultsData?.list?.find(({ key }) => key === 'plantId')?.value)

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
