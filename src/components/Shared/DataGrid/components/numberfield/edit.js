import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function NumberfieldEdit({ id, column: { props, field }, value, update, updateRow }) {
  const isPercentIcon = props?.gridData ? props?.gridData[id - 1]?.mdType === 1 : false

  const handleIconClick = () => {
    props?.iconsClicked(id, updateRow)
  }

  return (
    <CustomNumberField
      value={value?.[field]}
      label={''}
      readOnly={props?.readOnly}
      decimalScale={props?.decimalScale}
      autoFocus
      hasBorder={false}
      onChange={e => {
        update({
          id,
          field,
          value: e.target.value || ''
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
