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
import BenificiaryBankForm from 'src/components/Shared/BenificiaryBankForm'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import toast from 'react-hot-toast'

const BeneficiaryBank = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)

  //states
  const { stack } = useWindow()

  const {
    query: { data },
    filterBy,
    refetch,
    clearFilter,
    labels: _labels,
    access
  } = useResourceQuery({
    endpointId: RemittanceOutwardsRepository.Beneficiary.snapshot,
    datasetId: ResourceIds.BeneficiaryBank,
    filter: {
      endpointId: RemittanceOutwardsRepository.Beneficiary.snapshot,
      filterFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ options = {}, filters }) {
    const { _clientId = 0, _dispersalType = 2 } = options
    if (!filters.qry) {
      return { list: [] }
    } else {
      return await getRequest({
        extension: RemittanceOutwardsRepository.Beneficiary.snapshot,
        parameters: `_clientId=${_clientId}&_dispersalType=${_dispersalType}&_filter=${filters.qry}`
      })
    }
  }

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.Beneficiary.snapshot
  })

  async function openForm(beneficiaryId, clientId) {
    stack({
      Component: BenificiaryBankForm,
      props: {
        clientId: clientId,
        beneficiaryId: beneficiaryId,
        dispersalType: 2
      },
      width: 700,
      height: 500,
      title: _labels.bank
    })
  }

  const columns = [
    {
      field: 'IBAN',
      headerName: _labels.iban,
      flex: 1
    },
    {
      field: 'accountReference',
      headerName: _labels.accountRef,
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
      headerName: _labels.nationality,
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

  const delBenBank = async obj => {
    await postRequest({
      extension: RemittanceOutwardsRepository.BeneficiaryBank.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const addBenBank = () => {
    openForm('')
  }

  const editBenBank = obj => {
    openForm(obj.beneficiaryId, obj.clientId)
  }

  return (
    <>
      <Box>
        <GridToolbar
          onAdd={addBenBank}
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
        <Table
          columns={columns}
          gridData={data ? data : { list: [] }}
          rowId={['beneficiaryId', 'clientId']}
          onEdit={editBenBank}
          onDelete={delBenBank}
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

export default BeneficiaryBank
