// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import {
    Box,
    TextField,
    InputAdornment,
    IconButton,
    ListItem,
    Paper,
    List,
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'

const CustomLookup = ({
    type = 'text', //any valid HTML5 input type
    name,
    label,
    value,
    data = [],
    valueField = 'key',
    displayField = 'value',
    onChange,
    onClear,
    error,
    helperText,
    variant = 'outlined', //outlined, standard, filled
    size = 'small', //small, medium
    required = false,
    autoFocus = false,
    disabled = false,
    readOnly = false,
}) => {

    const [open, setOpen] = useState(false)

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
                <TextField
                    size={size}
                    type={type}
                    variant={variant}
                    label={label}
                    value={value ? value[valueField] : ''}
                    required={required}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    InputProps={{
                        readOnly: readOnly,
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
                    error={error}
                    helperText={helperText}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => {
                        setOpen(false)
                    }, 100)}
                    sx={{ flex: 1 }}
                />
                <TextField
                    size={size}
                    variant={variant}
                    label={displayField}
                    value={value ? value[displayField] : ''}
                    required={required}
                    disabled={disabled}
                    InputProps={{
                        readOnly: true,
                    }}
                    error={error}
                    helperText={helperText}
                    sx={{ flex: 1, ml: 2 }}
                />
            </Box>
            {open && (
                <Paper sx={{ position: 'absolute', width: '100%', zIndex: 999, mt: 1 }}>
                    <List>
                        <ListItem>
                            <Box sx={{ flex: 1 }}>{valueField}</Box>
                            <Box sx={{ flex: 1 }}>{displayField}</Box>
                        </ListItem>
                        {data.map((option) => (
                            <ListItem
                                key={option[valueField]}
                                onClick={() => onChange(name, option)}
                                style={{ cursor: 'pointer' }}
                            >
                                <Box sx={{ flex: 1 }}>{option[valueField]}</Box>
                                <Box sx={{ flex: 1 }}>{option[displayField]}</Box>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    )
}

export default CustomLookup
