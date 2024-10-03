import Table from 'src/components/Shared/Table'
import { useContext, useEffect, useState } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useFormik } from 'formik'

const BeneficiaryListWindow = ({ form, maxAccess, labels, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const [data, setData] = useState([])

  const formik = useFormik({
    initialValues: { clientId: form.values.clientId },
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: () => {
      const checkedBeneficiary = data.list.find(ben => ben.checked)

      form.setValues({
        ...form.values,
        beneficiaryId: checkedBeneficiary?.beneficiaryId || null,
        beneficiaryName: checkedBeneficiary?.name || null,
        beneficiarySeqNo: checkedBeneficiary?.seqNo || null
      })

      window.close()
    }
  })

  async function fetchGridData() {
    const res = await getRequest({
      extension: RemittanceOutwardsRepository.Beneficiary.qry3,
      parameters: `_clientId=${form.values.clientId}&_dispersalId=${form.values.dispersalType}&_countryId=${form.values.countryId}`
    })

    res.list = res.list.map(item => {
      if (item.beneficiaryId == form.values.beneficiaryId) item.checked = true

      return item
    })

    setData(res ?? { list: [] })
  }

  const columns = [
    {
      field: 'name',
      headerName: labels.name
    },
    {
      field: 'addressLine1',
      headerName: labels.addressLine1
    },
    {
      field: 'nationalityName',
      headerName: labels.nationalityId
    },
    {
      field: 'countryName',
      headerName: labels.country
    },
    {
      field: 'accountReference',
      headerName: labels.accountRef
    },
    {
      field: 'branchName',
      headerName: labels.branchName
    },
    {
      field: 'dispersalTypeName',
      headerName: labels.dispersalType
    }
  ]

  useEffect(() => {
    ;(async function () {
      try {
        await fetchGridData()
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.Beneficiary}
      height={480}
      form={formik}
      maxAccess={maxAccess}
      isInfo={false}
      isCleared={false}
    >
      <Table
        columns={columns}
        gridData={data}
        setData={setData}
        rowId={['beneficiaryId']}
        rowSelection='single'
        isLoading={false}
        pagination={false}
        maxAccess={maxAccess}
        showCheckboxColumn={true}
      />
    </FormShell>
  )
}

export default BeneficiaryListWindow
