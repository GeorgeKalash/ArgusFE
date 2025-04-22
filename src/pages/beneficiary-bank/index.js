import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import BenificiaryBankForm from 'src/components/Shared/BenificiaryBankForm'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

const BeneficiaryBank = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const {
    query: { data },
    filterBy,
    refetch,
    clearFilter,
    labels: _labels,
    access,
    invalidate
  } = useResourceQuery({
    endpointId: RemittanceOutwardsRepository.Beneficiary.snapshot,
    datasetId: ResourceIds.BeneficiaryBank,
    filter: {
      endpointId: RemittanceOutwardsRepository.Beneficiary.snapshot,
      filterFn: fetchWithSearch,
      default: { dispersalType: 2, clientId: 0, seqNo: 1 }
    }
  })

  async function fetchWithSearch({ options = {}, filters }) {
    const { _clientId = 0, _dispersalType = 2 } = options
    if (!filters.qry) {
      return { list: [] }
    } else {
      const res = await getRequest({
        extension: RemittanceOutwardsRepository.Beneficiary.snapshot,
        parameters: `_clientId=${_clientId}&_dispersalType=${_dispersalType}&_filter=${filters.qry}&_currencyId=0`
      })
      res.list = res.list.map(item => {
        if (item.isInactive === null) {
          item.isInactive = false
        }

        return item
      })

      return res
    }
  }

  async function openForm(obj) {
    stack({
      Component: BenificiaryBankForm,
      props: {
        client: { clientId: obj.clientId },
        beneficiary: { beneficiaryId: obj.beneficiaryId, beneficiarySeqNo: obj.seqNo },
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
      type: 'checkbox',
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: _labels.isInactive,
      type: 'checkbox',
      flex: 1
    }
  ]

  const delBenBank = async obj => {
    await postRequest({
      extension: RemittanceOutwardsRepository.Beneficiary.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const addBenBank = () => {
    openForm('')
  }

  const editBenBank = obj => {
    openForm(obj)
  }

  return (
    <VertLayout>
      <Fixed>
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
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['beneficiaryId', 'clientId', 'seqNo']}
          onEdit={editBenBank}
          onDelete={delBenBank}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default BeneficiaryBank
