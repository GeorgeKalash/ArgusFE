import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import ProfessionsWindow from './Windows/ProfessionsWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'

const Professions = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: RemittanceSettingsRepository.Profession.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }
  
  async function fetchWithSearch({ filters }) {
    return await getRequest({
      extension: RemittanceSettingsRepository.Profession.snapshot,
      parameters: `_filter=${filters.qry}`
    })
  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    filterBy,
    clearFilter,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceSettingsRepository.Profession.page,
    datasetId: ResourceIds.Profession,
    filter: {
      endpointId: RemittanceSettingsRepository.Profession.snapshot,
      filterFn: fetchWithSearch
    }
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.Profession.page
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
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
      field: 'riskLevelName',
      headerName: _labels.riskLevel,
      flex: 1
    }
  ]

  function openForm(recordId) {
    stack({
      Component: ProfessionsWindow,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 600,
      height: 600,
      title: _labels.profession
    })
  }

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: RemittanceSettingsRepository.Profession.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar 
          onAdd={add} 
          maxAccess={access}
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          inputSearch={true} 
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default Professions
