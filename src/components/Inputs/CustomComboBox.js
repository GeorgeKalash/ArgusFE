// ** MUI Imports
import {
    Autocomplete,
    TextField,
} from '@mui/material'
import { ControlAccessLevel, TrxType } from 'src/resources/AccessLevels'

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
    editMode = false,
    ...props
}) => {

    const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

    const fieldAccess = props.maxAccess && props.maxAccess?.record?.controls?.find(item => item.controlId === name)?.accessLevel

    const _readOnly = editMode ?
        editMode && maxAccess < TrxType.EDIT
        : readOnly

    const _disabled = disabled || fieldAccess === ControlAccessLevel.Disabled

    const _required = required || fieldAccess === ControlAccessLevel.Mandatory

    const _hidden = fieldAccess === ControlAccessLevel.Hidden

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
            readOnly={_readOnly}
            freeSolo={_readOnly}
            disabled={_disabled}
            sx={{ ...sx, display: _hidden ? 'none' : 'unset' }}
            renderInput={(params) =>
                <TextField
                    {...params}
                    type={type}
                    variant={variant}
                    label={label}
                    required={_required}
                    autoFocus={autoFocus}
                    error={error}
                    helperText={helperText}
                />
            }
        />
    )
}

export default CustomComboBox
