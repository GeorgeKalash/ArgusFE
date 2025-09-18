import { useEffect, useState, useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialStatementRepository } from 'src/repositories/FinancialStatementRepository'
import { useWindow } from 'src/windows'
import NodeWindow from '../windows/NodeWindow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ControlContext } from 'src/providers/ControlContext'
import toast from 'react-hot-toast'
import { ResourceIds } from 'src/resources/ResourceIds'
import FormShell from 'src/components/Shared/FormShell'

const NodeList = ({ store, setStore, labels, maxAccess }) => {
  const { recordId: fsId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [gridData, setGridData] = useState()
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const getGridData = fsId => {
    setGridData([])
    const defaultParams = `_fsId=${fsId}`
    var parameters = defaultParams
    getRequest({
      extension: FinancialStatementRepository.Node.qry,
      parameters: parameters
    }).then(res => {
      setGridData(res)

      /* const item = res.list.find(item => item?.recordId === rowSelectionModel)
      item &&
        setStore(prevStore => ({
          ...prevStore,
          nodeId: item.recordId,
          nodeRef: item.reference
        })) */
    })
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'parentRef',
      headerName: labels.parent,
      flex: 1
    },
    {
      field: 'description',
      headerName: labels.description,
      flex: 1
    },
    {
      field: 'TBAmountName',
      headerName: labels.amount,
      flex: 1
    },
    {
      field: 'displayOrder',
      headerName: labels.order,
      flex: 1,
      type: 'number'
    },
    {
      field: 'numberFormatName',
      headerName: labels.format,
      flex: 1
    },
    {
      field: 'flags',
      headerName: labels.flags,
      flex: 1,
      type: 'number'
    }
  ]

  useEffect(() => {
    fsId && getGridData(fsId)
  }, [fsId])

  const add = () => {
    openForm('')
  }

  const edit = object => {
    openForm(object.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: FinancialStatementRepository.Node.del,
      record: JSON.stringify(obj)
    })
    setStore(prevStore => ({
      ...prevStore,
      nodeId: null,
      nodeRef: ''
    }))
    await getGridData(fsId)
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: NodeWindow,
      props: {
        labels,
        recordId: recordId ? recordId : null,
        fsId,
        maxAccess,
        getGridData
      },
      width: 500,
      title: labels?.node
    })
  }

  const actions = [
    {
      key: 'Flag',
      condition: true,
      onClick: () => openFlags()
    }
  ]

  async function openFlags() {
    stack({
      Component: FlagsForm,
      props: {
        endPoint: SaleRepository.DraftInvoiceSerial.batch,
        header: {
          draftId: formik?.values?.recordId
        },
        onCloseimport: fillGrids,
        maxAccess: maxAccess
      }
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} labels={labels} actions={actions} />
      </Fixed>
      <Grow>
        <Table //name
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          onSelectionChange={row => {
            console.log('row', row)
            if (row) {
              setStore(prevStore => ({
                ...prevStore,
                nodeId: row.recordId,
                nodeRef: row.reference
              }))

              //setRowSelectionModel(row.seqNo)

              //ref.current = currencies.filter(item => item.countryId === row.countryId)
            }
          }}
        />
      </Grow>
    </VertLayout>
  )
}

export default NodeList
