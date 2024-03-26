// ** Custom Imports
import Table from 'src/components/Shared/Table'
import { useContext, useState } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { useFormik } from 'formik'
import { formatDateDefault } from 'src/lib/date-helper'

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
    endpointId: RemittanceOutwardsRepository.BeneficiaryCash.qry,
    datasetId: ResourceIds.BeneficiaryCash
  })
  async function fetchGridData(options = {}) {
    return await getRequest({
      extension: RemittanceOutwardsRepository.BeneficiaryCash.qry,
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
      field: 'firstName',
      headerName: _labels.firstName,
      flex: 1
    },
    {
      field: 'fl_firstName',
      headerName: _labels.flFirstName,
      flex: 1
    },
    {
      field: 'birthDate',
      headerName: _labels.birthDate,
      flex: 1,
      valueGetter: ({ row }) => formatDateDefault(row?.birthDate)
    },
    {
      field: 'birthPlace',
      headerName: _labels.birthPlace,
      flex: 1
    },
    {
      field: 'cellPhone',
      headerName: _labels.cellPhone,
      flex: 1
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.BeneficiaryCash}
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
