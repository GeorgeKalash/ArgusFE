import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useContext, useEffect, useState } from 'react'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import SelectAgent from '@argus/shared-ui/src/components/Shared/Forms/SelectAgent'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { RemittanceBankInterface } from '@argus/repositories/src/repositories/RemittanceBankInterface'
import { useError } from '@argus/shared-providers/src/providers/error'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import CustomButton from '../../Inputs/CustomButton'

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
      field: 'moreInfo',
      headerName: '',
      flex: 0.65,
      cellRenderer: params => {
        if (params.data.interfaceId === 1)
          return (
            <CustomButton
              label={labels.select}
              disabled={!!recordId}
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
                  title: params.data?.productName
                })
              }
            />
          )
      }
    },
    {
      field: 'fees',
      headerName: labels.Fees,
      flex: 0.5,
      type: 'number'
    },
    {
      field: 'originAmount',
      headerName: labels.originAmount,
      flex: 0.8,
      type: { field: 'number', decimal: 2 }
    },
    {
      field: 'baseAmount',
      headerName: labels.BaseAmount,
      flex: 0.8,
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
    <Form
      onSave={() => {
        onProductSubmit(gridData)
        window.close()
      }}
      disabledSubmit={editMode}
      maxAccess={maxAccess}
      fullSize
    >
      <VertLayout>
        <Grow>
          <Table
            name='products'
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
      </VertLayout>
    </Form>
  )
}
ProductsWindow.width = 1200,
ProductsWindow.height = 500.
export default ProductsWindow

