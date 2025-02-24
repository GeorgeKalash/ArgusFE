import { useContext, useState } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import SerialForm from './forms/SerialForm'
import serialIcon from '../../../public/images/TableIcons/imgSerials.png'
import lotIcon from '../../../public/images/TableIcons/lot.png'
import { Box, IconButton } from '@mui/material'
import Image from 'next/image'
import LotForm from './forms/LotForm'
import { ReportIvGenerator } from 'src/repositories/ReportIvGeneratorRepository'

const AvailabilityCrossTab = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const [columns, setColumns] = useState([])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: ReportIvGenerator.Report415,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}&_properties=`
    })

    console.log('response', response)

    let gridData

    if (response) {
      gridData = processGridData(response.record)
      const finalDisp = gridData?.length > 0 ? gridData : []
      console.log('gridData', gridData, {
        ...finalDisp,
        _startAt: _startAt
      })
    }

    return {
      count: response?.record?.recordCount || 0,

      //FIX SCROLL, TEST PARAMS, TEST FORMS, IMPLEMENT PROP
      list: response?.record?.recordCount ? gridData : [],
      _startAt: _startAt
    }
  }

  const processGridData = responseData => {
    console.log('responseData', responseData)
    const { availabilities, usedSites } = responseData
    usedSites.sort()

    //setUsedSites(sites)

    buildColumns(usedSites)

    let addedSKUs = new Set()
    let processedData = []

    availabilities.forEach(availability => {
      if (addedSKUs.has(availability.sku)) return
      addedSKUs.add(availability.sku)

      let row = {
        sku: availability.sku,
        itemName: availability.itemName,
        itemId: availability.itemId,
        categoryId: availability.lotCategoryId,
        trackBy: availability.trackBy
      }

      let sum = 0
      usedSites.forEach(site => {
        const currentAVA = availabilities.find(item => item.sku === availability.sku && item.siteName === site)
        row[site] = currentAVA ? currentAVA.qty : 0
        sum += row[site]
      })

      row['total'] = sum
      processedData.push(row)
    })

    return processedData

    //setPagination(prev => ({ ...prev, total: recordCount }))
  }

  const buildColumns = usedSites => {
    let dynamicColumns = [
      {
        field: 'sku',
        headerName: labels.sku,
        flex: 2
      },
      {
        field: 'itemName',
        headerName: labels.itemName,
        flex: 2
      },
      {
        field: 'total',
        headerName: labels.total,
        align: 'right',
        flex: 1
      }
    ]

    usedSites.forEach(site => {
      dynamicColumns.push({
        field: site,
        headerName: site,

        //width: usedSites.length <= 8 ? null : 100,
        flex: 1,
        align: 'right'
      })
    })

    dynamicColumns.push({
      field: 'trackBy',
      headerName: 'S/L',
      flex: 1,

      //align: 'right',
      cellRenderer: row => {
        const { trackBy } = row.data

        if (trackBy === 1 || trackBy === 2) {
          return (
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
              <IconButton size='small' onClick={() => (trackBy === 1 ? onSerial(row.data) : onLot(row.data))}>
                <Image
                  src={trackBy === 1 ? serialIcon : lotIcon}
                  width={trackBy === 1 ? 25 : 18}
                  height={18}
                  alt={trackBy === 1 ? labels.serial : labels.lot}
                />
              </IconButton>
            </Box>
          )
        }

        return null
      }
    })

    setColumns(dynamicColumns)
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access,
    filterBy
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ReportIvGenerator.Report415,
    datasetId: ResourceIds.AvailabilitiesCrossTab,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const onSerial = obj => {
    openSerialForm(obj.itemId)
  }

  const onLot = obj => {
    openLotForm(obj.lotCategoryId, obj.itemId, obj.siteId)
  }

  function openSerialForm(itemId) {
    stack({
      Component: SerialForm,
      props: {
        labels,
        itemId
      },
      width: 600,
      height: 400,
      title: labels.serialNo
    })
  }

  function openLotForm(lotId, itemId, siteId) {
    stack({
      Component: LotForm,
      props: {
        labels,
        lotId,
        itemId,
        siteId,
        maxAccess: access
      },
      width: 1150,
      height: 450,
      title: labels.lotAva
    })
  }

  const onApply = ({ rpbParams }) => {
    filterBy('params', rpbParams)
    refetch()
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} maxAccess={access} onApply={onApply} reportName={'IV415'} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['itemId']}
          maxAccess={access}
          refetch={refetch}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default AvailabilityCrossTab
