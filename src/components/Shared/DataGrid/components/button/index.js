import { Button } from '@mui/material'

function DataGridButton({ data, column: { props, field, ...column }, update, updateRow, isEditMode }) {
  const checkCondition = props?.onCondition && props?.onCondition(data)
  const imgSrc = !props?.imgSrc ? checkCondition?.imgSrc : props?.imgSrc
  const hiddenButton = checkCondition?.hidden || false

  return (
    !hiddenButton && (
      <Button
        sx={{
          opacity: 1,
          '&:hover': { opacity: 0.7 },
          width: '10px !important',
          height: '30px',
          objectFit: 'contain'
        }}
        autoFocus={isEditMode}
        onClick={e => {
          column?.onClick(e, data, update, updateRow)
        }}
        variant={!!imgSrc ? '' : 'contained'}
        disabled={checkCondition?.disabled}
      >
        {!!imgSrc ? (
          <img
            src={imgSrc}
            sx={{
              height: '10px'
            }}
            alt='popup'
          />
        ) : (
          <img
            src='/images/buttonsIcons/popup.png'
            sx={{
              height: '10px'
            }}
            alt='popup'
          />
        )}
      </Button>
    )
  )
}

export default {
  view: props => <DataGridButton {...props} isEditMode={false} />,
  edit: props => <DataGridButton {...props} isEditMode={true} />
}
