// ** MUI Imports
import TextField from '@mui/material/TextField'

const CustomTextField = ({
    type = 'text', //any valid HTML5 input type
    variant = 'outlined', //outlined, standard, filled
    size = 'small', //small, medium
    fullWidth = true,
    autoFocus = false,
    readOnly = false,
    autoComplete = 'new-password',
    ...props
}) => {

    return (
        <TextField
            type={type}
            variant={variant}
            size={size}
            fullWidth={fullWidth}
            autoFocus={autoFocus}
            inputProps={{ autoComplete: autoComplete, readOnly: readOnly }}
            {...props}
        />
    )
}

export default CustomTextField
