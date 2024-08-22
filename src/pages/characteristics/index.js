import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CharacteristicsWindow from './Windows/CharacteristicsWindow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { formatDateDefault } from 'src/lib/date-helper'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const Characteristics = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  //control

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: DocumentReleaseRepository.CharacteristicsGeneral.qry,
    datasetId: ResourceIds.Characteristics
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams

    const response = await getRequest({
      extension: DocumentReleaseRepository.CharacteristicsGeneral.qry,
      parameters: parameters
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'textSize',
      headerName: _labels.textSize,
      flex: 1
    },
    {
      field: 'validFrom',
      headerName: _labels.validFrom,
      type: 'date',
      flex: 1
    }
  ]

  const delCharacteristics = obj => {
    postRequest({
      extension: DocumentReleaseRepository.CharacteristicsGeneral.del,
      record: JSON.stringify(obj)
    }).then(res => {
      toast.success('Record Deleted Successfully')
      invalidate()
    })
  }

  const addCharacteristics = () => {
    openForm('')
  }

  function openForm(recordId) {
    stack({
      Component: CharacteristicsWindow,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 600,
      title: _labels.characteristics
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

export default Characteristics
