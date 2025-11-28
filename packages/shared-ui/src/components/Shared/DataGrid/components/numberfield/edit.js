import { useContext, useRef } from 'react'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SystemChecks } from '@argus/shared-domain/src/resources/SystemChecks'
import styles from './numberfield.module.css'   

export default function NumberfieldEdit({ id, column: { props, field }, value, data, update, updateRow }) {
  const { systemChecks } = useContext(ControlContext)
  const checkCondition = props?.onCondition && props?.onCondition(data)
  const decimalScale = checkCondition?.decimalScale ?? props?.decimalScale;
  const readOnly = checkCondition?.readOnly ?? props?.readOnly
  const viewDecimals = systemChecks.some(check => check.checkId === SystemChecks.HIDE_LEADING_ZERO_DECIMALS)
  const typing = useRef(false)

  const handleIconClick = () => {
    props?.iconsClicked({ updateRow, value, data })
  }

  const formatValue = val => {
    if (!val && val !== 0) return ''
    if (typeof val === 'string') {
      val = val.replace(/,/g, '')
    }
    if (isNaN(val)) return val

    let num = Number(val).toString()

    return num.replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1')
  }

  return (
    <CustomNumberField
      className={styles.gridNumberEditor}
      value={
        viewDecimals
          ? typing.current
            ? value?.[field]
            : formatValue(value?.[field])
          : decimalScale != undefined && !typing.current
          ? Number(value?.[field]).toFixed(decimalScale)
          : value?.[field]
      }
      label={''}
      readOnly={readOnly}
      decimalScale={decimalScale}
      autoFocus
      autoSelect
      hasBorder={false}
      iconMapIndex='1'
      onChange={(e, value) => {
        typing.current = true

        update({
          id,
          field,
          value
        })
      }}
      onClear={() => {
        typing.current = false
        update({
          id,
          field,
          value: null
        })
      }}
      onBlur={() => {
        typing.current = false
      }}
      handleButtonClick={handleIconClick}
      {...props}
      iconKey={props?.iconKey && props?.iconKey({ value, data })}
    />
  )
}
