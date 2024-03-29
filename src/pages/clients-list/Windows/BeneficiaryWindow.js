// ** Custom Imports
import Table from 'src/components/Shared/Table'
import { useContext, useState } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { useFormik } from 'formik'
import { useWindow } from 'src/windows'
import BenificiaryCash from 'src/pages/outwards-transfer/Tabs/BenificiaryCash'
import BenificiaryBank from 'src/pages/outwards-transfer/Tabs/BenificiaryBank'

const BeneficiaryWindow = ({ clientId }) => {
  const { stack } = useWindow()

  const [initialValues, setInitialData] = useState({
    recordId: clientId
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: values => {}
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
  async function fetchGridData(options = {}) {
    return await getRequest({
      extension: RemittanceOutwardsRepository.Beneficiary.qry,
      parameters: `_clientId=${clientId}`
    })
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
    }
  ]

  const editBeneficiary = obj => {
    const beneficiaryId = obj.beneficiaryId
    const clientId = obj.clientId
    const dispersalType = obj.dispersalType

    if (dispersalType === 1) {
      stack({
        Component: BenificiaryCash,
        props: { clientId: clientId, dispersalType: dispersalType, beneficiaryId: beneficiaryId },
        width: 700,
        height: 500,
        title: 'Cash'
      })
    } else if (dispersalType === 2) {
      stack({
        Component: BenificiaryBank,
        props: { clientId: clientId, dispersalType: dispersalType, beneficiaryId: beneficiaryId },
        width: 900,
        height: 600,
        title: 'Bank'
      })
    }
  }

  return (
    <FormShell
      resourceId={ResourceIds.Beneficiary}
      height={480}
      form={formik}
      maxAccess={access}
      isSaved={false}
      isInfo={false}
      isCleared={false}
    >
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
    </FormShell>
  )
}

export default BeneficiaryWindow
