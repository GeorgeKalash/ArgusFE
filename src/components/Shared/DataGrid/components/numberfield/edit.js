import { useContext, useRef, useState } from 'react'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemChecks } from 'src/resources/SystemChecks'

export default function NumberfieldEdit({ id, column: { props, field }, value, data, update, updateRow }) {
  const { systemChecks } = useContext(ControlContext)
  const viewDecimals = systemChecks.some(check => check.checkId === SystemChecks.HIDE_LEADING_ZERO_DECIMALS)

  const typing = useRef(false)

  const handleIconClick = () => {
    props?.iconsClicked({ updateRow, value, data })
  }

  const formatValue = val => {
    if (!val) return ''
    if (typeof val === 'string') {
      val = val.replace(/,/g, '')
    }
    if (isNaN(val)) return val

    let num = Number(val).toString()

    return num.replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1')
  }

  return (
    <CustomNumberField
      value={viewDecimals ? (typing.current ? value?.[field] : formatValue(value?.[field])) : value?.[field]}
      label={''}
      readOnly={props?.readOnly}
      decimalScale={props?.decimalScale}
      autoFocus
      hasBorder={false}
      onChange={e => {
        typing.current = true
        update({
          id,
          field,
          value: e.target.value
        })
      }}
      onClear={() => {
        typing.current = false
        update({
          id,
          field,
          value: ''
        })
      }}
      onBlur={() => {
        typing.current = false
      }}
      handleButtonClick={handleIconClick}
      {...props}
      isPercentIcon={props?.isPercentIcon && props?.isPercentIcon({ value, data })}
    />
  )
}
