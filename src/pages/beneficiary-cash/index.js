// ** React Importsport
import { useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

import { useWindow } from 'src/windows'
import BenificiaryCashForm from 'src/components/Shared/BenificiaryCashForm'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const BeneficiaryCash = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)

  //states
  const { stack } = useWindow()

  const {
    query: { data },
    filterBy,
    clearFilter,
    labels: _labels,
    access,
    invalidate
  } = useResourceQuery({
    endpointId: RemittanceOutwardsRepository.Beneficiary.snapshot,
    datasetId: ResourceIds.BeneficiaryCash,
    filter: {
      endpointId: RemittanceOutwardsRepository.Beneficiary.snapshot,
      filterFn: fetchWithSearch,
      default: { dispersalType: 1, clientId: 0 }
    }
  })

  async function fetchWithSearch({ options = {}, filters }) {
    const { _clientId = 0, _dispersalType = 1 } = options
    if (!filters.qry) {
      return { list: [] }
    } else {
      return await getRequest({
        extension: RemittanceOutwardsRepository.Beneficiary.snapshot,
        parameters: `_clientId=${_clientId}&_dispersalType=${_dispersalType}&_filter=${filters.qry}`
      })
    }
  }

  //const invalidate = useInvalidate({
  // endpointId: RemittanceOutwardsRepository.Beneficiary.snapshot
  // })

  async function openForm(beneficiaryId, clientId) {
    stack({
      Component: BenificiaryCashForm,
      props: {
        clientId: clientId,
        beneficiaryId: beneficiaryId,
        dispersalType: 1,
        seqNo: 1
      },
      width: 700,
      height: 500,
      title: _labels.cash
    })
  }

  const columns = [
    {
      field: 'IBAN',
      headerName: _labels.IBAN,
      flex: 1
    },
    {
      field: 'accountReference',
      headerName: _labels.accountReference,
      flex: 1
    },
    {
      field: 'clientRef',
      headerName: _labels.clientRef,
      flex: 1
    },
    {
      field: 'benName',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'nationalityName',
      headerName: _labels.nationalityName,
      flex: 1
    },
    ,
    {
      field: 'branchName',
      headerName: _labels.branchName,
      flex: 1
    },
    {
      field: 'cobName',
      headerName: _labels.countryOfBirth,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.fullName,
      flex: 1
    },
    {
      field: 'shortName',
      headerName: _labels.shortName,
      flex: 1
    },
    {
      field: 'isBlocked',
      headerName: _labels.isBlocked,
      flex: 1
    }
  ]

  const delBenCash = async obj => {
    await postRequest({
      extension: RemittanceOutwardsRepository.Beneficiary.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const addBenCash = () => {
    openForm('')
  }

  const editBenCash = obj => {
    openForm(obj.beneficiaryId, obj.clientId)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={addBenCash}
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
          gridData={data ? data : { list: [] }}
          rowId={['beneficiaryId', 'clientId']}
          onEdit={editBenCash}
          onDelete={delBenCash}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default BeneficiaryCash
