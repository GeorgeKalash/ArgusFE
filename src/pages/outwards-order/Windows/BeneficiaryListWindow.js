import Table from 'src/components/Shared/Table'
import { useContext, useEffect } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useFormik } from 'formik'

const BeneficiaryListWindow = ({ form, maxAccess, labels, onSubmit, window }) => {
  const { getRequest } = useContext(RequestsContext)

  const formik = useFormik({
    initialValues: { clientId: form.clientId, benList: [] },
    validateOnChange: true,
    onSubmit: values => {
      const checkedBeneficiary = values?.benList?.find(ben => ben?.checked)
      onSubmit({
        beneficiaryId: checkedBeneficiary?.beneficiaryId || null,
        beneficiaryName: checkedBeneficiary?.name || null,
        beneficiarySeqNo: checkedBeneficiary?.seqNo || null,
        branchCode: checkedBeneficiary?.branchCode
      })
      window.close()
    }
  })

  async function fetchGridData() {
    const res = await getRequest({
      extension: RemittanceOutwardsRepository.Beneficiary.qry3,
      parameters: `_clientId=${form.clientId}&_dispersalId=${form.dispersalType}&_countryId=${form.countryId}&_currencyId=${form.currencyId}`
    })

    res.list = res.list.map(item => {
      if (item.beneficiaryId == form.beneficiaryId) item.checked = true

      return item
    })
    formik.setFieldValue('benList', res.list ?? { list: [] })
  }

  const columns = [
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'addressLine1',
      headerName: labels.addressLine1,
      flex: 1
    },
    {
      field: 'nationalityName',
      headerName: labels.nationalityId,
      flex: 1
    },
    {
      field: 'currencyRef',
      headerName: labels.Currency,
      flex: 1
    },
    {
      field: 'countryName',
      headerName: labels.country,
      flex: 1
    },
    {
      field: 'accountReference',
      headerName: labels.accountRef,
      flex: 1
    },
    {
      field: 'branchName',
      headerName: labels.branchName,
      flex: 1
    },
    {
      field: 'dispersalTypeName',
      headerName: labels.dispersalType,
      flex: 1
    }
  ]

  useEffect(() => {
    fetchGridData()
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
        name='benTable'
        columns={columns}
        gridData={{ list: formik.values.benList }}
        rowId={['beneficiaryId']}
        rowSelection='single'
        pagination={false}
        maxAccess={maxAccess}
        showCheckboxColumn={true}
      />
    </FormShell>
  )
}

export default BeneficiaryListWindow
