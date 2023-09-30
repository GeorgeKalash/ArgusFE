// ** MUI Imports
import {
    Box,
    Autocomplete,
    TextField,
    InputAdornment,
    IconButton,
    ListItem,
    Paper,
    List,
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'

const CustomPaper = (props) => {

    return (
        <Paper sx={{ position: 'absolute', width: '200%', zIndex: 999, mt: 1, }} {...props} />
    )
}

const CustomLookup = ({
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
    required = false,
    autoFocus = false,
    disabled = false,
    readOnly = false,
}) => {

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
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                        },
                    }}
                >
                    <Autocomplete
                        name={name}
                        value={value}
                        size={size}
                        options={data}
                        getOptionLabel={option =>
                            typeof option === 'object' ?
                                `${option[valueField]}`
                                : option
                        }
                        isOptionEqualToValue={(option, value) => option[valueField] === value[valueField]}
                        onChange={(event, newValue) => onChange(name, newValue)}
                        PaperComponent={CustomPaper}
                        renderOption={(props, option) =>
                            <Box>
                                {props.id.endsWith('0') && (
                                    <li className={props.className}>
                                        <Box sx={{ flex: 1 }}>{valueField}</Box>
                                        <Box sx={{ flex: 1 }}>{displayField}</Box>
                                    </li>
                                )}
                                <li {...props}>
                                    <Box sx={{ flex: 1 }}>{option[valueField]}</Box>
                                    <Box sx={{ flex: 1 }}>{option[displayField]}</Box>
                                </li>
                            </Box>
                        }
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
                        readOnly={readOnly}
                        disabled={disabled}
                        sx={{ flex: 1 }}
                    />
                </Box>
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        '& .MuiInputBase-root': {
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                        },
                    }}
                >
                    <TextField
                        size={size}
                        variant={variant}
                        value={value ? value[displayField] : ''}
                        required={required}
                        disabled={disabled}
                        InputProps={{
                            readOnly: true,
                        }}
                        error={error}
                        helperText={helperText}
                        sx={{ flex: 1 }}
                    />

                </Box>
            </Box>
        </Box>
    )
}

export default CustomLookup
