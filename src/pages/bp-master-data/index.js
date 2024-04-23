// ** React Importsport
import React, { useState, useContext, use } from 'react'

// ** MUI Imports
import { Box, Button } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import BPMasterDataWindow from './Windows/BPMasterDataWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'

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
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: BusinessPartnerRepository.MasterData.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=&_sortBy=reference desc`
    })
  }

  const {
    query: { data },
    search,
    clear,
    refetch,
    labels: _labels,
    access
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

  const invalidate = useInvalidate({
    endpointId: BusinessPartnerRepository.MasterData.qry
  })

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
    openForm('')
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
      height: 600,
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
    <>
      <Box>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={search}
          onSearchClear={clear}
          labels={_labels}
          inputSearch={true}
        />
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
          refetch={refetch}
        />
      </Box>
    </>
  )
}

export default BPMasterData
