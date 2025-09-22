import Table from 'src/components/Shared/Table'
import { useContext, useEffect } from 'react'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useFormik } from 'formik'
import Form from 'src/components/Shared/Form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from '@mui/material'

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
      parameters: `_clientId=${form.clientId}&_dispersalId=${form.dispersalType}&_countryId=${form.countryId}`
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
      flex: 1,
      headerName: labels.addressLine1
    },
    {
      field: 'nationalityName',
      flex: 1,
      headerName: labels.nationalityId
    },
    {
      field: 'countryName',
      flex: 1,
      headerName: labels.country
    },
    {
      field: 'accountReference',
      flex: 1,
      headerName: labels.accountRef
    },
    {
      field: 'branchName',
      flex: 1,
      headerName: labels.branchName
    },
    {
      field: 'dispersalTypeName',
      flex: 1,
      headerName: labels.dispersalType
    }
  ]

  useEffect(() => {
    fetchGridData()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} fullSize>
      <VertLayout>
        <Grow>
          <Table
            columns={columns}
            gridData={{ list: formik.values.benList }}
            rowId={['beneficiaryId']}
            rowSelection='single'
            isLoading={false}
            pagination={false}
            maxAccess={maxAccess}
            showCheckboxColumn={true}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default BeneficiaryListWindow
