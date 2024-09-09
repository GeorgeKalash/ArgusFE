import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import LotCategoryForm from './forms/LotCategoryForm'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

const IvLotCategory = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.LotCategory.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    invalidate,
    paginationParameters,
    access
  } = useResourceQuery({
    endpointId: InventoryRepository.LotCategory.page,
    queryFn: fetchGridData,
    datasetId: ResourceIds.LotCategories
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
      field: 'naraRef',
      headerName: _labels.numberRange,
      flex: 1
    },
    {
      field: 'udd1',
      headerName: _labels.userDefinedDate1,
      flex: 1
    },
    {
      field: 'udd2',
      headerName: _labels.userDefinedDate2,
      flex: 1
    },
    {
      field: 'udt1',
      headerName: _labels.userDefinedText1,
      flex: 1
    },
    {
      field: 'udt2',
      headerName: _labels.userDefinedText2,
      flex: 1
    },
    {
      field: 'udn1',
      headerName: _labels.userDefinedNumeric1,
      flex: 1
    },
    {
      field: 'udn2',
      headerName: _labels.userDefinedNumeric2,
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
    try {
      await postRequest({
        extension: InventoryRepository.LotCategory.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (e) {}
  }

  function openForm(recordId) {
    stack({
      Component: LotCategoryForm,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 500,
      height: 650,
      title: _labels.lotCategory
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
          isLoading={false}
          refetch={refetch}
          pageSize={50}
          maxAccess={access}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default IvLotCategory
