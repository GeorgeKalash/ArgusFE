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
    data = [],
    valueField = 'key',
    displayField = 'value',
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
}) => {

    return (
        <Autocomplete
            name={name}
            value={value}
            size={size}
            options={data}
            getOptionLabel={option => option[displayField]}
            isOptionEqualToValue={(option, value) => option[valueField] === value[valueField]}
            onChange={(event, newValue) => onChange(name, newValue)}
            fullWidth={fullWidth}
            readOnly={readOnly}
            disabled={disabled}
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
