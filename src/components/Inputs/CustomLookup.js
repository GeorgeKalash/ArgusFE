// ** MUI Imports
import { Box, Autocomplete, TextField, Paper } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search' // Import the icon you want to use
import ClearIcon from '@mui/icons-material/Clear'
import { InputAdornment, IconButton } from '@mui/material'
import { useEffect, useState } from 'react'

const CustomLookup = ({
  type = 'text', //any valid HTML5 input type
  name,
  label,
  firstValue,
  secondValue,
  secondDisplayField = true,
  columnsInDropDown,
  store = [],
  setStore,
  onKeyUp,
  valueField = 'key',
  displayField = 'value',
  onLookup,
  onChange,
  error,
  firstFieldWidth = secondDisplayField ? '50%' : '100%',
  displayFieldWidth = 1,
  helperText,
  variant = 'outlined', //outlined, standard, filled
  size = 'small', //small, medium
  required = false,
  autoFocus = false,
  disabled = false,
  readOnly = false,
  editMode,
  hasBorder = true,
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const _readOnly = editMode ? editMode && maxAccess < 3 : readOnly
  const [freeSolo, setFreeSolo] = useState(true)

  useEffect(() => {
    store.length < 1 && setFreeSolo(false)
  }, [store])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '40px',
        mb: error && helperText ? 6 : 0
      }}
    >
      <Box display={'flex'}>
        <Box
          sx={{
            ...(secondDisplayField && {
              '& .MuiAutocomplete-inputRoot': {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0
              }
            }),
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: !hasBorder && 'none' // Hide border
              }
            },
            width: firstFieldWidth
          }}
        >
          <Autocomplete
            name={name}
            key={firstValue}
            defaultValue={firstValue}
            value={firstValue}
            size={size}
            options={store}
            filterOptions={(options, { inputValue }) => {
              if (displayField) {
                return options.filter(option => option)
              }
            }}
            getOptionLabel={option =>
              typeof option === 'object' ? `${option[valueField] ? option[valueField] : ''}` : option
            }
            isOptionEqualToValue={(option, value) => (value ? option[valueField] === value[valueField] : '')}
            onChange={(event, newValue) => onChange(name, newValue)}
            PaperComponent={({ children }) => (
              <Paper sx={{ position: 'absolute', width: `${displayFieldWidth * 100}%`, zIndex: 999, mt: 1 }}>
                {children}
              </Paper>
            )}
            renderOption={(props, option) => {
              if (columnsInDropDown && columnsInDropDown.length > 0) {
                return (
                  <Box>
                    {props.id.endsWith('-0') && (
                      <li className={props.className}>
                        {columnsInDropDown.map((header, i) => {
                          return (
                            secondDisplayField && (
                              <Box key={i} sx={{ flex: 1, fontWeight: 'bold' }}>
                                {header.value.toUpperCase()}
                              </Box>
                            )
                          )
                        })}
                      </li>
                    )}
                    <li {...props}>
                      {columnsInDropDown.map((header, i) => {
                        return (
                          <Box key={i} sx={{ flex: 1 }}>
                            {option[header.key]}
                          </Box>
                        )
                      })}
                    </li>
                  </Box>
                )
              } else {
                return (
                  <Box>
                    {props.id.endsWith('-0') && (
                      <li className={props.className}>
                        {secondDisplayField && <Box sx={{ flex: 1 }}>{valueField.toUpperCase()}</Box>}
                        {secondDisplayField && <Box sx={{ flex: 1 }}>{displayField.toUpperCase()}</Box>}
                      </li>
                    )}
                    <li {...props}>
                      <Box sx={{ flex: 1 }}>{option[valueField]}</Box>
                      {secondDisplayField && <Box sx={{ flex: 1 }}>{option[displayField]}</Box>}
                    </li>
                  </Box>
                )
              }
            }}
            renderInput={params => (
              <TextField
                {...params}
                onChange={e => {
                  if (e.target.value) {
                    onLookup(e.target.value)
                    setFreeSolo(true)
                    console.log('! solo')
                  } else {
                    setStore([])
                    setFreeSolo(false)
                    console.log('solo')
                  }
                }}
                onBlur={() => setFreeSolo(true)}
                type={type}
                variant={variant}
                label={label}
                required={required}
                onKeyUp={() => {
                  onKeyUp
                  setFreeSolo(true)
                }}
                autoFocus={autoFocus}
                error={error}
                helperText={helperText} // style={{ textAlign: 'right', width: firstFieldWidth }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        right: 15,
                        display: 'flex'
                      }}
                    >
                      {!readOnly && (
                        <InputAdornment position='end'>
                          <IconButton tabIndex={-1} edge='end' onClick={e => onChange('')} aria-label='clear input'>
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      )}
                      <InputAdornment position='end'>
                        <IconButton tabIndex={-1} edge='end' style={{ pointerEvents: 'none' }}>
                          <SearchIcon style={{ cursor: 'pointer' }} />
                        </IconButton>
                      </InputAdornment>
                      {/* Adjust color as needed */}
                    </div>
                  )
                }}
              />
            )}
            readOnly={_readOnly}
            freeSolo={_readOnly || freeSolo}
            disabled={disabled}
          />
        </Box>
        {secondDisplayField && (
          <Box
            sx={{
              width: `calc(100% - ${firstFieldWidth})`, // Calculate the width dynamically
              flex: 1,
              display: 'flex',
              '& .MuiInputBase-root': {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0
              }
            }}
          >
            <TextField
              size={size}
              variant={variant}
              placeholder={displayField.toUpperCase()}
              value={secondValue ? secondValue : ''}
              required={required}
              disabled={disabled}
              InputProps={{
                readOnly: true
              }}
              error={error}
              helperText={helperText}
              sx={{
                width: `calc(100%)` // Calculate the width dynamically
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default CustomLookup
