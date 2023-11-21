import {
  Autocomplete,
  Box,
  Grid,
  MenuItem,
  TextField,
  Tooltip,
  tooltipClasses,
} from '@mui/material'
import { styled } from '@mui/system'
import { useGridApiContext } from '@mui/x-data-grid'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

// import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import CustomInlineDataGrid from 'src/components/Shared/InlineDataGrid'
import { transformRowsForEditableGrid } from 'src/components/helpers/inlineEditGridHelper'

const CorrespondentCurrenciesTab = ({
  currencyStore,
  inlineCurrenciesGridDataRows,
  setInlineCurrenciesGridDataRows,
  inlineCurrenciesDataErrorState,
  setInlineCurrenciesDataErrorState,
  newCurrenciesLineOnTab,
  setNewCurrenciesLineOnTab,
  editCurrenciesRowsModel,
  setEditCurrenciesRowsModel,
  maxAccess
}) => {
  
  function CustomEditSelect(customEditSelectProps) {
    const { id, colDef, row, field, hasFocus, error, value: initialValue } = customEditSelectProps
    const customProps = { ...customEditSelectProps, value: undefined }
    const apiRef = useGridApiContext()

    const handleValueChanged = e => {
      if (e && e.target.value) {
        apiRef.current.setEditCellValue({ id, field, value: e.target.value })
      } else {
        //apiRef.current.setEditCellValue({ id, field, value: '' })
      }
    }

    return (
      <Autocomplete
        {...customProps}
        autoSelect
        openOnFocus
        autoFocus
        options={colDef.valueOptions || []}
        getOptionLabel={option => option.reference}
        onSelect={e => handleValueChanged(e)}
        onChange={e => handleValueChanged(e)}
        disableClearable={false}
        renderInput={inputParams => {
          return (
            <TextField autoFocus focused={hasFocus} placeholder={initialValue} variant='standard' {...inputParams} />
          )
        }}
        renderOption={(optionProps, option) => (
          <MenuItem value={option.reference} {...optionProps} sx={{ '& > img': { mr: 2, flexShrink: 0 } }}>
            {option.reference} - {option.name}
          </MenuItem>
        )}
        sx={{
          width: '100%',
          border: 'transparent',
          outline: 'transparent'
        }}
      />
    )
  }

  function preProcessCountryRefProps(params) {
    const errorMessage = params?.props?.value ? null : 'this value is required'

    return { ...params.props, error: errorMessage }
  }

  const StyledTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(
    ({ theme }) => ({
      [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: 'red',
        color: 'white'
      }
    })
  )

  function renderEditCountryRef(params) {
    const { error } = params
    if (error) {
      setNewCurrenciesLineOnTab(false)
    } else {
      setNewCurrenciesLineOnTab(true)
    }

    return (
      <StyledTooltip open={!!error} title={error}>
        <CustomEditSelect {...params} />
      </StyledTooltip>
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
            {/* <Box sx={{ flex: 1, justifyContent: 'stretch' }}>
              <InlineEditGrid columns={columns} />
            </Box> */}
            <Box sx={{ width: '100%', height: '100%' }}>
              <CustomInlineDataGrid
                dataRows={transformRowsForEditableGrid(inlineCurrenciesGridDataRows)}
                setDataRows={setInlineCurrenciesGridDataRows}
                newLineOnTab={true}
                newLineField='currencyName'
                requiredFields={['currencyRef']}
                editRowsModel={editCurrenciesRowsModel}
                columns={[
                  {
                    field: 'recordId',
                    headerName: 'recordId',
                    type: 'number',
                    editable: true,
                    valueGetter: params => {
                      if (params.row.recordId) return params.row.recordId

                      return ''
                    }
                  },
                  {
                    field: 'currencyRef',
                    headerName: 'currency Ref',
                    description: 'the currency reference',
                    flex: 1,
                    editable: true,
                    type: 'singleSelect',
                    valueOptions: currencyStore.list,
                    getOptionValue: value => {
                      value.reference
                    },
                    valueFormatter: params => {
                      const { id, value, field } = params

                      return value
                    },
                    valueSetter: params => {
                      let currencyName = currencyStore.list.find(entry => entry.reference === params.value)?.name || ''
                      let currencyId = currencyStore.list.find(entry => entry.reference === params.value)?.recordId || ''

                      return { ...params.row, currencyId, currencyRef: params.value, currencyName }
                    },

                    // renderEditCell:(params) => (
                    //   <StyledTooltip open={!!error} title={error}>
                    //   <CustomEditSelect {...params} />
                    //   </StyledTooltip>
                    // ),
                    renderEditCell: renderEditCountryRef,
                    preProcessEditCellProps: preProcessCountryRefProps
                  },
                  {
                    field: 'currencyName',
                    headerName: 'currency Name',
                    flex: 1,
                    type: 'string',
                    editable: false,
                    preProcessEditCellProps: params => {
                      if (params.otherFieldsProps.currencyRef.error) {
                        return { ...params.props, error: true }
                      }
                    }
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

export default CorrespondentCurrenciesTab
