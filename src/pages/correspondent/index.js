import { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CorrespondentWindow from './Windows/CorrespondentWindow'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const Correspondent = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const [errorMessage, setErrorMessage] = useState(null)
  const { platformLabels } = useContext(ControlContext)

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    invalidate,
    filterBy,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceSettingsRepository.Correspondent.page,
    datasetId: ResourceIds.Correspondent,

    filter: {
      endpointId: RemittanceSettingsRepository.Correspondent.snapshot,
      filterFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: RemittanceSettingsRepository.Correspondent.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    var parameters = defaultParams

    const response = await getRequest({
      extension: RemittanceSettingsRepository.Correspondent.page,
      parameters: parameters
    })

    return { ...response, _startAt: _startAt }
  }

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
      field: 'bpRef',
      headerName: _labels.businessPartner,
      flex: 1
    },
    {
      field: 'cgName',
      headerName: _labels.group,
      flex: 1
    },
    {
      field: 'currencyRef',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'interfaceName',
      headerName: _labels.interface,
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: _labels.isInActive,
      type: 'checkbox'
    }
  ]

  const delCorrespondent = obj => {
    postRequest({
      extension: RemittanceSettingsRepository.Correspondent.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success(platformLabels.Deleted)
        invalidate()
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addCorrespondent = () => {
    openForm('')
  }

  function openForm(recordId) {
    stack({
      Component: CorrespondentWindow,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null
      },
      width: 900,
      height: 660,
      title: _labels.correspondent
    })
  }

  const popup = obj => {
    openForm(obj?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          labels={_labels}
          onAdd={addCorrespondent}
          maxAccess={access}
          reportName={'RTCOR'}
          filterBy={filterBy}
        />
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
          onDelete={delCorrespondent}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default Correspondent
