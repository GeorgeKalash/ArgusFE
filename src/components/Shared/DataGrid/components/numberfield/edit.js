import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function NumberfieldEdit({ id, column: { props, field }, value, update, updateRow }) {
  const isPercentIcon = props?.gridData ? props?.gridData[id - 1]?.mdType === 1 : false

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
      value={formatValue(value?.[field])}
      label={''}
      readOnly={props?.readOnly}
      decimalScale={props?.decimalScale}
      autoFocus
      hasBorder={false}
      onChange={e => {
        update({
          id,
          field,
          value: e.target.value
        })
      }}
      onClear={() =>
        update({
          id,
          field,
          value: ''
        })
      }
      handleButtonClick={handleIconClick}
      isPercentIcon={isPercentIcon}
      {...props}
    />
  )
}
