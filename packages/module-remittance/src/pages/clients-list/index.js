import React, { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { CTCLRepository } from '@argus/repositories/src/repositories/CTCLRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ClientTemplateForm from '@argus/shared-ui/src/components/Shared/Forms/ClientTemplateForm'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useError } from '@argus/shared-providers/src/providers/error'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const ClientsList = () => {
  const { stack } = useWindow()
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const plantId = parseInt(userDefaultsData?.list?.find(({ key }) => key === 'plantId')?.value)

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
  async function fetchWithSearch({ filters }) {
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
      field: 'name',
      headerName: labels.name,
      flex: 1,
      editable: false
    },

    {
      field: 'flName',
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
        recordId,
        plantId: _plantId
      }
    })
  }

  const addClient = async () => {
    if (plantId) {
      openForm('', plantId)
    } else {
      stackError({
        message: platformLabels.noDefaultPlant
      })
    }
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
