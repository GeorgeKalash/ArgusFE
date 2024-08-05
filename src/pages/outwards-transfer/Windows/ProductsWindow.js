import Table from 'src/components/Shared/Table'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { useContext, useEffect, useState } from 'react'
import { RemittanceBankInterface } from 'src/repositories/RemittanceBankInterface'
import { RequestsContext } from 'src/providers/RequestsContext'

const ProductsWindow = ({ labels, maxAccess, onProductSubmit, products, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const [gridData, setGridData] = useState([])
  const [iCRates, setICRates] = useState([])

  const columns = [
    {
      field: 'productName',
      headerName: labels.ProductName,
      flex: 1
    },
    {
      field: 'corName',
      headerName: labels.Correspondant,
      flex: 1
    },
    {
      field: 'fees',
      headerName: labels.Fees,
      flex: 1
    },
    {
      field: 'originAmount',
      headerName: labels.originAmount,
      flex: 1
    },
    {
      field: 'baseAmount',
      headerName: labels.BaseAmount,
      flex: 1
    }
  ]

  async function getICRates() {
    try {
      const res = await getRequest({
        extension: RemittanceBankInterface.InstantCashRates.qry,
        parameters: `_deliveryMode=7&_sourceCurrency=AED&_targetCurrency=PKR&_sourceAmount=5000&_originatingCountry=AE&_destinationCountry=PK`
      })
      setICRates(res.list)
    } catch (error) {}
  }

  function mergeICRates() {
    console.log('updatedData ', gridData)

    //const updatedData = gridData.list.map(item => {
    // if (item.interface === 1) {
    //   for (const rate of iCRates) {
    //     if (item.originAmount >= rate.amountRangeFrom && item.originAmount <= rate.amountRangeTo) {
    //       return { ...item, fees: rate.charge }
    //     }
    //   }
    //   return item
    // }
    //})

    //setGridData(updatedData)

    return gridData
  }

  const mergedData = mergeICRates()

  useEffect(() => {
    ;(async function () {
      try {
        setGridData({ list: products })
        await getICRates()
      } catch (error) {}
    })()
  }, [])

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={mergedData}
          rowId={['productId']}
          rowSelection='single'
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          showCheckboxColumn={true}
          ChangeCheckedRow={setGridData}
        />
      </Grow>
      <Fixed>
        <WindowToolbar
          onSave={() => {
            onProductSubmit(mergedData)
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
