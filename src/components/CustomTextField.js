// ** MUI Imports
import TextField from '@mui/material/TextField';

const CustomTextField = ({
    type = 'text',
    label,
    variant = 'outlined',
    size = 'small',
    fullWidth = true,
    required = false,
    autoFocus = false,
    disabled = false,
    readOnly = false,
    autoComplete = 'new-password',
    ...props
}) => {

    return (
        <TextField
            type={type}
            label={label}
            variant={variant}
            size={size}
            fullWidth={fullWidth}
            required={required}
            autoFocus={autoFocus}
            disabled={disabled}
            inputProps={{ autoComplete: autoComplete, readOnly: readOnly }}
            {...props}
        />
    )
}

export default CustomTextField
