import React, { forwardRef, useRef, useState, useImperativeHandle } from 'react'
import Checkbox from '@mui/material/Checkbox'

export const CheckboxFilter = forwardRef((props, ref) => {
  const activeRef = useRef(false)

  useImperativeHandle(
    ref,
    () => ({
      doesFilterPass(params) {
        return params.data?.[props.colDef.field] === true
      },
      isFilterActive() {
        return activeRef.current
      },
      getModel() {
        return activeRef.current
          ? { value: true }
          : null
      },
      setModel(model) {
        activeRef.current = model?.value === true
      },
      toggle(next) {
        activeRef.current = next

        props.filterChangedCallback()
      }
    }),
    [props.colDef.field, props.filterChangedCallback]
  )

  return null
})

CheckboxFilter.displayName = 'CheckboxFilter'

export const CheckboxFloatingFilter = forwardRef((props, ref) => {
  const [active, setActive] = useState(false)

  useImperativeHandle(ref, () => ({
    onParentModelChanged(model) {
      setActive(model?.value === true)
    }
  }))

  const handleChange = e => {
    const next = e.target.checked

    setActive(next)

    props.parentFilterInstance(instance => {
      instance.toggle(next)
    })
  }

  return (
    <div
      onPointerDown={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}
    >
      <Checkbox
        size='small'
        checked={active}
        onChange={handleChange}
      />
    </div>
  )
})

CheckboxFloatingFilter.displayName = 'CheckboxFloatingFilter'