import { Box, DialogContent } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import WindowToolbar from './WindowToolbar'
import { TrxType } from '@argus/shared-domain/src/resources/AccessLevels'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'

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

export default function Form({ children, isParentWindow = true, isSaved = true, fullSize = false, ...props }) {
  const { loading } = useContext(RequestsContext)
  const [showOverlay, setShowOverlay] = useState(false)
  const editMode = props.editMode
  const maxAccess = props.maxAccess
  const form = props?.form

  const windowToolbarVisible = editMode
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
                  pt: `${isParentWindow ? 7 : 3}px !important`,
                  px: '0 !important',
                  pb: '0 !important'
                }
              })
        }}
        onKeyDown={e => {
          const target = e.target

          const role = target.getAttribute('role') || ''
          const isSearchField = target.getAttribute('data-search') === 'true'

          if (
            (e.ctrlKey || e.metaKey) &&
            e.key.toLowerCase() === 's' &&
            !props.isPosted &&
            !props.isClosed &&
            !props.disabledSubmit
          ) {
            e.preventDefault()
            if (props?.onSave) {
              props.onSave()
            } else {
              form?.submitForm?.()
            }

            return
          }

          if (target.tagName === 'TEXTAREA' && !target?.closest(':read-only, [aria-readonly="true"]')?.readOnly) {
            return
          }

          const aria = target.getAttribute('aria-label') || ''
          if (role === 'textbox' && aria === 'rdw-editor') return

          if (e.key === 'Enter') {
            if (isSearchField || props.disabledSubmit) {
              return
            }
            const isDropDownOpen = target.getAttribute('aria-expanded') === 'true'

            const isEqual = (role === 'combobox' && isDropDownOpen) || role === 'gridcell'
            if (!isEqual) {
              e.preventDefault()
              if (props.onSave) {
                props?.onSave()
              } else {
                form?.submitForm?.()
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
          {...props}
          isSaved={isSaved}
          onSave={() => {
            if (props.onSave) {
              props.onSave()
            } else {
              form?.submitForm?.()
            }
          }}
        />
      )}
    </>
  )
}
