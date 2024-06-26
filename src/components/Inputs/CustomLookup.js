import { Box, Grid, Autocomplete, TextField, IconButton, InputAdornment, Paper } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import { useEffect, useState } from 'react'
import { DISABLED, FORCE_ENABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'
import PopperComponent from '../Shared/Popper/PopperComponent'

const CustomLookup = ({
  type = 'text',
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
  variant = 'outlined',
  size = 'small',
  required = false,
  autoFocus = false,
  disabled = false,
  readOnly = false,
  editMode,
  hasBorder = true,
  hidden = false,
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const [freeSolo, setFreeSolo] = useState(false)

  useEffect(() => {
    store.length < 1 && setFreeSolo(false)
    firstValue && setFreeSolo(true)
  }, [store, firstValue])

  const { accessLevel } = (props?.maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId === name) ?? 0

  const _readOnly =
    maxAccess < 3 ||
    accessLevel === DISABLED ||
    (readOnly && accessLevel !== MANDATORY && accessLevel !== FORCE_ENABLED)

  const _hidden = accessLevel ? accessLevel === HIDDEN : hidden

  const isRequired = required || accessLevel === MANDATORY

  return _hidden ? (
    <></>
  ) : (
    <Grid container spacing={0} sx={{ width: '100%' }}>
      <Grid item xs={secondDisplayField ? 6 : 12}>
        <Autocomplete
          name={name}
          key={firstValue}
          defaultValue={firstValue}
          value={firstValue}
          size={size}
          options={store}
          filterOptions={options => {
            if (displayField) {
              return options.filter(option => option)
            }
          }}
          getOptionLabel={option =>
            typeof option === 'object' ? `${option[valueField] ? option[valueField] : ''}` : option
          }
          isOptionEqualToValue={(option, value) => (value ? option[valueField] === value[valueField] : '')}
          onChange={(event, newValue) => onChange(name, newValue)}
          PopperComponent={PopperComponent}
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
                      {columnsInDropDown.map(
                        (header, i) =>
                          columnsInDropDown.length > 1 && (
                            <Box key={i} sx={{ flex: 1, fontWeight: 'bold' }}>
                              {header.value.toUpperCase()}
                            </Box>
                          )
                      )}
                    </li>
                  )}
                  <li {...props}>
                    {columnsInDropDown.map((header, i) => (
                      <Box key={i} sx={{ flex: 1 }}>
                        {option[header.key]}
                      </Box>
                    ))}
                  </li>
                </Box>
              )
            } else {
              return (
                <Box>
                  {props.id.endsWith('-0') && (
                    <li className={props.className}>
                      {secondDisplayField && <Box sx={{ flex: 1, fontWeight: 'bold' }}>{valueField.toUpperCase()}</Box>}
                      {secondDisplayField && (
                        <Box sx={{ flex: 1, fontWeight: 'bold' }}>{displayField.toUpperCase()}</Box>
                      )}
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
                } else {
                  setStore([])
                  setFreeSolo(false)
                }
              }}
              onBlur={() => setFreeSolo(true)}
              type={type}
              variant={variant}
              label={label}
              required={isRequired}
              onKeyUp={() => {
                onKeyUp
                setFreeSolo(true)
              }}
              autoFocus={autoFocus}
              error={error}
              helperText={helperText}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      right: 5,
                      display: 'flex'
                    }}
                  >
                    {!readOnly && (
                      <InputAdornment sx={{ margin: '0px !important' }} position='end'>
                        <IconButton
                          sx={{ margin: '0px !important', padding: '0px !important' }}
                          tabIndex={-1}
                          edge='end'
                          onClick={e => onChange('')}
                          aria-label='clear input'
                        >
                          <ClearIcon sx={{ border: '0px', fontSize: 20 }} />
                        </IconButton>
                      </InputAdornment>
                    )}
                    <InputAdornment sx={{ margin: '0px !important' }} position='end'>
                      <IconButton
                        sx={{ margin: '0px !important', padding: '0px !important' }}
                        tabIndex={-1}
                        edge='end'
                        style={{ pointerEvents: 'none' }}
                      >
                        <SearchIcon style={{ cursor: 'pointer', border: '0px', fontSize: 20 }} />
                      </IconButton>
                    </InputAdornment>
                  </div>
                )
              }}
              sx={{
                ...(secondDisplayField && {
                  '& .MuiAutocomplete-inputRoot': {
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0
                  }
                }),
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    border: !hasBorder && 'none'
                  }
                },
                width: '100%'
              }}
            />
          )}
          readOnly={_readOnly}
          freeSolo={_readOnly || freeSolo}
          disabled={disabled}
        />
      </Grid>
      {secondDisplayField && (
        <Grid item xs={6}>
          <TextField
            size={size}
            variant={variant}
            placeholder={displayField.toUpperCase()}
            value={secondValue ? secondValue : ''}
            required={isRequired}
            disabled={disabled}
            InputProps={{
              readOnly: true
            }}
            error={error}
            helperText={helperText}
            sx={{
              flex: 1,
              display: 'flex',
              '& .MuiInputBase-root': {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0
              }
            }}
          />
        </Grid>
      )}
    </Grid>
  )
}

export default CustomLookup
