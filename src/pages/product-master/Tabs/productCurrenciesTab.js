import { Box, Checkbox, Grid } from '@mui/material'
import { useState } from 'react'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomInlineDataGrid from 'src/components/Shared/InlineDataGrid'
import { filterCountries, monetaryGetUpdatedRowFunction, transformRowsForEditableGrid } from 'src/components/helpers/inlineEditGridHelper'

const PoductCurrenciesTab = ({ productCurrenciesGridData, maxAccess }) => {
  const [inlineGridDataRows, setInlineGridDataRows] = useState([])


  const columns = [
    {
      field: 'country',
      headerName: 'Country',
      flex: 1
    },
    {
      field: 'currency',
      headerName: 'Currency',
      flex: 1
    },
    {
      field: 'dispersalType',
      headerName: 'Dispersal Type',
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: 'Is Inactive',
      flex: 1,
      renderCell: params => (
        <Checkbox
          color='primary'
          checked={params.row.isInactive === true}
          onChange={() => {
            params.row.isInactive = !params.row.isInactive
          }}
        />
      )
    }
  ]

  const countries = [
    { isInactive: false, reference: '1', name: 'Lebanon', recordId: '1' },
    { isInactive: false, reference: '2', name: 'Abidjan', recordId: '2' },
    { isInactive: false, reference: '3', name: 'Egypt', recordId: '3' },
    { isInactive: false, reference: '5', name: 'United Arab Emirates', recordId: '5' },
    { isInactive: true, reference: '6', name: 'Tunisia', recordId: '6' },
    { isInactive: true, reference: '7', name: 'Saudi Arabia ', recordId: '7' },
    { isInactive: true, reference: '8', name: 'Syria', recordId: '8' },
    { isInactive: true, reference: '9', name: 'thailand', recordId: '14' }
  ]

  const dispersalTypeStore = [
    { recordId: 1, value: 'bank' },
    { recordId: 2, value: 'cash' },
    { recordId: 3, value: 'wallet' },
    { recordId: 4, value: 'delivery' }
  ]

  const currenciesStore = [
    { recordId: 1, value: 'USD' },
    { recordId: 2, value: 'LBP' },
    { recordId: 3, value: 'YEN' },
    { recordId: 4, value: 'POUND' }
  ]
  const filteredCountries = filterCountries(countries)

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Grid container gap={2}>
          <Grid container xs={12} spacing={2}>
            <Grid item xs={6}>
              <CustomTextField label='Reference' value={''} readOnly={true} />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField label='Name' value={''} readOnly={true} />
            </Grid>
          </Grid>
          <Grid xs={12}>
            {/* <Table
              columns={columns}
              gridData={productCurrenciesGridData}
              rowId={['recordId']}
              isLoading={false}
              pagination={false}
              height={220}
              maxAccess={maxAccess}
            /> */}
            {/* <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', }}>
              <InlineEditGrid columns={columns}/>
            </Box> */}
            <Box sx={{ width: '100%', height: '100%' }}>
              <CustomInlineDataGrid
                dataRows={transformRowsForEditableGrid(inlineGridDataRows)}
                setDataRows={setInlineGridDataRows}
                getUpdatedRowFunction={row => monetaryGetUpdatedRowFunction(row)}
                columns={[
                  {
                    field: 'country',
                    headerName: 'country',
                    width: 150,
                    editable: true,
                    type: 'singleSelect',
                    valueOptions: filteredCountries,
                    getOptionValue: value => value.recordId,
                    getOptionLabel: value => value.name,
                    preProcessEditCellProps: params => {
                      const hasError = params.props.value ? false : true

                      return { ...params.props, error: hasError }
                    }
                  },
                  {
                    field: 'currency',
                    headerName: 'currency',
                    width: 150,
                    editable: true,
                    type: 'singleSelect',
                    valueOptions: currenciesStore,
                    getOptionValue: value => value.recordId,
                    getOptionLabel: value => value.value,
                    preProcessEditCellProps: params => {
                      const hasError = params.props.value ? false : true

                      return { ...params.props, error: hasError }
                    }
                  },
                  {
                    field: 'dispersalType',
                    headerName: 'dispersalType',
                    width: 150,
                    editable: true,
                    type: 'singleSelect',
                    valueOptions: dispersalTypeStore,
                    getOptionValue: value => value.recordId,
                    getOptionLabel: value => value.value
                  },
                  {
                    field: 'isInactive',
                    headerName: 'Is Inactive?',
                    type: 'boolean',
                    width: 140,
                    editable: true
                  }
                ]}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default PoductCurrenciesTab
