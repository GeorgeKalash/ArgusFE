// ** React Imports
import { useState, useContext } from 'react'

import { useWindow } from 'src/windows'

// ** MUI Imports
import { Box } from '@mui/material'
import toast from 'react-hot-toast'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'

import { useEffect } from 'react'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

import CodeForm from './CodeForm'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const CodeList = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store

  const { stack } = useWindow()
  const [valueGridData, setValueGridData] = useState()

  async function fetchGridData() {
    const response = await getRequest({
      extension: DocumentReleaseRepository.StrategyCode.qry,

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
    endpointId: DocumentReleaseRepository.StrategyCode.qry
  })

  const columns = [
    {
      field: 'code',
      headerName: labels.code,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    }
  ]

  const addCode = () => {
    openForm()
  }

  const delCode = async obj => {
    try {
      await postRequest({
        extension: DocumentReleaseRepository.StrategyCode.del,
        record: JSON.stringify(obj)
      })
      refetch()
      toast.success('Record Deleted Successfully')
    } catch (error) {
      toast.error('Record cannot be deleted')
    }
  }
  function openForm(recordId) {
    stack({
      Component: CodeForm,
      props: {
        labels: labels,
        recordId: recordId,
        maxAccess,
        store
      },
      width: 500,
      height: 300,
      title: labels.code
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={addCode} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['codeId']}
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

export default CodeList
