import { useEffect, useState, useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ProductDispersalForm from './productDispersalForm'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import toast from 'react-hot-toast'

const ProductDispersalList = ({ store, setStore, labels, maxAccess }) => {
  const { recordId: pId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [gridData, setGridData] = useState()
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const getGridData = pId => {
    setGridData([])
    const defaultParams = `_productId=${pId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductDispersal.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)

        setStore(prevStore => ({
          ...prevStore,
          dispersals: res.list
        }))
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

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
      field: 'dispersalTypeName',
      headerName: labels.dispersalType,
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: labels.isInactive,
      type: 'checkbox'
    },
    {
      field: 'isDefault',
      headerName: labels.isDefault,
      type: 'checkbox'
    }
  ]

  useEffect(() => {
    pId && getGridData(pId)
  }, [pId])

  const add = () => {
    openForm('')
  }

  const edit = object => {
    openForm(object.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: RemittanceSettingsRepository.ProductDispersal.del,
      record: JSON.stringify(obj)
    })
    await getGridData(pId)
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: ProductDispersalForm,
      props: {
        labels,
        recordId,
        pId,
        maxAccess,
        getGridData
      },
      width: 500,
      title: labels?.dispersal
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default ProductDispersalList
