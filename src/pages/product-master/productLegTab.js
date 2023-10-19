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

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'

const productLegTab = () => {
  //states
  const [windowOpen, setWindowOpen] = useState(false)
  //stores
  const [gridData, setGridData] = useState([])

  const columns = [
    {
      field: 'fromAmount',
      headerName: 'From Amount',
      flex: 1
    },
    {
      field: 'toAmount',
      headerName: 'To Amount',
      flex: 1
    }
  ]
  const commissionColumns = [
    {
      field: 'commission',
      headerName: 'Commission',
      flex: 1
    }
  ]

  const tabs = [{ label: 'Product Commission' }]

  const getGridData = ({}) => {
    const newData = { list: [{ recordId: 1, fromAmount: 1000, toAmount: 2000 }] }
    setGridData({ ...newData })
  }

  const editProductCommission = obj => {
    fillCommissionStore()
    setWindowOpen(true)
  }

  const fillCommissionStore = () => {
    const newData = {
      list: [
        { recordId: 1, commission: 50 },
        { recordId: 2, commission: 100 },
        { recordId: 3, commission: 150 }
      ]
    }
    setGridData({ ...newData })
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
        <div style={{ display: 'flex' }}>
          {/* First Column */}

          <Grid container spacing={4}>
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
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField label='Name' value={'name 1'} readOnly={true} />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox name='currencyName' label='Currency' required />
            </Grid>
            <Grid item xs={12}></Grid>
            <Grid item xs={12}></Grid>
            <Grid item xs={12}></Grid>
            <Grid item xs={12}></Grid>
          </Grid>
        </div>
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editProductCommission}
          isLoading={false}
        />
      </Box>

      {windowOpen && (
        <Window
          id='ProductCommissionsWindow'
          Title='Product Commission'
          onClose={() => setWindowOpen(false)}
          tabs={tabs}
          activeTab={0}
          setActiveTab={0}
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
              <div style={{ display: 'flex' }}>
                {/* First Column */}

                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <CustomTextField label='Reference' value={'reference 1'} readOnly={true} />
                  </Grid>
                </Grid>
                {/* Second Column */}
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <CustomTextField label='Name' value={'name 1'} readOnly={true} />
                  </Grid>
                </Grid>
              </div>
              <Table
                columns={commissionColumns}
                gridData={gridData}
                rowId={['recordId']}
                api={getGridData}
                isLoading={false}
              />
            </Box>
          </CustomTabPanel>
        </Window>
      )}
    </>
  )
}

export default productLegTab
