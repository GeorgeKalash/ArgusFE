import { IconButton } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'
import { ControlContext } from 'src/providers/ControlContext'
import ClearIcon from '@mui/icons-material/Clear'
import { checkAccess } from 'src/lib/maxAccess'

function CustomPhoneNumber({ label, name, type, value, onChange, onBlur, error, ...props }) {
  const prefix = '+'

  const { defaultsData } = useContext(ControlContext)

  const [code, seCode] = useState('')

  const { _readOnly, _required, _hidden } = checkAccess(
    name,
    props.maxAccess,
    props.required,
    props.readOnly,
    props.hidden
  )

  const countryRef = defaultsData?.list?.find(({ key }) => key === 'countryRef')?.value

  function replaceLeadingZeros(value) {
    return value?.replace(/^0+/, '00')
  }

  const handlePhoneChange = (fullValue, countryData, event) => {
    const value = replaceLeadingZeros(prefix + fullValue)

    seCode(prefix + countryData.dialCode)

    if (onChange) onChange(value, countryData, event)
  }

  const handlePhoneBlur = event => {
    if (onBlur) onBlur(event)
  }

  useEffect(() => {
    const inputElement = document.querySelector(`[name="${name}"]`)

    if (inputElement) {
      inputElement.type = type
    }
  }, [type])

  return _hidden ? (
    <></>
  ) : (
    <div style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label
          style={{
            position: 'absolute',
            zIndex: 1,
            top: '-8px',
            left: '12px',
            fontSize: '11px',
            background: 'white',
            padding: '0 4px',
            fontWeight: '500',
            color: '#666'
          }}
        >
          {label} {_required && <span>*</span>}
        </label>
      )}

      <PhoneInput
        country={countryRef?.toLowerCase()}
        value={value || ''}
        placeholder=''
        prefix={prefix === '+' ? prefix : ''}
        enableSearch={true}
        disableAreaCodes={true}
        onChange={handlePhoneChange}
        onBlur={handlePhoneBlur}
        disableDropdown={_readOnly}
        inputProps={{
          name: name,
          onPaste: props.onPaste,
          onCopy: props.onCopy,
          readOnly: _readOnly
        }}
        containerStyle={{
          border: `1px solid ${error ? 'red' : '#ccc'}`,
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center'
        }}
        inputStyle={{
          width: '100%',
          border: 'none'
        }}
        specialLabel={''}
        {...props}
      />
      {(value || value === 0) && !_readOnly && (
        <IconButton
          tabIndex={-1}
          edge='end'
          onClick={() => props.onClear(code)}
          aria-label='clear input'
          sx={{
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '5px'
          }}
        >
          <ClearIcon sx={{ fontSize: 17 }} />
        </IconButton>
      )}
    </div>
  )
}

export default CustomPhoneNumber
