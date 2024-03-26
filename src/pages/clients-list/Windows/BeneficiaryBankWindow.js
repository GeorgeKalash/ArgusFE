// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import Table from 'src/components/Shared/Table'
import { useEffect, useState } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'

const ProductsWindow = ({}) => {
  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,

    //endpointId: RemittanceOutwardsRepository,
    datasetId: ResourceIds.OutwardsTransfer
  })
  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter`
    })
  }

  const columns = [
    {
      field: 'productRef',
      headerName: _labels.ProductRef,
      flex: 1
    },
    {
      field: 'productName',
      headerName: _labels.ProductName,
      flex: 1
    },
    {
      field: 'dispersalRef',
      headerName: _labels.DispersalRef,
      flex: 1
    },
    {
      field: 'fees',
      headerName: _labels.Fees,
      flex: 1
    },
    {
      field: 'baseAmount',
      headerName: _labels.BaseAmount,
      flex: 1
    }
  ]

  return (
    <FormShell resourceId={ResourceIds.OutwardsTransfer} form={form} height={480} maxAccess={maxAccess}>
      <Table
        width={width}
        height={height}
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

export default ProductsWindow
