function ImageComponent({ value, column }) {
  const imageUrl = value?.[column.field]

  return (
    <img
      src={imageUrl || null}
      alt=''
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        cursor: 'pointer'
      }}
    />
  )
}

export default {
  view: props => <ImageComponent {...props} value={props.data} />,
  edit: props => <ImageComponent {...props} value={props.data} />
}