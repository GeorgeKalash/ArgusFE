import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import AccountGroupsForm from './forms/AccountGroupsForm'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const AccountGroups = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: FinancialRepository.Group.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: FinancialRepository.Group.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const {
    query: { data },
    labels,
    filterBy,
    paginationParameters,
    refetch,
    access: maxAccess,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.Group.page,
    datasetId: ResourceIds.FlAccountGroups,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'nraDescription',
      headerName: labels.numberRange,
      flex: 1
    }
  ]

  const add = () => openForm()

  const edit = obj => openForm(obj?.recordId)

  const del = async obj => {
    await postRequest({
      extension: FinancialRepository.Group.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: AccountGroupsForm,
      props: {
        labels,
        recordId,
        maxAccess
      },
      width: 600,
      height: 400,
      title: labels.accountGroups
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={maxAccess} reportName={'FIGRP'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default AccountGroups