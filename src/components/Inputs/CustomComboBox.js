// ** MUI Imports
import { Autocomplete, TextField } from '@mui/material'
import { ControlAccessLevel, TrxType } from 'src/resources/AccessLevels'
import { Box } from '@mui/material'
import Paper from '@mui/material/Paper'
import { DISABLED, FORCE_ENABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'

const CustomComboBox = ({
  type = 'text', //any valid HTML5 input type
  name,
  label,
  value,
  valueField = 'key',
  displayField = 'value',
  store = [],
  getOptionBy,
  onChange,
  error,
  helperText,
  variant = 'outlined', //outlined, standard, filled
  size = 'small', //small, medium
  fullWidth = true,
  required = false,
  autoFocus = false,
  disabled = false,
  readOnly = false,
  displayFieldWidth = 1,
  sx,
  columnsInDropDown,
  editMode = false,
  hasBorder = true,
  hidden = false,
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

  const { accessLevel } = (props?.maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId === name) ?? 0

  const _readOnly =
    maxAccess < 3 ||
    accessLevel === DISABLED ||
    (readOnly && accessLevel !== MANDATORY && accessLevel !== FORCE_ENABLED)

  const _hidden = accessLevel ? accessLevel === HIDDEN : hidden

  const _required = required || accessLevel === MANDATORY

  return (
    <Autocomplete
      name={name}
      value={value}
      size={size}
      options={store}
      key={value}
      PaperComponent={({ children }) => <Paper style={{ width: `${displayFieldWidth * 100}%` }}>{children}</Paper>}
      getOptionLabel={(option, value) => {
        if (typeof option === 'object') {
          if (columnsInDropDown && columnsInDropDown.length > 0) {
            const search = columnsInDropDown.map(header => option[header.key]).join(' ')

            return search || option[displayField]
          }

          return `${option[displayField]}`
        } else {
          const selectedOption = store.find(item => {
            return item[valueField] === option
          })
          if (selectedOption) return selectedOption[displayField]
          else return ''
        }
      }}
      isOptionEqualToValue={(option, value) => option[valueField] == getOptionBy}
      onChange={onChange}
      fullWidth={fullWidth}
      readOnly={_readOnly}
      freeSolo={_readOnly}
      disabled={_readOnly}
      sx={{ ...sx, display: _hidden ? 'none' : 'unset' }}
      renderOption={(props, option) => {
        if (columnsInDropDown && columnsInDropDown.length > 0) {
          return (
            <Box>
              {props.id.endsWith('-0') && (
                <li className={props.className}>
                  {columnsInDropDown.map((header, i) => {
                    return (
                      <Box key={i} sx={{ flex: 1, fontWeight: 'bold' }}>
                        {header.value.toUpperCase()}
                      </Box>
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
              <li {...props}>
                {/* <Box sx={{ flex: 1 }}>{option[valueField]}</Box> */}
                <Box sx={{ flex: 1 }}>{option[displayField]}</Box>
              </li>
            </Box>
          )
        }
      }}
      renderInput={params => (
        <TextField
          {...params}
          type={type}
          variant={variant}
          label={label}
          required={_required}
          autoFocus={autoFocus}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            style: {
              border: 'none' // Set width to 100%
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: !hasBorder && 'none' // Hide border
              }
            }
          }}
        />
      )}
    />
  )
}

export default CustomComboBox
