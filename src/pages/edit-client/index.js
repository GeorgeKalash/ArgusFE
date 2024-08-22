import React, { useContext } from 'react'
import { Box } from '@mui/material'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'

import { SystemRepository } from 'src/repositories/SystemRepository'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { formatDateDefault } from 'src/lib/date-helper'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useWindow } from 'src/windows'
import ClientTemplateForm from '../clients-list/forms/ClientTemplateForm'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const ClientsList = () => {
  const { stack } = useWindow()

  //control
  const { getRequest } = useContext(RequestsContext)

  //error
  const [errorMessage, setErrorMessage] = useState(null)

  const {
    query: { data },
    filterBy,
    clearFilter,
    labels: labels,
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
    const { _startAt = 0, _pageSize = 50 } = options

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
        setErrorMessage: setErrorMessage,
        labels: labels,
        maxAccess: access,
        recordId: recordId ? recordId : null,
        plantId: _plantId,
        maxAccess: access,
        allowEdit: true
      },
      width: 1100,
      height: 600,
      title: labels.pageTitle
    })
  }

  const editClient = obj => {
    const _recordId = obj.recordId
    openForm(_recordId, '')
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
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
        />
      </Grow>
      {errorMessage?.error && (
        <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
      )}{' '}
    </VertLayout>
  )
}

export default ClientsList
