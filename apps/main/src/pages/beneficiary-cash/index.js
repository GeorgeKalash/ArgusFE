import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import BenificiaryCashForm from '@argus/shared-ui/src/components/Shared/BenificiaryCashForm'
import { RemittanceOutwardsRepository } from '@argus/repositories/src/repositories/RemittanceOutwardsRepository'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const BeneficiaryCash = () => {
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
    datasetId: ResourceIds.BeneficiaryCash,
    filter: {
      endpointId: RemittanceOutwardsRepository.Beneficiary.snapshot,
      filterFn: fetchWithSearch,
      default: { dispersalType: 1, clientId: 0, seqNo: 1 }
    }
  })

  async function fetchWithSearch({ options = {}, filters }) {
    const { _clientId = 0, _dispersalType = 1 } = options

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

  async function openForm(obj) {
    stack({
      Component: BenificiaryCashForm,
      props: {
        client: { clientId: obj.clientId },
        beneficiary: { beneficiaryId: obj.beneficiaryId, beneficiarySeqNo: obj.seqNo },
        recordId:
          obj.clientId && obj.beneficiaryId && obj?.seqNo
            ? (obj.clientId * 100).toString() + (obj.beneficiaryId * 10).toString() + obj?.seqNo
            : null,
        dispersalType: 1
      }
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
      type: 'checkbox'
    },
    {
      field: 'isInactive',
      headerName: _labels.isInactive,
      type: 'checkbox'
    }
  ]

  const delBenCash = async obj => {
    await postRequest({
      extension: RemittanceOutwardsRepository.Beneficiary.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const addBenCash = () => {
    openForm('')
  }

  const editBenCash = obj => {
    openForm(obj)
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
          name='table'
          columns={columns}
          gridData={data}
          refetch={refetch}
          rowId={['beneficiaryId', 'clientId', 'seqNo']}
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
