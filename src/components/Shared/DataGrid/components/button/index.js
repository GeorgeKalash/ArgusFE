import { Button } from '@mui/material'

function DataGridButton({ data, column: { props, ...column }, update, updateRow, isEditMode }) {
  return (
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
      variant={!!props?.imgSrc ? '' : 'contained'}
    >
      {!!props?.imgSrc ? (
        <img
          src={props?.imgSrc}
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
}

export default {
  view: props => <DataGridButton {...props} isEditMode={false} />,
  edit: props => <DataGridButton {...props} isEditMode={true} />
}
