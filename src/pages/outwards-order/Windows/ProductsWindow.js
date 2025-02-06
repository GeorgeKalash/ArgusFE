import Table from 'src/components/Shared/Table'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { useContext, useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { useWindow } from 'src/windows'
import SelectAgent from '../Tabs/SelectAgent'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceBankInterface } from 'src/repositories/RemittanceBankInterface'
import { useError } from 'src/error'

const ProductsWindow = ({
  labels,
  maxAccess,
  onProductSubmit,
  products,
  editMode,
  targetCurrency,
  countryRef,
  sysDefault,
  defaultAgentCode,
  fcAmount,
  lcAmount,
  productId,
  window
}) => {
  const [gridData, setGridData] = useState([])
  const { stack } = useWindow()
  const { getRequest } = useContext(RequestsContext)

  const { stack: stackError } = useError()

  const setData = async ({ productId, agentId, agentName, agentCode, payingCurrency, deliveryModeId }) => {
    const targetAmount = fcAmount || 0
    const srcAmount = lcAmount || 0

    const getRates = await getRequest({
      extension: RemittanceBankInterface.InstantCashRates.get,
      parameters: `_deliveryMode=${deliveryModeId}&_sourceCurrency=${sysDefault.currencyRef}&_targetCurrency=${targetCurrency}&_sourceAmount=${srcAmount}&_targetAmount=${targetAmount}&_originatingCountry=${sysDefault.countryRef}&_destinationCountry=${countryRef}`
    })

    const data = getRates.record

    const change = await getRequest({
      extension: RemittanceBankInterface.exchange.get,
      parameters: `_settlementCurrency=${sysDefault.currencyRef}&_receivingAgent=${agentCode}&_payoutCurrency=${targetCurrency}&_destinationCountry=${countryRef}&_lcAmount=${srcAmount}&_fcAmount=${targetAmount}`
    })

    const result = change?.record
    if (!result) {
      stackError({ message: 'This agent is not available for use.' })

      return
    }

    const updatedData = gridData?.list.map(row =>
      row.productId === productId
        ? {
            ...row,
            agentName,
            agentId,
            originAmount: result?.originalAmount,
            baseAmount: result?.baseAmount,
            fees: data?.charge,
            exRate: result.settlementRate,
            deliveryModeId: deliveryModeId,
            payingCurrency: payingCurrency,
            agentCode
          }
        : row
    )

    setGridData({ list: updatedData })
  }

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
      field: 'agentName',
      headerName: labels.Agent,
      flex: 1
    },
    {
      field: '',
      headerName: '',
      flex: 1,
      cellRenderer: params => {
        return (
          <Button
            variant='contained'
            size='small'
            style={{ height: 25 }}
            onClick={() =>
              stack({
                Component: SelectAgent,
                props: {
                  setData,
                  productId: params.data?.productId,
                  agentId: params.data?.agentId,
                  baseAmount: params.data?.baseAmount,
                  originAmount: params.data?.originAmount,
                  receivingCountry: countryRef,
                  deliveryModeId: params.data?.deliveryModeId,
                  defaultAgentCode,
                  targetCurrency: targetCurrency,
                  payingCurrency: params.data?.payingCurrency,
                  agentCode: params.data?.agentCode,
                  sysDefault,
                  labels,
                  maxAccess
                },
                width: 600,
                height: 400,
                title: labels.Agent
              })
            }
          >
            {labels.select}
          </Button>
        )
      }
    },
    {
      field: 'fees',
      headerName: labels.Fees,
      flex: 1
    },
    {
      field: 'originAmount',
      headerName: labels.originAmount,
      flex: 1,
      type: { field: 'number', decimal: 2 }
    },
    {
      field: 'baseAmount',
      headerName: labels.BaseAmount,
      flex: 1,
      type: { field: 'number', decimal: 2 }
    }
  ]

  useEffect(() => {
    ;(async function () {
      try {
        setGridData({
          list: products.map(item => ({
            ...item,
            checked: item.productId === productId ? true : false,
            originAmount: item.interfaceId !== 0 ? 0 : item.originAmount,
            baseAmount: item.interfaceId !== 0 ? 0 : item.baseAmount
          }))
        })
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
            onProductSubmit(gridData)
            window.close()
          }}
          isSaved={true}
          smallBox={true}
          disabledSubmit={editMode}
        />
      </Fixed>
    </VertLayout>
  )
}

export default ProductsWindow
