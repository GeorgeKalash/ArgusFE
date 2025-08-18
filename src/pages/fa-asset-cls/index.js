import { useContext } from 'react'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FixedAssetsRepository } from 'src/repositories/FixedAssetsRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import AssetClassesForm from './forms/AssetClassesForm'
import toast from 'react-hot-toast'

const FaAssetCls = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FixedAssetsRepository.Asset.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    access,
    invalidate,
    refetch,
    paginationParameters,
    isLoading
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FixedAssetsRepository.Asset.page,
    datasetId: ResourceIds.AssetClass
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
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: FixedAssetsRepository.Asset.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: AssetClassesForm,
      props: {
        labels: _labels,
        recordId,
        maxAccess: access
      },
      width: 600,
      height: 350,
      title: _labels?.assetClass
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={isLoading}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default FaAssetCls
