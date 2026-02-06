import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useContext } from 'react'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { RemittanceOutwardsRepository } from '@argus/repositories/src/repositories/RemittanceOutwardsRepository'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useFormik } from 'formik'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import BenificiaryCashForm from '@argus/shared-ui/src/components/Shared/BenificiaryCashForm'
import BenificiaryBankForm from '@argus/shared-ui/src/components/Shared/BenificiaryBankForm'
import BenificiaryHistoryForm from '@argus/shared-ui/src/components/Shared/Forms/BenificiaryHistoryForm'
import { Box, IconButton } from '@mui/material'
import Image from 'next/image'
import historyIcon from '@argus/shared-ui/src/components/images/TableIcons/history.png'

const BeneficiaryWindow = ({ clientId }) => {
  const { stack } = useWindow()

  const formik = useFormik({
    initialValues: {
      recordId: clientId
    },
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: () => {}
  })
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceOutwardsRepository.Beneficiary.qry,
    datasetId: ResourceIds.Beneficiary
  })
  async function fetchGridData() {
    const res = await getRequest({
      extension: RemittanceOutwardsRepository.Beneficiary.qry,
      parameters: `_clientId=${clientId}`
    })
    res.list = res.list.map(item => {
      if (item.isInactive === null) {
        item.isInactive = false
      }

      return item
    })

    return res
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 2
    },
    {
      field: 'addressLine1',
      headerName: _labels.addressLine1,
      flex: 2
    },
    {
      field: 'nationalityName',
      headerName: _labels.nationalityId,
      flex: 1
    },
    {
      field: 'countryName',
      headerName: _labels.country,
      flex: 1
    },
    {
      field: 'accountReference',
      headerName: _labels.accountRef,
      flex: 1
    },
    {
      field: 'branchName',
      headerName: _labels.branchName,
      flex: 1
    },
    {
      field: 'dispersalTypeName',
      headerName: _labels.dispersalType,
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: _labels.isInactive,
      type: 'checkbox'
    },
    {
      field: 'beneficiary history',
      headerName: _labels.beneficiaryHistory,
      flex: 1,
      cellRenderer: row => (
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <IconButton size='small' onClick={() => beneficiaryHistory(row)}>
            <Image src={historyIcon} alt='History' width={18} height={18} />
          </IconButton>
        </Box>
      )
    }
  ]

  const editBeneficiary = obj => {
    const beneficiaryId = obj.beneficiaryId
    const clientId = obj.clientId
    const dispersalType = obj.dispersalType
    const nationalityId = obj.nationalityId

    if (dispersalType === 1) {
      stack({
        Component: BenificiaryCashForm,
        props: {
          client: { clientId: clientId },
          dispersalType,
          beneficiary: { beneficiaryId: beneficiaryId, beneficiarySeqNo: obj.seqNo },
          corId: 0,
          countryId: nationalityId,
          recordId:
            obj?.clientId && obj?.beneficiaryId && obj?.seqNo
              ? (obj.clientId * 100).toString() + (obj.beneficiaryId * 10).toString() + obj.seqNo
              : null
        }
      })
    } else if (dispersalType === 2) {
      stack({
        Component: BenificiaryBankForm,
        props: {
          client: { clientId: clientId },
          dispersalType,
          beneficiary: { beneficiaryId: beneficiaryId, beneficiarySeqNo: obj.seqNo },
          corId: 0,
          countryId: nationalityId,
          recordId:
            obj?.clientId && obj?.beneficiaryId && obj?.seqNo
              ? (obj.clientId * 100).toString() + (obj.beneficiaryId * 10).toString() + obj.seqNo
              : null
        }
      })
    }
  }

  const beneficiaryHistory = obj => {
    stack({
      Component: BenificiaryHistoryForm,
      props: {
        client: obj.data.clientId,
        beneficiary: obj.data.beneficiaryId
      },
      width: 1100,
      height: 500,
      title: _labels.beneficiaryHistory
    })
  }

  return (
    <Table
      width={500}
      height={400}
      columns={columns}
      gridData={data}
      rowId={['beneficiaryId']}
      isLoading={false}
      pagination={false}
      maxAccess={access}
      onEdit={editBeneficiary}
    />
  )
}

export default BeneficiaryWindow
