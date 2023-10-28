// ** MUI Imports
import {
    Autocomplete,
    TextField,
} from '@mui/material'

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
    sx,
}) => {

    return (
        <Autocomplete
            name={name}
            value={value}
            size={size}
            options={store}
            getOptionLabel={option => {
                if (typeof option === 'object')
                    return option[displayField]
                else
                    return option
            }}
            isOptionEqualToValue={(option, value) => option[valueField] == getOptionBy}
            onChange={onChange}
            fullWidth={fullWidth}
            readOnly={readOnly}
            freeSolo={readOnly}
            disabled={disabled}
            sx={sx}
            renderInput={(params) =>
                <TextField
                    {...params}
                    type={type}
                    variant={variant}
                    label={label}
                    required={required}
                    autoFocus={autoFocus}
                    error={error}
                    helperText={helperText}
                />
            }
        />
    )
}

export default CustomComboBox
