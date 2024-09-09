import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import IntegrationLogicDetailsForm from './IntegrationLogicDetailsForm'

const IntegrationLogicDetails = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [gridData, setGridData] = useState([])
  const { stack } = useWindow()
  const { recordId } = store

  const getGridData = async ilId => {
    try {
      const response = await getRequest({
        extension: GeneralLedgerRepository.IntegrationLogicDetails.qry,
        parameters: `_ilId=${ilId}`
      })

      setGridData(response)
    } catch (error) {}
  }

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
      field: 'description',
      headerName: labels.description,
      wrapText: true,
      autoHeight: true,
      flex: 1.75
    }
  ]

  const del = async obj => {
    try {
      await postRequest({
        extension: GeneralLedgerRepository.IntegrationLogicDetails.del,
        record: JSON.stringify(obj)
      })

      toast.success(platformLabels.Deleted)
      await getGridData(recordId)
    } catch (exception) {}
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
        ilId: recordId,
        getGridData
      },
      width: 650,
      height: 550,
      title: labels.integrationLogicDetails
    })
  }

  useEffect(() => {
    if (recordId) {
      getGridData(recordId)
    }
  }, [recordId])

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
          onEdit={edit}
          onDelete={del}
          api={getGridData}
          isLoading={false}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default IntegrationLogicDetails
