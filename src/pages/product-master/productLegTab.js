// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import Window from 'src/components/Shared/Window'

//** Helpers
import { getFormattedNumber, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'

const productLegTab = () => {
  //states
  const [windowOpen, setWindowOpen] = useState(false)

  //stores
  const [gridData, setGridData] = useState([])
  const [commissionGridData, setCommissionGridData] = useState([])

  const columns = [
    {
      field: 'fromAmount',
      headerName: 'From Amount',
      flex: 1
      // align: 'right',
      // valueGetter: ({ row }) => getFormattedNumber(row?.fromAmount, 2)
    },
    {
      field: 'toAmount',
      headerName: 'To Amount',
      flex: 1
      // align: 'right',
      // valueGetter: ({ row }) => getFormattedNumber(row?.toAmount, 2)
    }
  ]

  const commissionColumns = [
    {
      field: 'checkBox',
      headerName: '',
      flex: 0.5,
      renderCell: params => (
        <Checkbox
          color='primary'
          checked={params.row.checkBox === true}
          onChange={() => {
            params.row.checkBox = !params.row.checkBox
          }}
        />
      )
    },
    {
      field: 'commissionName',
      headerName: 'Commission Name',
      flex: 1
    },
    {
      field: 'commission',
      headerName: 'Commission',
      flex: 1
    }
  ]

  const getGridData = ({}) => {
    const newData = { list: [{ recordId: 1, fromAmount: 1000.66, toAmount: 2000.97 }] }
    setGridData({ ...newData })
  }

  const editProductCommission = obj => {
    fillCommissionStore()
    setWindowOpen(true)
  }

  const fillCommissionStore = () => {
    const newData = {
      list: [
        { commissionId: 1, commissionName: 'PCT', commission: 50 },
        { commissionId: 2, commissionName: 'fixed', commission: 100 },
        { commissionId: 3, commissionName: 'fixed (other charges)', commission: 150 }
      ]
    }
    setCommissionGridData({ ...newData })
  }

  useEffect(() => {
    setWindowOpen(false)
    getGridData({})
  }, [])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Grid container>
          {/* First Column */}
          <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
              <CustomTextField label='Reference' value={'reference 1'} readOnly={true} />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox name='plantName' label='Plant' readOnly={false} required />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox name='dispursal' label='Dispursal' readOnly={false} required />
            </Grid>
          </Grid>
          {/* Second Column */}
          <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
              <CustomTextField label='Name' value={'name 1'} readOnly={true} />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox name='currencyName' label='Currency' required />
            </Grid>
          </Grid>
        </Grid>
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editProductCommission}
          isLoading={false}
          pagination={false}
        />
      </Box>

      {windowOpen && (
        <Window
          id='ProductCommissionsWindow'
          Title='Product Commission'
          onClose={() => setWindowOpen(false)}
          width={500}
          height={400}
        >
          <CustomTabPanel index={0} value={0}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <Grid container>
                {/* First Column */}
                <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
                  <Grid item xs={12}>
                    <CustomTextField label='Reference' value={'reference 1'} readOnly={true} />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomComboBox name='plantName' label='Plant' readOnly={true} required />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomComboBox name='dispursal' label='Dispursal' readOnly={true} required />
                  </Grid>
                </Grid>
                {/* Second Column */}
                <Grid ccontainer rowGap={2} xs={6} sx={{ px: 2 }}>
                  <Grid item xs={12}>
                    <CustomTextField label='Name' value={'name 1'} readOnly={true} />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomComboBox name='currencyName' label='Currency' required />
                  </Grid>
                </Grid>
              </Grid>
              <Table
                columns={commissionColumns}
                gridData={commissionGridData}
                rowId={['commissionId']}
                api={getGridData}
                isLoading={false}
                pagination={false}
              />
            </Box>
          </CustomTabPanel>
        </Window>
      )}
    </>
  )
}

export default productLegTab
