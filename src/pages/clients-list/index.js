import React, { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { ResourceIds } from 'src/resources/ResourceIds'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { useWindow } from 'src/windows'
import ClientTemplateForm from './forms/ClientTemplateForm'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useError } from 'src/error'

const ClientsList = () => {
  const { stack } = useWindow()
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()

  const {
    query: { data },
    filterBy,
    clearFilter,
    labels: labels,
    refetch,
    access
  } = useResourceQuery({
    endpointId: CTCLRepository.CtClientIndividual.snapshot,
    datasetId: ResourceIds.ClientMaster,
    filter: {
      endpointId: CTCLRepository.CtClientIndividual.snapshot,
      filterFn: fetchWithSearch,
      default: { category: 1 }
    }
  })
  async function fetchWithSearch({ options = {}, filters }) {
    return (
      filters.qry &&
      (await getRequest({
        extension: CTCLRepository.CtClientIndividual.snapshot,
        parameters: `_filter=${filters.qry}&_category=1`
      }))
    )
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1,
      editable: false
    },
    {
      field: 'fullName',
      headerName: labels.name,
      flex: 1,
      editable: false
    },

    {
      field: 'fullFlName',
      headerName: labels.flName,
      flex: 1,
      editable: false
    },
    {
      field: 'cellPhone',
      headerName: labels.cellPhone,
      flex: 1,
      editable: false
    },
    {
      field: 'nationalityName',
      headerName: labels.nationality,
      flex: 1,
      editable: false
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1,
      editable: false
    },

    {
      field: 'createdDate',
      headerName: labels.createdDate,
      flex: 1,
      editable: false,
      type: 'date'
    },
    {
      field: 'expiryDate',
      headerName: labels.expiryDate,
      flex: 1,
      editable: false,
      type: 'date'
    }
  ]

  function openForm(recordId, _plantId) {
    stack({
      Component: ClientTemplateForm,
      props: {
        labels: labels,
        maxAccess: access,
        recordId: recordId ? recordId : null,
        plantId: _plantId,
        maxAccess: access
      },
      width: 1100,
      title: labels.pageTitle
    })
  }

  const addClient = async () => {
    try {
      const plantId = await getPlantId()
      if (plantId !== '') {
        openForm('', plantId)
      } else {
        stackError({
          message: 'The user does not have a default plant'
        })
      }
    } catch (error) {}
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
    } catch (error) {}
  }

  const editClient = obj => {
    const _recordId = obj.recordId
    openForm(_recordId, '')
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
          labels={labels}
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
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default ClientsList
