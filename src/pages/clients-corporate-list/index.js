import React, { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { formatDateDefault } from 'src/lib/date-helper'
import { ResourceIds } from 'src/resources/ResourceIds'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { useWindow } from 'src/windows'
import ClientTemplateForm from './forms/ClientTemplateForm'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useError } from 'src/error'

const ClientsCorporateList = () => {
  const { stack } = useWindow()
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const [editMode, setEditMode] = useState(null)

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

  async function fetchWithSearch({ options = {}, filters }) {
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

  const addClient = async obj => {
    try {
      const plantId = await getPlantId()
      if (plantId !== '') {
        setEditMode(false)
        openForm('')
      } else {
        stackError({ message: 'The user does not have a default plant' })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getPlantId = async () => {
    const userData = window.sessionStorage.getItem('userData')
      ? JSON.parse(window.sessionStorage.getItem('userData'))
      : null
    const parameters = `_userId=${userData && userData.userId}&_key=plantId`

    try {
      const res = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: parameters
      })

      if (res.record.value) {
        return res.record.value
      }

      return ''
    } catch (error) {
      // Handle errors if needed
      stackError(error)

      return ''
    }
  }

  const editClient = obj => {
    setEditMode(true)
    const _recordId = obj.recordId
    openForm(_recordId)
  }

  function openForm(recordId) {
    stack({
      Component: ClientTemplateForm,
      props: {
        _labels: _labels,
        maxAccess: access,
        editMode: editMode,
        recordId: recordId ? recordId : null
      },
      width: 1100,
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
