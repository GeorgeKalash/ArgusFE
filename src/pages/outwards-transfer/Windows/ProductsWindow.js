import Table from 'src/components/Shared/Table'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { useContext, useEffect, useState } from 'react'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useForm } from 'src/hooks/form'

const ProductsWindow = ({ labels, maxAccess, onProductSubmit, outWardsData, window }) => {
  const [gridData, setGridData] = useState([])
  const { getRequest } = useContext(RequestsContext)

  const columns = [
    {
      field: 'productRef',
      headerName: labels.ProductRef,
      flex: 1
    },
    {
      field: 'productName',
      headerName: labels.ProductName,
      flex: 1
    },
    {
      field: 'corName',
      headerName: labels.corName,
      flex: 1
    },
    {
      field: 'interfaceName',
      headerName: labels.interface,
      flex: 1
    },
    {
      field: 'dispersalRef',
      headerName: labels.DispersalRef,
      flex: 1
    },
    {
      field: 'fees',
      headerName: labels.Fees,
      flex: 1
    },
    {
      field: 'baseAmount',
      headerName: labels.BaseAmount,
      flex: 1
    }
  ]

  useEffect(() => {
    ;(async function () {
      var type = 2
      var functionId = 1
      var plant = outWardsData?.plantId
      var countryId = outWardsData?.countryId
      var currencyId = outWardsData?.currencyId
      var dispersalType = outWardsData?.dispersalType
      var amount = outWardsData?.fcAmount ?? 0
      var parameters = `_type=${type}&_functionId=${functionId}&_plantId=${plant}&_countryId=${countryId}&_dispersalType=${dispersalType}&_currencyId=${currencyId}&_amount=${amount}&_agentId=8`

      try {
        if (plant && countryId && currencyId && dispersalType) {
          const res = await getRequest({
            extension: RemittanceOutwardsRepository.ProductDispersalEngine.qry,
            parameters: parameters
          })
          if (res.list.length > 0) {
            const updatedList = res.list.map(product => {
              if (product.productId === outWardsData.productId) {
                return { ...product, checked: true }
              }

              return product
            })
            setGridData({ list: updatedList })
          }
        }
      } catch (error) {}
    })()
  }, [])

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['productId']}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          showCheckboxColumn={true}
        />
      </Grow>
      <Fixed>
        <WindowToolbar
          onSave={() => {
            onProductSubmit(gridData)
            window.close()
          }}
          isSaved={true}
          smallBox={true}
        />
      </Fixed>
    </VertLayout>
  )
}

export default ProductsWindow
