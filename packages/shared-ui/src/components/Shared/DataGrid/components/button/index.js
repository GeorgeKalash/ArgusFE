import { Button } from '@mui/material'
import styles from './button.module.css'

function DataGridButton({ data, column: { props, field, ...column }, update, updateRow, isEditMode }) {
  const checkCondition = props?.onCondition && props?.onCondition(data)
  const imgSrc = !props?.imgSrc ? checkCondition?.imgSrc : props?.imgSrc
  const hiddenButton = checkCondition?.hidden || false
  const bgColor = props?.color

  return (
    !hiddenButton && (
      <Button
        className={styles.gridButton}
        autoFocus={isEditMode}
        onClick={e => {
          column?.onClick(e, data, update, updateRow)
        }}
        variant={bgColor || !imgSrc ? 'contained' : ''}
        disabled={checkCondition?.disabled}
        sx={
          bgColor && !checkCondition?.disabled
            ? {
                '&&': { backgroundColor: bgColor },
                '&&:hover': { backgroundColor: bgColor, opacity: 0.7 }
              }
            : undefined
        }
      >
        <img
          src={imgSrc || '/images/buttonsIcons/popup.png'}
          className={styles.gridButtonImage}
          alt='popup'
        />
      </Button>
    )
  )
}

export default {
  view: props => <DataGridButton {...props} isEditMode={false} />,
  edit: props => <DataGridButton {...props} isEditMode={true} />
}
