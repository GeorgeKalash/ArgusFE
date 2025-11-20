import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import IntegrationLogicDetailsForm from './IntegrationLogicDetailsForm'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { RequestsContext } from 'src/providers/RequestsContext'

const IntegrationLogicDetails = ({ labels, maxAccess, store, getData }) => {
  const { postRequest } = useContext(RequestsContext)

  const { platformLabels } = useContext(ControlContext)
  const [gridData, setGridData] = useState([])
  const { stack } = useWindow()
  const { recordId, items } = store

  const getGridData = () => {
    setGridData(items || [])
  }

  useEffect(() => {
    getGridData()
  }, [recordId, items])

  const columns = [
    {
      field: 'ptName',
      headerName: labels.postTypes,
      flex: 0.8
    },
    {
      field: 'signName',
      headerName: labels.sign,
      flex: 0.6
    },
    {
      field: 'msName',
      headerName: labels.masterSource,
      flex: 1
    },
    {
      field: 'tagName',
      headerName: labels.tag,
      flex: 1
    },
    {
      field: 'integrationLevelName',
      headerName: labels.integrationLevel,
      flex: 1
    },
    {
      field: 'costCenterSourceName',
      headerName: labels.costCenterSourceName,
      flex: 1
    },
    {
      field: 'description',
      headerName: labels.description,
      wrapText: true,
      autoHeight: true,
      flex: 1.75
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: GeneralLedgerRepository.IntegrationLogicDetails.del,
      record: JSON.stringify(obj)
    })

    toast.success(platformLabels.Deleted)
    getData()
  }

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.seqNo)
  }

  const openForm = id => {
    stack({
      Component: IntegrationLogicDetailsForm,
      props: {
        labels,
        maxAccess,
        store,
        recordId: id,
        getData
      },
      width: 650,
      height: 550,
      title: labels.integrationLogicDetails
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          table='table'
          columns={columns}
          gridData={{ list: gridData }}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default IntegrationLogicDetails
