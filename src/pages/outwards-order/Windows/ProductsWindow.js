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
  data: { products, targetCurrency, countryRef, sysDefault, defaultAgentCode, fcAmount, lcAmount, productId, recordId },
  window
}) => {
  const [gridData, setGridData] = useState([])
  const { stack } = useWindow()
  const { getRequest } = useContext(RequestsContext)

  const editMode = !!recordId

  const { stack: stackError } = useError()

  const setData = async ({ productId, agentName, agentCode, payingCurrency, deliveryModeId }) => {
    const targetAmount = fcAmount || 0
    const srcAmount = lcAmount || 0

    const getRates = await getRequest({
      extension: RemittanceBankInterface.InstantCashRates.get,
      parameters: `_deliveryMode=${deliveryModeId}&_sourceCurrency=${sysDefault.currencyRef}&_targetCurrency=${targetCurrency}&_sourceAmount=${srcAmount}&_targetAmount=${targetAmount}&_originatingCountry=${sysDefault.countryRef}&_destinationCountry=${countryRef}`
    })

    const change = await getRequest({
      extension: RemittanceBankInterface.exchange.get,
      parameters: `_settlementCurrency=${sysDefault.currencyRef}&_receivingAgent=${agentCode}&_payoutCurrency=${targetCurrency}&_destinationCountry=${countryRef}&_lcAmount=${srcAmount}&_fcAmount=${targetAmount}`
    })

    const result = change?.record
    if (!result) {
      stackError({ message: labels.agentIsNotAvailable })

      return
    }

    const updatedData = gridData?.list.map(row =>
      row.productId === productId
        ? {
            ...row,
            agentName: agentName || row?.agentName,
            agentCode: agentCode,
            originAmount: result?.originalAmount,
            baseAmount: result?.baseAmount,
            fees: getRates?.record?.charge,
            exRate: result.settlementRate,
            deliveryModeId: deliveryModeId,
            payingCurrency: payingCurrency
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
      flex: 0.9,
      cellRenderer: params => {
        if (params.data.interfaceId === 1)
          return (
            <Button
              variant='contained'
              size='small'
              disabled={!!recordId}
              style={{ height: 25 }}
              onClick={() =>
                stack({
                  Component: SelectAgent,
                  props: {
                    setData,
                    values: {
                      productId: params.data?.productId,
                      agentId: params.data?.agentId,
                      baseAmount: params.data?.baseAmount,
                      originAmount: params.data?.originAmount,
                      receivingCountry: countryRef,
                      deliveryModeId: params.data?.deliveryModeId,
                      defaultAgentCode,
                      targetCurrency,
                      payingCurrency: params.data?.payingCurrency,
                      agentCode: params.data?.agentCode,
                      agentDeliveryMode: params.data?.agentDeliveryMode
                    },
                    labels,
                    maxAccess
                  },
                  width: 500,
                  height: 200,
                  title: params.data?.productName
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
    },
    {
      field: 'dispersalName',
      headerName: labels.extraInfo,
      flex: 1
    }
  ]

  useEffect(() => {
    setGridData({
      list: products.map(item => ({
        ...item,
        defaultAgentCode: item.agentCode,
        defaultAgentName: item.agentName,
        payingCurrency: item.agentPayingCurrency,
        defaultPayoutCurrency: item.payingCurrency,
        checked: item.productId === productId,
        originAmount: item.originAmount,
        baseAmount: item.baseAmount
      }))
    })
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
          disable={() => {
            return !!recordId
          }}
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
