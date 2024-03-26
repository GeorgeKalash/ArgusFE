// ** Custom Imports
import Table from 'src/components/Shared/Table'
import { useContext, useState } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { useFormik } from 'formik'

const BeneficiaryBankWindow = ({ clientId }) => {
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
    endpointId: RemittanceOutwardsRepository.BeneficiaryBank.qry,
    datasetId: ResourceIds.BeneficiaryBank
  })
  async function fetchGridData(options = {}) {
    return await getRequest({
      extension: RemittanceOutwardsRepository.BeneficiaryBank.qry,
      parameters: `_clientId=${clientId}`
    })
  }

  const columns = [
    {
      field: 'beneficiaryName',
      headerName: _labels.beneficiary,
      flex: 1
    },
    {
      field: 'accountRef',
      headerName: _labels.accountRef,
      flex: 1
    },
    {
      field: 'bankName',
      headerName: _labels.bankName,
      flex: 1
    },
    {
      field: 'branchName',
      headerName: _labels.branchName,
      flex: 1
    },
    {
      field: 'IBAN',
      headerName: _labels.iban,
      flex: 1
    },
    {
      field: 'routingNo',
      headerName: _labels.routingNo,
      flex: 1
    },
    {
      field: 'swiftCode',
      headerName: _labels.swiftCode,
      flex: 1
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.BeneficiaryBank}
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
      />
    </FormShell>
  )
}

export default BeneficiaryBankWindow
