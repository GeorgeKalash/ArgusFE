import { useContext, useEffect, useRef, useState } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { BrokerageTradingRepository } from '@argus/repositories/src/repositories/BrokerageTradingRepository'
import { MultiCurrencyRepository } from '@argus/repositories/src/repositories/MultiCurrencyRepository'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import EventOrderForm from '@argus/shared-ui/src/components/Shared/Forms/EventOrderForm'
import GoldPriceTicker from '@argus/shared-ui/src/components/Shared/GoldPriceTicker'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const EventOrderInquiry = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { systemDefaults } = useContext(DefaultsContext)
  const { stack } = useWindow()
  const [currencyRef, setCurrencyRef] = useState(null)
  const dataRef = useRef(null)
  const checkingRef = useRef(false)

  const bt_reporting_currencyId =
    systemDefaults?.list?.find(obj => obj.key === 'bt_reporting_currencyId')?.value || null

  useEffect(() => {
  if (!bt_reporting_currencyId) return

  ;(async () => {
    const res = await getRequest({
      extension: SystemRepository.Currency.get,
      parameters: `_recordId=${bt_reporting_currencyId}`
    })

    setCurrencyRef(res?.record?.isoCode || null)
  })()
}, [bt_reporting_currencyId])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: BrokerageTradingRepository.EventOrderInquiry.page2,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    filterBy,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: BrokerageTradingRepository.EventOrderInquiry.page2,
    datasetId: ResourceIds.EventOrderInquiry,
    filter: {
      filterFn: fetchWithFilter
    }
  })


  dataRef.current = data

  const pricesRef = useRef(null)

  const handlePrices = (body, prices) => {
    pricesRef.current = { body, gold24k: prices?.gold24k }
  }

  const isHit = (row, pricePerGram) => {
    if (row?.isTriggered) return false

    if (Number(row?.currencyId) !== Number(bt_reporting_currencyId)) return false

    const muQty = row?.eo_defTargetPriceMUQty
    if (!muQty) return false
    const targetPerGram = row.targetPrice / muQty

    if (row?.direction === 1) return pricePerGram < targetPerGram
    if (row?.direction === 2) return pricePerGram > targetPerGram

    return false
  }

  const checkRows = async rows => {
    if (checkingRef.current) return

    const latest = pricesRef.current
    if (latest?.gold24k == null) return

    const hasHit = rows.some(row => isHit(row, latest.gold24k))
    if (!hasHit) return

    checkingRef.current = true
    try {
      await postRequest({
        extension: MultiCurrencyRepository.ExchangeRates.current,
        record: JSON.stringify(latest.body)
      })

      await serviceEO()
      await refetch()
    } finally {
      checkingRef.current = false
    }
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      if (checkingRef.current) return

      const result = await refetch()
      await checkRows(result?.data?.list ?? dataRef.current?.list ?? [])
    }, 5000)

    return () => clearInterval(interval)
  }, [refetch, bt_reporting_currencyId])

  const serviceEO = async () => {
    await postRequest({
      extension: BrokerageTradingRepository.EventOrder.service,
      record: JSON.stringify({})
    })
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'expiryDate',
      headerName: labels.expiryDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'accountRef',
      headerName: labels.accountRef,
      flex: 1
    },
    {
      field: 'accountName',
      headerName: labels.accountName,
      flex: 1
    },
    {
      field: 'directionName',
      headerName: labels.directionName,
      flex: 1
    },
    {
      field: 'metalRef',
      headerName: labels.metalRef,
      flex: 1
    },
    {
      field: 'currencyRef',
      headerName: labels.currencyRef,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'qty_muRef',
      headerName: labels.qty_muRef,
      flex: 1
    },
    {
      field: 'targetPrice',
      headerName: labels.targetPrice,
      flex: 1,
      type: 'number'
    },
    {
      field: 'amount',
      headerName: labels.amount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'isTriggered',
      headerName: labels.isTriggered,
      flex: 1,
      type: 'checkbox'
    },
    {
      field: 'triggeredAt',
      headerName: labels.triggeredAt,
      flex: 1,
      type: 'dateTime'
    },
    {
      field: 'triggeredAtPrice',
      headerName: labels.triggeredAtPrice,
      flex: 1,
      type: 'number'
    },
    {
      field: 'rsName',
      headerName: labels.rsName,
      flex: 1
    }
  ]

  const edit = obj => {
    stack({
      Component: EventOrderForm,
      props: {
        recordId : obj?.recordId
      }
    })
  }

  return (
    <VertLayout>
      <Fixed>
        {currencyRef && (
          <GoldPriceTicker
            currency={currencyRef}
            onPrices={handlePrices}
            style={{ marginLeft: 16, marginBottom: 16 }}
          />
        )}
        <RPBGridToolbar 
          hasSearch={false} 
          labels={labels} 
          maxAccess={access}
          reportName={'BTEOI'} 
          filterBy={filterBy} 
        />
      </Fixed>
      <Grow>
        <Table
          name='InquiryTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          pageSize={50}
          onEdit={edit}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
          highlightRow={{
            condition: row => row?.direction === 1 || row?.direction === 2,
            color: row => {
              if (row?.isTriggered) return '#f9f763'
              if (row?.direction === 1) return '#78d580'
              if (row?.direction === 2) return '#f28b82'
              return 'transparent'
            }
          }}
        />
      </Grow>
    </VertLayout>
  )
}

export default EventOrderInquiry
