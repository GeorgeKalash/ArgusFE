// ** MUI Imports
import {
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'

const CustomTextField = ({
    type = 'text', //any valid HTML5 input type
    variant = 'outlined', //outlined, standard, filled
    value,
    onClear,
    size = 'small', //small, medium
    fullWidth = true,
    autoFocus = false,
    readOnly = false,
    autoComplete = 'new-password',
    numberField = false,
    ...props
}) => {

    return (
        <TextField
            type={type}
            variant={variant}
            value={value}
            size={size}
            fullWidth={fullWidth}
            autoFocus={autoFocus}
            inputProps={{
                autoComplete: autoComplete,
                readOnly: readOnly,
                pattern: numberField && '[0-9]*', // Allow only numeric input
                style: {
                    textAlign: numberField && 'right'
                }
            }}
            style={{ textAlign: 'right' }}
            InputProps={{
                endAdornment: value && (
                    <InputAdornment position='end'>
                        <IconButton
                            tabIndex={-1}
                            edge='end'
                            onClick={onClear}
                            aria-label='clear input'
                        >
                            <ClearIcon />
                        </IconButton>
                    </InputAdornment>
                )
            }}
            {...props}
        />
    )
}

export default CustomTextField
