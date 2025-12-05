import { Button } from '@mui/material'
import styles from './button.module.css'

function DataGridButton({ data, column: { props, field, ...column }, update, updateRow, isEditMode }) {
  const checkCondition = props?.onCondition && props?.onCondition(data)
  const imgSrc = !props?.imgSrc ? checkCondition?.imgSrc : props?.imgSrc
  const hiddenButton = checkCondition?.hidden || false

  return (
    !hiddenButton && (
      <Button
        className={styles.gridButton}
        autoFocus={isEditMode}
        onClick={e => {
          column?.onClick(e, data, update, updateRow)
        }}
        variant={!!imgSrc ? '' : 'contained'}
        disabled={checkCondition?.disabled}
      >
        <img
          src={imgSrc || require('@argus/shared-ui/src/components/images/buttonsIcons/popup.png').default.src}
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
