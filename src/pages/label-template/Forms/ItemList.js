import { useEffect, useState, useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useWindow } from 'src/windows'
import ItemForm from './ItemForm'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ControlContext } from 'src/providers/ControlContext'
import { SCRepository } from 'src/repositories/SCRepository'

const ItemList = ({ recordId: tlId, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [gridData, setGridData] = useState()
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const getGridData = () => {
    setGridData([])

    getRequest({
      extension: SCRepository.Item.qry,
      parameters: `_labelTemplateId=${tlId}`
    })
      .then(res => {
        setGridData(res)

        setStore(prevStore => ({
          ...prevStore,
          dispersals: res.list
        }))
      })
      .catch(error => {})
  }

  const columns = [
    {
      field: 'itemKey',
      headerName: labels.itemKey,
      flex: 1
    },
    {
      field: 'displayTypeName',
      headerName: labels.displayType,
      flex: 1
    },
    {
      field: 'x',
      headerName: 'X',
      flex: 1,
      type: {
        field: 'number',
        decimal: 2
      }
    },
    {
      field: 'y',
      headerName: 'Y',
      flex: 1,
      type: {
        field: 'number',
        decimal: 2
      }
    },
    {
      field: 'font',
      headerName: labels.font,
      flex: 1
    },
    {
      field: 'fontSize',
      headerName: labels.fontSize,
      flex: 1,
      type: {
        field: 'number',
        decimal: 2
      }
    }
  ]

  useEffect(() => {
    if (tlId) getGridData()
  }, [tlId])

  const add = () => {
    openForm()
  }

  const edit = object => {
    openForm(object.seqNo)
  }

  const del = obj => {
    postRequest({
      extension: SCRepository.Item.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData()
        toast.success(platformLabels.Deleted)
      })
      .catch(error => {})
  }

  function openForm(seqNo) {
    stack({
      Component: ItemForm,
      props: {
        labels,
        seqNo: seqNo || gridData?.list?.length + 1,
        tlId,
        maxAccess,
        getGridData
      },
      width: 700,
      height: 450,
      title: labels?.item
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
          rowId={['seqNo']}
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

export default ItemList
