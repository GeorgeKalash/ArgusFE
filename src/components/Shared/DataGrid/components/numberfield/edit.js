import { useContext, useRef } from 'react'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemChecks } from 'src/resources/SystemChecks'

export default function NumberfieldEdit({ id, column: { props, field }, value, update, updateRow }) {
  const { systemChecks } = useContext(ControlContext)
  const viewDecimals = systemChecks.some(check => check.checkId === SystemChecks.HIDE_LEADING_ZERO_DECIMALS)
  const isPercentIcon = props?.gridData ? props?.gridData[id - 1]?.mdType === 1 : false
  const typing = useRef(false)

  const handleIconClick = () => {
    props?.iconsClicked(id, updateRow)
  }

  const formatValue = val => {
    if (!val) return ''
    if (isNaN(val)) return val

    return String(val)
      .replace(/\.0+$/, '')
      .replace(/(\.\d*?[1-9])0+$/, '$1')
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
      onMouseLeave={() => {
        typing.current = false
      }}
      handleButtonClick={handleIconClick}
      isPercentIcon={isPercentIcon}
      {...props}
    />
  )
}
