// ** React Imports
import { useState, useContext } from 'react'

import { useWindow } from '@argus/shared-providers/src/providers/windows'

// ** MUI Imports
import { Box } from '@mui/material'
import toast from 'react-hot-toast'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'

// ** Custom Imports
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'

// ** Resources
import PreReqsForm from './PrereqForm'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

const PreReqsList = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store

  const { stack } = useWindow()

  async function fetchGridData() {
    const response = await getRequest({
      extension: DocumentReleaseRepository.StrategyPrereq.qry,

      parameters: `&_strategyId=${recordId}`
    })

    return response
  }

  const {
    query: { data },
    labels: _labels,

    refetch
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.Strategies,
    queryFn: fetchGridData,
    endpointId: DocumentReleaseRepository.StrategyPrereq.qry
  })

  const columns = [
    {
      field: 'code',
      headerName: labels.code,
      flex: 1
    },
    {
      field: 'prerequisiteCode',
      headerName: labels.prerequisite,
      flex: 1
    }
  ]

  const addCode = () => {
    openForm()
  }

  const delCode = async obj => {
    await postRequest({
      extension: DocumentReleaseRepository.StrategyPrereq.del,
      record: JSON.stringify(obj)
    })
    refetch()

    toast.success('Record Deleted Successfully')
  }

  function openForm(recordId) {
    stack({
      Component: PreReqsForm,
      props: {
        labels: labels,
        recordId: recordId ? recordId : null,
        maxAccess,
        store
      },
      width: 500,
      height: 300,
      title: labels.prere
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={addCode} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          name='preReq'
          columns={columns}
          gridData={data}
          rowId={['code']}
          isLoading={false}
          pageSize={50}
          pagination={false}
          onDelete={delCode}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default PreReqsList
