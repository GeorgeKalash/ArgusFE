import { Autocomplete, Box, Button, Grid, MenuItem, Select, TextField, useMediaQuery, useTheme } from '@mui/material'
import { useGridApiContext } from '@mui/x-data-grid'
import { createContext, forwardRef, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

// import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import CustomInlineDataGrid from 'src/components/Shared/InlineDataGrid'
import { transformRowsForEditableGrid } from 'src/components/helpers/inlineEditGridHelper'

const ProductCountriesTab = ({ productCountriesGridData, maxAccess }) => {

  const [inlineGridDataRows, setInlineGridDataRows] = useState([])

  console.log(inlineGridDataRows, ' grid data ')

  function CustomEditSelect(props) {
    const {id, colDef, row,field , hasFocus,value} = props
    const apiRef = useGridApiContext();


    const handleValueChanged = (e) => {

      if(e && e.target.value)
      {
        apiRef.current.setEditCellValue({id, field, value: e.target.value})
      } else {
        apiRef.current.setEditCellValue({id, field, value: ''})
      }
    }
   
    return(
      <Autocomplete
       openOnFocus
       clearOnBlur
       options={colDef.valueOptions || []}
       getOptionLabel={(option) => option.countryRef}
       onSelect={(e) => handleValueChanged(e)}
       onChange={(e) => handleValueChanged(e)}
       disableClearable={false}
       renderInput={(inputParams) => {
        return(
          <TextField  variant="standard"  {...inputParams} />
        )
       }} 
       renderOption={(optionProps,option) => (
        <Box value={option.countryRef} component={'li'} {...optionProps} sx={{ '& > img': { mr: 2, flexShrink: 0 } }}>
          {option.countryRef}-{option.countryName}
        </Box>
       )}
       sx={{
        width:'100%'
       }}
      />
    )
  }

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
                // dataRows={productCountriesGridData.list}
                dataRows={transformRowsForEditableGrid(inlineGridDataRows)}
                setRows={setInlineGridDataRows}
                newLineOnTab={true}
                newLineField='isInactive'
                columns={[
                  {
                    field: 'recordId',
                    headerName: 'recordId',
                    type: 'number',
                    editable: true,
                    valueGetter:params => {
                      if(params.row.recordId) return params.row.recordId
                      return ''
                    }
                  },
                  {
                    field: 'countryRef',
                    headerName: 'country Ref',
                    description:'the country reference',
                    flex:1,
                    editable: true,
                    type: 'singleSelect',
                    valueOptions: productCountriesGridData.list,
                    getOptionValue: value => value.countryRef,
                    getOptionLabel: value => value.countryRef + '-' + value.countryName,
                    valueFormatter: params => {
                      const { id, value, field } = params

                      return value
                    },
                    valueSetter:params => {
                      let  countryName = productCountriesGridData.list.find(entry => entry.countryRef === params.value)?.countryName || ''
                      return {...params.row,countryRef:params.value, countryName}
                    },
                    renderEditCell:(params) => (
                      <CustomEditSelect {...params} />
                    )
                  },
                  {
                    field: 'countryName',
                    headerName: 'country Name',
                   flex:1,
                    type: 'string',
                    editable: false,
                    // valueGetter: params => getValueForCountryName(params, productCountriesGridData.list),
                  },
                  {
                    field: 'isInactive',
                    headerName: 'Is Inactive?',
                    type: 'boolean',
                    flex:1,
                    editable: true,
                    preProcessEditCellProps: params => {
                      if(params.otherFieldsProps.countryRef.error)
                      {
                        return { ...params.props, error: true }
                      }
                    },
                  },
                  // {
                  //   field: 'price',
                  //   headerName: 'price',
                  //   type: 'number',
                  //  flex:1,
                  //   editable: true,
                  //   valueFormatter: params => {
                  //     if (params.value == null) {
                  //       return ''
                  //     }
                  //     return `${params.value.toLocaleString()} $`
                  //   },
                  //   valueSetter: params => {
                  //     const price = params.value || 0;  
                  //     const qty = params.row.qty || 0;
                  //     return {...params.row,price:params.value, subtotal: price*qty}
                  //   }
                  // },
                  // {
                  //   field: 'qty',
                  //   headerName: 'qty',
                  //   type: 'number',
                  //  flex:1,
                  //   editable: true,
                  //   valueSetter: params => {
                  //     const price = params.row.price || 0;  
                  //     const qty = params.value || 0;
                  //     return {...params.row,qty:params.value, subtotal: price*qty}
                  //   }
                  // },
                  // {
                  //   field: 'subtotal',
                  //   headerName: 'subtotal',
                  //   type: 'number',
                  //   flex:1,
                  //   editable: false,
                  //   valueGetter: params => {
                  //     const price = params.row.price || 0;  
                  //     const qty = params.row.qty || 0; 
                  //     return price * qty;
                  //   },
                  //   colSpan:1,
                    
                  // },
                  // {
                  //   field: 'button',
                  //   headerName: 'open',
                  //   type: 'actions',
                  //   renderCell: params => (
                  //     <>
                  //       <Button variant='contained' size='small' onClick={() => alert('clicked')} >
                  //         Open
                  //       </Button>
                  //     </>
                  //   )
                  // }
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
