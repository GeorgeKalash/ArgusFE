import { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { CommonContext } from 'src/providers/CommonContext'
import SalesPersonWindow from './Windows/SalesPersonWindow'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const SalesPerson = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const {
    query: { data },
    labels: _labels,
    refetch,
    filterBy,
    clearFilter,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.SalesPerson.qry,
    datasetId: ResourceIds.SalesPerson,
    filter: {
      filterFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ filters }) {
    return await getRequest({
      extension: SaleRepository.SalesPerson.snapshot,
      parameters: `_filter=${filters.qry}`
    })
  }

  const columns = [
    {
      field: 'spRef',
      headerName: _labels[1],
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels[2],
      flex: 1
    },
    {
      field: 'cellPhone',
      headerName: _labels[3],
      flex: 1
    },

    {
      field: 'commissionPct',
      headerName: _labels[4],
      flex: 1
    }
  ]

  const tabs = [
    { label: _labels[8] },
    { label: _labels[9], disabled: !editMode },
    { label: _labels[15], disabled: !editMode }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: SaleRepository.SalesPerson.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })
  }

  const invalidate = useInvalidate({
    endpointId: SaleRepository.SalesPerson.qry
  })

  const add = () => {
    setWindowOpen(true)
    setActiveTab(0)
    setEditMode(false)
  }

  const edit = obj => {
    setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
    setActiveTab(0)
    setEditMode(true)
  }

  const del = async obj => {
    await postRequest({
      extension: SaleRepository.SalesPerson.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
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
          labels={_labels}
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
          paginationType='client'
          maxAccess={access}
        />
      </Grow>

      {windowOpen && (
        <SalesPersonWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          activeTab={activeTab}
          tabs={tabs}
          editMode={editMode}
          setEditMode={setEditMode}
          setErrorMessage={setErrorMessage}
          setActiveTab={setActiveTab}
          recordId={selectedRecordId}
          setSelectedRecordId={setSelectedRecordId}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default SalesPerson
