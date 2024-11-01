import { useContext, useEffect, useState } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { useWindow } from 'src/windows'
import serialIcon from 'public/images/TableIcons/imgSerials.png'
import lotIcon from 'public/images/TableIcons/lot.png'
import { Box, Grid, IconButton } from '@mui/material'
import Image from 'next/image'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import SerialForm from './SerialForm'
import LotForm from './LotForm'

const AvailabilityList = ({ itemId, sku, name, qty, labels, access }) => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const [data, setData] = useState([])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.Availability.qry,
      parameters: `_itemId=${itemId}&_siteId=${0}&_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    const filteredData = response.list.filter(item => item.siteRef && item.siteName)

    setData({ ...response, list: filteredData })

    return { ...response, _startAt: _startAt }
  }
  useEffect(() => {
    fetchGridData()
  }, [])

  const columns = [
    {
      field: 'siteRef',
      headerName: labels.siteRef,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: labels.siteName,
      flex: 1
    },

    {
      flex: 0.5,
      headerName: 'S/L',
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
    }
  ]

  const onSerial = obj => {
    openSerialForm(obj.itemId, obj.siteId)
  }

  const onLot = obj => {
    openLotForm(obj.lotCategoryId, obj.itemId, obj.siteId)
  }

  function openSerialForm(itemId, siteId) {
    stack({
      Component: SerialForm,
      props: {
        labels,
        itemId,
        siteId
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

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={1.5} m={1}>
          <Grid item xs={7}>
            <CustomTextField label={labels.sku} value={sku} />
          </Grid>
          <Grid item xs={7}>
            <CustomTextField label={labels.name} value={name} />
          </Grid>
          <Grid item xs={7}>
            <CustomTextField label={labels.onHand} value={qty} />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['siteRef']}
          maxAccess={access}
          pageSize={50}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default AvailabilityList
