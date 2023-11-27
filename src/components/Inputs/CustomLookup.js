// ** MUI Imports
import { Box, Autocomplete, TextField, Paper } from '@mui/material'

const CustomPaper = props => {
  return <Paper sx={{ position: 'absolute', width: '200%', zIndex: 999, mt: 1 }} {...props} />
}

const CustomLookup = ({
  type = 'text', //any valid HTML5 input type
  name,
  label,
  firstValue,
  secondValue,
  store = [],
  setStore,
  valueField = 'key',
  displayField = 'value',
  onLookup,
  onChange,
  error,
  helperText,
  variant = 'outlined', //outlined, standard, filled
  size = 'small', //small, medium
  required = false,
  autoFocus = false,
  disabled = false,
  readOnly = false,
  editMode,
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

  const _readOnly = editMode ? editMode && maxAccess < 3 : readOnly

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
            flex: 1,
            '& .MuiAutocomplete-inputRoot': {
              borderTopRightRadius: secondValue && 0,
              borderBottomRightRadius: secondValue && 0
            }
          }}
        >
          <Autocomplete
            name={name}
            value={firstValue}
            size={size}
            options={store}
            getOptionLabel={option => (typeof option === 'object' ? `${option[valueField]}` : option)}
            isOptionEqualToValue={(option, value) => (value ? option[valueField] === value[valueField] : '')}
            onChange={(event, newValue) => onChange(name, newValue)}
            PaperComponent={CustomPaper}
            renderOption={(props, option) => (
              <Box>
                {props.id.endsWith('-0') && (
                  <li className={props.className}>
                    <Box sx={{ flex: 1 }}>{valueField.toUpperCase()}</Box>
                   {secondValue && <Box sx={{ flex: 1 }}>{displayField.toUpperCase()}</Box>}
                  </li>
                )}
                <li {...props}>
                  <Box sx={{ flex: 1 }}>{option[valueField]}</Box>
                  <Box sx={{ flex: 1 }}>{option[displayField]}</Box>
                </li>
              </Box>
            )}
            renderInput={params => (
              <TextField
                {...params}
                onChange={e => (e.target.value ? onLookup(e.target.value) : setStore([]))}
                type={type}
                variant={variant}
                label={label}
                required={required}
                autoFocus={autoFocus}
                error={error}
                helperText={helperText}
              />
            )}
            readOnly={_readOnly}
            freeSolo={_readOnly}
            disabled={disabled}
            sx={{ flex: 1 }}
          />
        </Box>
        {secondValue && (
          <Box
            sx={{
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
              sx={{ flex: 1 }}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default CustomLookup
