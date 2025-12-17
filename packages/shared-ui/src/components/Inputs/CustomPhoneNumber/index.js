import { IconButton } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ClearIcon from '@mui/icons-material/Clear'
import { checkAccess } from '@argus/shared-domain/src/lib/maxAccess'
import styles from './CustomPhoneNumber.module.css'
import inputs from '../Inputs.module.css'

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
  }, [type, name])

  return _hidden ? (
    <></>
  ) : (
    <div 
    className={`${styles.phoneWrapper} ${inputs.outlinedRoot}`}>
      {label && (
        <div className={`${styles.phoneLabel} ${inputs.inputLabelShrink} ${error && styles.errorLabel}`  }>
          {label} {_required && <span >*</span>}
        </div>
      )}
    <div 
    dir="ltr" 
    className={`${styles.phoneWrapper} ${inputs.outlinedRoot}`}>
      <PhoneInput
        country={countryRef?.toLowerCase()}
        value={value || ''}
        placeholder=''
        dir="rtl"
        language='ars'
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
          display: 'flex',
          alignItems: 'center'
        }}
        inputStyle={{
          width: '100%',
          border: 'none'
        }}
        containerClass={`${styles.phoneContainer} ${inputs.outlinedFieldset}`}
        inputClass={styles.phoneInput}
        dropdownClass={styles.phoneDropdown}  

        specialLabel=''
        {...props}
      />

      {(value || value === 0) && !_readOnly && (
        <IconButton
          tabIndex={-1}
          onClick={() => props.onClear(code)}
          aria-label='clear input'
          className={styles.phoneClearButton}
        >
          <ClearIcon className={inputs.icon} />
        </IconButton>
      )}
      </div>
    </div>
  )
}

export default CustomPhoneNumber
