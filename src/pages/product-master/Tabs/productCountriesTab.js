import { Grid, Box, Checkbox } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import { useState } from 'react'

const ProductCountriesTab = ({ productCountriesGridData, maxAccess }) => {
  // const columns = [
  //   {
  //     field: 'countryRef',
  //     headerName: 'Country Ref',
  //     flex: 1
  //   },
  //   {
  //     field: 'countryName',
  //     headerName: 'Country Name',
  //     flex: 1
  //   },
  //   {
  //     field: 'isInactive',
  //     headerName: 'Is Inactive',
  //     flex: 1,
  //     renderCell: params => (
  //       <Checkbox
  //         color='primary'
  //         checked={params.row.isInactive === true}
  //         onChange={() => {
  //           params.row.isInactive = !params.row.isInactive
  //         }}
  //       />
  //     )
  //   }
  // ]

  // //stores
  // const [countriesData, setCountriesData] = useState([])

  // const getCountriesData = () => {
  //   var parameters = '_filter='
  //   getRequest({
  //     extension: SystemRepository.Country.qry,
  //     parameters: parameters
  //   })
  //     .then(res => {
  //       setCountriesData(res)
  //       console.log(res)
  //     })
  //     .catch(error => {
  //       setErrorMessage(error)
  //     })
  // }

  // useEffect(() => {
  //   getCountriesData()
  // }, [])

  const columns = [
    {
      key: 1,
      header: 'country Ref',
      name: 'countryRef',
      value: '',
      fieldStore: productCountriesGridData.list,
      selectedOptionDisplayProperties: ['countryRef'],
      listOptionDisplayProperties: ['countryRef', 'countryName'],
      valueProperty: 'recordId'
    },
    {
      key: 1,
      header: 'country Name',
      name: 'countryName',
      value: '',
      fieldStore: productCountriesGridData.list,
      selectedOptionDisplayProperties: ['countryName'],
      listOptionDisplayProperties: ['countryName', 'countryRef'],
      valueProperty: 'recordId',
      isReadOnly: 'true',
      hasDefaultValue: 'true'
    },
    { key: 2, header: 'Is inactive', name: 'isInactive', value: null }
  ]
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
          <Grid xs={12} sx={{ display: 'flex', flex: 1 }}>
            {/* <Table
              columns={columns}
              gridData={productCountriesGridData}
              rowId={['recordId']}
              isLoading={false}
              pagination={false}
              height={220}
              maxAccess={maxAccess} 
            /> */}
            <Box sx={{ flex: 1, justifyContent: 'stretch' }}>
              <InlineEditGrid columns={columns} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default ProductCountriesTab
