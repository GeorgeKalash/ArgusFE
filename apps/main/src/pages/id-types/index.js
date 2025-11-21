import { useState, useContext } from 'react'
import { Box } from '@mui/material'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import IdTypesWindow from './Windows/IdTypesWindow'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { CurrencyTradingSettingsRepository } from '@argus/repositories/src/repositories/CurrencyTradingSettingsRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const IdTypes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CurrencyTradingSettingsRepository.IdTypes.qry,
    datasetId: ResourceIds.IdTypes
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams

    const response = await getRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.page,
      parameters: parameters
    })

    return { ...response }
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'flName',
      headerName: _labels.flName,
      flex: 1
    },
    {
      field: 'format',
      headerName: _labels.format,
      flex: 1
    },
    {
      field: 'length',
      headerName: _labels.length,
      flex: 1
    }
  ]

  const delCharacteristics = obj => {
    postRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.del,
      record: JSON.stringify(obj)
    }).then(res => {
      toast.success(platformLabels.Deleted)
      invalidate()
    })
  }

  const addCharacteristics = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: IdTypesWindow,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 600,
      height: 650,
      title: _labels.idTypes
    })
  }

  const popup = obj => {
    openForm(obj?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={addCharacteristics} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          onEdit={popup}
          onDelete={delCharacteristics}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default IdTypes
