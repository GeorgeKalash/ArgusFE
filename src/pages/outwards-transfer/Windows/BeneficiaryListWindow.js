import Table from 'src/components/Shared/Table'
import { useContext, useEffect, useState } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { useFormik } from 'formik'

const BeneficiaryListWindow = ({ form, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const [data, setData] = useState([])

  const formik = useFormik({
    initialValues: { clientId: form.values.clientId },
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: () => {
      const checkedBeneficiary = data.list.find(ben => ben.checked)

      console.log('enter submit ', checkedBeneficiary)
      if (checkedBeneficiary) {
        form.setValues({
          ...form.values,
          beneficiaryId: checkedBeneficiary.beneficiaryId,
          beneficiaryName: checkedBeneficiary.name
        })
        window.close()
      }
    }
  })

  const { labels: _labels, access } = useResourceQuery({
    endpointId: RemittanceOutwardsRepository.Beneficiary.qry,
    datasetId: ResourceIds.Beneficiary
  })

  async function fetchGridData() {
    const res = await getRequest({
      extension: RemittanceOutwardsRepository.Beneficiary.qry,
      parameters: `_clientId=${form.values.clientId}`
    })

    res.list = res.list.map(item => {
      if (item.isInactive === null) {
        item.isInactive = false
      }

      return item
    })

    res.list = res.list.filter(
      item => item.dispersal === formik.values.dispersal && item.countryId === formik.values.countryId
    )

    setData(res ?? { list: [] })
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
      flex: 1
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
      maxAccess={access}
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
        maxAccess={access}
        showCheckboxColumn={true}
      />
    </FormShell>
  )
}

export default BeneficiaryListWindow
