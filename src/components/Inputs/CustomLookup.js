import { Box, Grid, Autocomplete, TextField, IconButton, InputAdornment, Paper } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import { useEffect, useState } from 'react'
import { DISABLED, FORCE_ENABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'
import PopperComponent from '../Shared/Popper/PopperComponent'
import CircularProgress from '@mui/material/CircularProgress'
import { TrxType } from 'src/resources/AccessLevels'

const CustomLookup = ({
  type = 'text',
  name,
  label,
  firstValue,
  secondValue,
  secondDisplayField = true,
  columnsInDropDown,
  onSecondValueChange,
  secondFieldName = '',
  store = [],
  setStore,
  onKeyUp,
  valueField = 'key',
  displayField = 'value',
  secondFieldLabel = '',
  onLookup,
  onChange,
  onKeyDown,
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
  isLoading,
  minChars,
  userTypes = true,
  onBlur = () => {},
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const [freeSolo, setFreeSolo] = useState(false)
  const [focus, setAutoFocus] = useState(autoFocus)

  const [inputValue, setInputValue] = useState(firstValue || '')

  useEffect(() => {
    if (!firstValue) {
      setInputValue('')
    }
  }, [firstValue])

  const { accessLevel } = (props?.maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId === name) ?? 0

  const _readOnly = editMode ? editMode && maxAccess < TrxType.EDIT : accessLevel > DISABLED ? false : readOnly

  const _hidden = accessLevel ? accessLevel === HIDDEN : hidden

  const isRequired = required || accessLevel === MANDATORY

  return _hidden ? (
    <></>
  ) : (
    <Grid container spacing={0} sx={{ width: '100%' }}>
      <Grid item xs={secondDisplayField ? 6 : 12}>
        <Autocomplete
          name={name}
          key={firstValue || null}
          value={firstValue}
          {...(userTypes && !firstValue && { inputValue: inputValue })}
          size={size}
          options={store}
          filterOptions={options => {
            if (displayField) {
              return options.filter(option => option)
            }
          }}
          getOptionLabel={option => {
            if (typeof valueField == 'object') {
              const text = valueField
                .map(header => option[header] && option[header]?.toString())
                ?.filter(item => item)
                ?.join(' ')

              return text || firstValue
            }

            return typeof option === 'object' ? `${option[valueField] ? option[valueField] : ''}` : option
          }}
          onChange={(event, newValue) => {
            setInputValue(newValue ? newValue[valueField] : '')
            onChange(name, newValue)
            setAutoFocus(true)
          }}
          PopperComponent={PopperComponent}
          PaperComponent={({ children }) =>
            props.renderOption && <Paper style={{ width: `${displayFieldWidth * 100}%` }}>{children}</Paper>
          }
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
                setInputValue(e.target.value)

                if (e.target.value) {
                  onLookup(e.target.value)
                  setFreeSolo(true)
                } else {
                  setStore([])
                  setFreeSolo(false)
                }
              }}
              onKeyDown={onKeyDown}
              onBlur={e => {
                if (!store.some(item => item[valueField] === inputValue) && e.target.value !== firstValue) {
                  setInputValue('')

                  setFreeSolo(true)
                }

                onBlur(e)
              }}
              onFocus={() => {
                setStore([]), setFreeSolo(true)
              }}
              type={type}
              variant={variant}
              label={label}
              required={isRequired}
              onKeyUp={e => {
                onKeyUp(e)

                if (e.key !== 'Enter') e.target.value >= minChars ? setFreeSolo(true) : setFreeSolo(false)
              }}
              inputProps={{
                ...params.inputProps,
                tabIndex: _readOnly ? -1 : 0 // Prevent focus if readOnly
              }}
              autoFocus={focus}
              error={error}
              helperText={helperText}
              InputProps={{
                ...params.InputProps,
                endAdornment: !_readOnly && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      right: 5,
                      display: 'flex'
                    }}
                  >
                    <InputAdornment sx={{ margin: '0px !important' }} position='end'>
                      <IconButton
                        sx={{ margin: '0px !important', padding: '0px !important' }}
                        tabIndex={-1}
                        edge='end'
                        onClick={() => {
                          setInputValue('')
                          onChange(name, '')
                          setStore([])
                          setFreeSolo(true)
                        }}
                        aria-label='clear input'
                      >
                        <ClearIcon sx={{ border: '0px', fontSize: 20 }} />
                      </IconButton>
                    </InputAdornment>

                    {!isLoading ? (
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
                    ) : (
                      <InputAdornment sx={{ margin: '0px !important' }} position='end'>
                        <CircularProgress size={15} style={{ marginLeft: 5 }} />
                      </InputAdornment>
                    )}
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
            placeholder={secondFieldLabel == '' ? displayField.toUpperCase() : secondFieldLabel.toUpperCase()}
            value={secondValue ? secondValue : ''}
            required={isRequired}
            onChange={e => {
              if (onSecondValueChange && secondFieldName) {
                onSecondValueChange(secondFieldName, e.target.value)
              }
            }}
            InputProps={{
              inputProps: {
                tabIndex: -1 // Prevent focus on the input field
              },
              readOnly: !!secondFieldName ? false : true
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
