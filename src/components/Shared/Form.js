import { Box, DialogContent } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import WindowToolbar from './WindowToolbar'

// import TransactionLog from './TransactionLog'
import { TrxType } from 'src/resources/AccessLevels'
import { useWindow } from 'src/windows'
import { RequestsContext } from 'src/providers/RequestsContext'

function LoadingOverlay() {
  return (
    <Box
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        backgroundColor: 'rgba(250, 250, 250, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    ></Box>
  )
}

export default function Form({
  form,

  // isSaved = true,

  // isInfo = true,

  // isCleared = true,
  isSavedClear = true,
  children,
  editMode,

  // disabledSubmit,
  // disabledSavedClear,
  // infoVisible = true,
  // postVisible = false,
  // resourceId,

  // functionId,
  maxAccess,

  // isPosted = false,
  // isClosed = false,
  // clientRelation = false,
  // addClientRelation = false,
  // previewReport = false,
  // onClear,
  previewBtnClicked = () => {},

  // visibleClear,
  // actions,

  // windowToolbarVisible,
  isParentWindow = true,
  fullSize = false,
  ...props
}) {
  // const { stack } = useWindow()
  const { loading } = useContext(RequestsContext)
  const [showOverlay, setShowOverlay] = useState(false)

  const windowToolbarVisible = props.editMode
    ? maxAccess < TrxType.EDIT
      ? false
      : true
    : maxAccess < TrxType.ADD
    ? false
    : true

  useEffect(() => {
    if (maxAccess || maxAccess === undefined) {
      if (!loading && editMode) {
        const timer = setTimeout(() => {
          setShowOverlay(true)
        }, 150)

        return () => clearTimeout(timer)
      } else if (!editMode && !loading) {
        const timer = setTimeout(() => {
          setShowOverlay(true)
        }, 50)

        return () => clearTimeout(timer)
      }
    }
  }, [loading, editMode, maxAccess])

  return (
    <>
      <DialogContent
        sx={{
          display: 'flex !important',
          flex: 1,
          flexDirection: 'column',
          overflow: 'auto',
          position: 'relative',
          py: 0,
          ...(fullSize
            ? { p: '0 !important' }
            : {
                '& .MuiBox-root': {
                  pt: `${isParentWindow ? 7 : 2}px !important`,
                  px: '0 !important',
                  pb: '0 !important'
                }
              })
        }}
        onKeyDown={e => {
          const target = e.target
          const role = target.getAttribute('role') || ''
          const isSearchField = target.getAttribute('data-search') === 'true'

          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault()
            form?.submitForm?.()
            if (props.onSave) {
              props.onSave()
            }

            return
          }
          if (e.key === 'Enter') {
            if (isSearchField) {
              return
            }
            const isDropDownOpen = target.getAttribute('aria-expanded') === 'true'

            const isEqual = (role === 'combobox' && isDropDownOpen) || role === 'gridcell'
            console.log('test', isEqual)
            if (!isEqual) {
              e.preventDefault()
              form?.submitForm?.()
              if (props.onSave) {
                props.onSave()
              }
            }
          }
        }}
      >
        {!showOverlay && LoadingOverlay()}
        {children}
      </DialogContent>
      {windowToolbarVisible && (
        <WindowToolbar
          // form={form}
          // previewBtnClicked={previewBtnClicked}
          // print={print}
          // onSave={() => {
          //   form?.handleSubmit()
          // }}
          // onSaveClear={() => {
          //   handleSaveAndClear()
          // }}
          // onClear={() => handleReset()}
          // onInfo={() =>
          //   stack({
          //     Component: TransactionLog,
          //     props: {
          //       recordId: form.values?.recordId ?? form.values.clientId,
          //       resourceId: resourceId
          //     }
          //   })
          // }

          {...props}

          // isSaved={isSaved}
          // isSavedClear={isSavedClearVisible}

          // isCleared={isCleared}
          // actions={actions}
          // editMode={editMode}
          // disabledSubmit={disabledSubmit}
          // disabledSavedClear={disabledSavedClear || disabledSubmit}
          // infoVisible={infoVisible}
          // postVisible={postVisible}
          // isPosted={isPosted}
          // isClosed={isClosed}
          // clientRelation={clientRelation}
          // addClientRelation={addClientRelation}
          // resourceId={resourceId}
          // recordId={form?.values?.recordId}
          // previewReport={previewReport}
          // visibleClear={visibleClear}
          // functionId={functionId}
          // maxAccess={maxAccess}
        />
      )}
    </>
  )
}
