import { Box, Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

// import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import CustomInlineDataGrid from 'src/components/Shared/InlineDataGrid'
import { countriesGetUpdatedRowFunction, getValueForCountryName } from 'src/components/helpers/inlineEditGridHelper'

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
      valueProperty: 'recordId',
      populatedBy: ''
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
      hasDefaultValue: 'true',
      populatedBy: 'countryRef'
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
            {/* <Box sx={{ flex: 1, justifyContent: 'stretch' }}>
              <InlineEditGrid columns={columns} />
            </Box> */}
            <Box sx={{ width: '100%', height: '100%' }}>
              <CustomInlineDataGrid
                dataRows={[]}
                getUpdatedRowFunction={row => countriesGetUpdatedRowFunction(row, productCountriesGridData.list)}
                columns={[
                  {
                    field: 'countryRef',
                    headerName: 'countryRef',
                    width: 150,
                    editable: true,
                    type: 'singleSelect',
                    valueOptions: productCountriesGridData.list,
                    getOptionValue: value => value.countryRef,
                    getOptionLabel: value => value.countryRef + '-' + value.countryName,
                    valueFormatter: params => {
                      const { id, value, field } = params

                      return value
                    },
                    preProcessEditCellProps: params => {
                      const hasError = params.props.value ? false : true

                      return { ...params.props, error: hasError }
                    }
                  },
                  {
                    field: 'countryName',
                    headerName: 'countryName',
                    width: 150,
                    type: 'string',
                    editable: true,
                    valueGetter: params => getValueForCountryName(params, productCountriesGridData.list)
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

export default ProductCountriesTab
