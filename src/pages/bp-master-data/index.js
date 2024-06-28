import React, { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import BPMasterDataWindow from './Windows/BPMasterDataWindow'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ReportParameterBrowser from 'src/components/Shared/ReportParameterBrowser'

// function SampleWindow() {
//   const { stack } = useWindow()

//   return (
//     <div>
//       <Button
//         onClick={() => {
//           stack({
//             Component: SampleWindow,
//             title: 'New Window'
//           })
//         }}
//       >
//         Open New Window
//       </Button>
//       Hello World.
//     </div>
//   )
// }

// function WindowConsumer() {
//   const { stack } = useWindow()

//   return (
//     <div>
//       <Button
//         onClick={() => {
//           stack({
//             Component: SampleWindow,
//             title: 'Sample Window'
//           })
//         }}
//       >
//         Open Window
//       </Button>
//     </div>
//   )
// }

const BPMasterData = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    return await getRequest({
      extension: BusinessPartnerRepository.MasterData.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}&_sortBy=reference desc`
    })
  }

  const {
    query: { data },
    search,
    clear,
    refetch,
    labels: _labels,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: BusinessPartnerRepository.MasterData.qry,
    datasetId: ResourceIds.BPMasterData,
    search: {
      endpointId: BusinessPartnerRepository.MasterData.snapshot,
      searchFn: fetchWithSearch
    }
  })
  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: BusinessPartnerRepository.MasterData.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'groupName',
      headerName: _labels.groupName,
      flex: 1
    },
    ,
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'flName',
      headerName: _labels.flName,
      flex: 1
    },
    {
      field: 'nationalityRef',
      headerName: _labels.nationalityRef,
      flex: 1
    },
    {
      field: 'nationalityName',
      headerName: _labels.nationalityName,
      flex: 1
    },
    {
      field: 'legalStatus',
      headerName: _labels.legalStatus,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: BPMasterDataWindow,
      props: {
        labels: _labels,
        maxAccess: access,
        recordId: recordId ? recordId : null
      },
      width: 1200,
      title: _labels.masterData
    })
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: BusinessPartnerRepository.MasterData.del,
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
          onSearch={search}
          onSearchClear={clear}
          labels={_labels}
          inputSearch={true}
          onGo={refetch}
          reportName='BPMAS'
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default BPMasterData
