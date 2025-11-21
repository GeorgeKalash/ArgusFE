import { useContext, useEffect, useState } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import serialIcon from '@argus/shared-ui/src/components/images/TableIcons/imgSerials.png'
import lotIcon from '@argus/shared-ui/src/components/images/TableIcons/lot.png'
import { Box, Grid, IconButton } from '@mui/material'
import Image from 'next/image'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import SerialTable from './SerialTable'
import LotForm from './LotForm'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

const AvailabilityList = ({ obj, labels, access }) => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const [data, setData] = useState([])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.Availability.qry,
      parameters: `_itemId=${obj.itemId}&_siteId=${0}&_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    const filteredData = response?.list?.filter(item => item.siteRef && item.siteName)

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
      field: 'onhand',
      headerName: labels.onHand,
      flex: 1,
      type: 'number'
    },

    {
      field: 'S/L',
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
    openSerialForm(obj)
  }

  const onLot = obj => {
    openLotForm(obj)
  }

  function openSerialForm(obj) {
    stack({
      Component: SerialTable,
      props: {
        labels,
        obj,
        access
      },
      width: 600,
      height: 400,
      title: labels.serialNo
    })
  }

  function openLotForm(obj) {
    stack({
      Component: LotForm,
      props: {
        labels,
        obj,
        access
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
            <CustomTextField label={labels.sku} value={obj.sku} readOnly />
          </Grid>
          <Grid item xs={7}>
            <CustomTextField label={labels.name} value={obj.name} readOnly />
          </Grid>
          <Grid item xs={7}>
            <CustomNumberField label={labels.onHand} value={obj.qty} readOnly />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          name='availabilityList'
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
