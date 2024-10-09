import React, { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import BPMasterDataWindow from './Windows/BPMasterDataWindow'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { ControlContext } from 'src/providers/ControlContext'

const BPMasterData = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: BusinessPartnerRepository.MasterData.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}&_sortBy=reference desc`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    filterBy,
    refetch,
    clearFilter,
    labels: _labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: BusinessPartnerRepository.MasterData.snapshot,
    datasetId: ResourceIds.BPMasterData,
    filter: {
      filterFn: fetchWithFilter
    }
  })
  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: BusinessPartnerRepository.MasterData.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'groupName',
      headerName: _labels.groupName,
      flex: 1
    },
    ,
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
      field: 'nationalityRef',
      headerName: _labels.nationalityRef,
      flex: 1
    },
    {
      field: 'nationalityName',
      headerName: _labels.nationalityName,
      flex: 1
    },
    {
      field: 'legalStatus',
      headerName: _labels.legalStatus,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: BPMasterDataWindow,
      props: {
        labels: _labels,
        maxAccess: access,
        recordId: recordId ? recordId : null
      },
      width: 1200,
      title: _labels.masterData
    })
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: BusinessPartnerRepository.MasterData.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const onApply = ({ search, rpbParams }) => {
    if (!search && rpbParams.length === 0) {
      clearFilter('params')
    } else if (!search) {
      filterBy('params', rpbParams)
    } else {
      filterBy('qry', search)
    }
    refetch()
  }

  const onSearch = value => {
    filterBy('qry', value)
  }

  const onClear = () => {
    clearFilter('qry')
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onAdd={add}
          maxAccess={access}
          onApply={onApply}
          onSearch={onSearch}
          onClear={onClear}
          reportName={'BPMAS'}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          maxAccess={access}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default BPMasterData
