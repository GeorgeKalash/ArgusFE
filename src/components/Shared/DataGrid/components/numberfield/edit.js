import React, { useState } from 'react'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import IconButton from '@mui/material/IconButton'
import PercentIcon from '@mui/icons-material/Percent'
import PinIcon from '@mui/icons-material/Pin'
import InputAdornment from '@mui/material/InputAdornment'
import ClearIcon from '@mui/icons-material/Clear'

export default function NumberfieldEdit({ column: { props }, id, field, value, update }) {
  const [isPercentIcon, setIsPercentIcon] = useState(true)

  const handleIconClick = () => {
    setIsPercentIcon(!isPercentIcon)
    props.iconsClicked(isPercentIcon, id)
  }

  return (
    <CustomNumberField
      value={value}
      label={''}
      readOnly={props?.readOnly}
      decimalScale={props?.decimalScale}
      autoFocus
      hasBorder={false}
      onChange={e => {
        update({
          id,
          field,
          value: e.target.value ? Number(e.target.value) : ''
        })
      }}
      {...props}
      InputProps={{
        endAdornment: (
          <InputAdornment position='end'>
            <IconButton onClick={() => update({ id, field, value: '' })}>
              <ClearIcon />
            </IconButton>
            {props?.ShowDiscountIcons && (
              <IconButton onClick={handleIconClick}>{isPercentIcon ? <PercentIcon /> : <PinIcon />}</IconButton>
            )}
          </InputAdornment>
        )
      }}
      sx={{
        flexGrow: 1,
        border: 'none',
        '& .MuiOutlinedInput-root': {
          borderRadius: 0,
          '& fieldset': {
            border: 'none'
          }
        }
      }}
    />
  )
}
