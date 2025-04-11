import { Box, Grid, Autocomplete, TextField, IconButton, InputAdornment, Paper } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import { useEffect, useRef, useState } from 'react'
import PopperComponent from '../Shared/Popper/PopperComponent'
import CircularProgress from '@mui/material/CircularProgress'
import { checkAccess } from 'src/lib/maxAccess'

const CustomLookup = ({
  type = 'text',
  name,
  fullName,
  label,
  firstValue,
  secondValue,
  secondDisplayField = true,
  columnsInDropDown,
  secondField = { name: '', editable: false, onChange: () => {} },
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
  onBlur = () => {},
  onFocus = () => {},
  ...props
}) => {
  const { _readOnly, _required, _hidden } = checkAccess(fullName, props.maxAccess, required, readOnly, hidden)

  const [freeSolo, setFreeSolo] = useState(false)
  const [focus, setAutoFocus] = useState(autoFocus)
  const [isFocused, setIsFocused] = useState(false)

  const valueHighlightedOption = useRef(null)

  const selectFirstValue = useRef(null)

  const autocompleteRef = useRef(null)

  const [inputValue, setInputValue] = useState(firstValue || '')

  useEffect(() => {
    function handleBlur(event) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        selectFirstValue.current = 'click'
      }
    }

    document.addEventListener('mousedown', handleBlur)

    return () => {
      document.removeEventListener('mousedown', handleBlur)
    }
  }, [])

  useEffect(() => {
    if (!firstValue) {
      setInputValue('')
    }
  }, [firstValue])

  return _hidden ? (
    <></>
  ) : (
    <Grid container spacing={0} sx={{ width: '100%' }}>
      <Grid item xs={secondDisplayField ? 6 : 12}>
        <Autocomplete
          ref={autocompleteRef}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          name={name}
          key={firstValue || null}
          value={firstValue}
          {...(!firstValue && { inputValue: inputValue })}
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

            valueHighlightedOption.current = ''
          }}
          onHighlightChange={(event, newValue) => {
            valueHighlightedOption.current = newValue
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
                            <Box
                              key={i}
                              sx={{
                                flex: 1,
                                fontWeight: 'bold',
                                width: header.width || 'auto',
                                fontSize: '0.7rem',
                                height: '15px',
                                display: 'flex'
                              }}
                            >
                              {header.value.toUpperCase()}
                            </Box>
                          )
                      )}
                    </li>
                  )}
                  <li {...props}>
                    {columnsInDropDown.map((header, i) => (
                      <Box
                        key={i}
                        sx={{
                          flex: 1,
                          width: header.width || 'auto',
                          fontSize: '0.88rem',
                          height: '20px',
                          display: 'flex'
                        }}
                      >
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
                      {secondDisplayField && (
                        <Box sx={{ flex: 1, fontSize: '0.88rem', height: '20px', display: 'flex', fontWeight: 'bold' }}>
                          {valueField.toUpperCase()}
                        </Box>
                      )}
                      {secondDisplayField && (
                        <Box sx={{ flex: 1, fontWeight: 'bold' }}>{displayField.toUpperCase()}</Box>
                      )}
                    </li>
                  )}
                  <li {...props}>
                    <Box sx={{ flex: 1 }}>{option[valueField]}</Box>
                    {secondDisplayField && (
                      <Box sx={{ flex: 1, fontSize: '0.88rem', height: '20px', display: 'flex' }}>
                        {option[displayField]}
                      </Box>
                    )}
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

                if (selectFirstValue.current !== 'click') {
                  onBlur(e, valueHighlightedOption?.current)
                }
              }}
              onFocus={e => {
                setStore([]), setFreeSolo(true)
                selectFirstValue.current = ''
                onFocus(e)
              }}
              type={type}
              variant={variant}
              label={label}
              required={_required}
              onKeyUp={e => {
                onKeyUp(e)
                if (e.key !== 'Enter') setFreeSolo(false)
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
                        <ClearIcon sx={{ border: '0px', fontSize: 17 }} />
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
                          <SearchIcon style={{ cursor: 'pointer', border: '0px', fontSize: 17 }} />
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
                    border: !hasBorder && 'none',
                    borderColor: '#959d9e',
                    borderTopLeftRadius: '6px',
                    borderBottomLeftRadius: '6px'
                  },
                  height: '33px !important'
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.90rem',
                  top: isFocused || firstValue ? '0px' : '-3px'
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.90rem',
                  color: 'black'
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
            required={_required}
            onChange={e => {
              if (secondField?.onChange && secondField?.name) {
                secondField?.onChange(secondField?.name, e.target.value)
              }
            }}
            InputProps={{
              inputProps: {
                tabIndex: _readOnly || secondField?.editable === '' ? -1 : 0 // Prevent focus on the input field
              },
              readOnly: secondField ? !secondField?.editable : _readOnly
            }}
            error={error}
            helperText={helperText}
            sx={{
              flex: 1,
              display: 'flex',
              '& .MuiInputBase-root': {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: !hasBorder && 'none',
                  borderColor: '#959d9e',
                  borderTopRightRadius: '6px',
                  borderBottomRightRadius: '6px'
                },
                height: '33px !important'
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.90rem',
                top: firstValue ? '0px' : '-3px'
              },
              '& .MuiInputBase-input': {
                fontSize: '0.90rem',
                color: 'black'
              },
              width: '100%'
            }}
          />
        </Grid>
      )}
    </Grid>
  )
}

export default CustomLookup
