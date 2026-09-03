import React, { forwardRef, useRef, useState, useEffect, useImperativeHandle, useContext } from 'react'
import { TextField, InputAdornment, IconButton } from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { format } from 'date-fns'
import {
  formatDateFromApi,
  formatDateToApi,
  formatDateDefault,
  formatDateTimeDefault
} from '@argus/shared-domain/src/lib/date-helper'
import { CommonContext } from '@argus/shared-providers/src/providers/CommonContext'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'

const getDateFormat = () => {
  const defaultSettings = JSON.parse(window.localStorage.getItem('default') || '{}')
  return defaultSettings.dateFormat || 'dd/MM/yyyy'
}

export const DateFilter = forwardRef((props, ref) => {
  const dateRef = useRef(null)

  const parseRawDate = value => {
    const parsed = value ? formatDateFromApi(value) : null
    return parsed ? parsed.getTime() : null
  }

  useImperativeHandle(
    ref,
    () => ({
      doesFilterPass(params) {
        const selected = dateRef.current
        if (!selected) return true

        const rawValue = params.data?.[props.colDef.field]
        const cellValue = parseRawDate(rawValue)
        if (cellValue == null) return false

        const cellDate = new Date(cellValue)
        const cellMonth = cellDate.getUTCMonth()
        const cellDay = cellDate.getUTCDate()

        if (selected.isMonthOnly) {
          return cellMonth === selected.monthIndex
        }

        if (selected.isDayOnly) {
          return cellMonth === selected.monthIndex && String(cellDay).startsWith(String(selected.day))
        }

        const cellDateOnly = Date.UTC(cellDate.getUTCFullYear(), cellMonth, cellDay)
        const filterDateOnly = Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth(), selected.getUTCDate())

        return cellDateOnly === filterDateOnly
      },
      isFilterActive() {
        return dateRef.current != null
      },
      getModel() {
        if (!dateRef.current) return null
        if (dateRef.current.isMonthOnly) {
          return { isMonthOnly: true, monthIndex: dateRef.current.monthIndex }
        }
        if (dateRef.current.isDayOnly) {
          return { isDayOnly: true, monthIndex: dateRef.current.monthIndex, day: dateRef.current.day }
        }
        return { date: dateRef.current.toISOString() }
      },
      setModel(model) {
        if (!model) {
          dateRef.current = null
        } else if (model.isMonthOnly) {
          dateRef.current = { isMonthOnly: true, monthIndex: model.monthIndex }
        } else if (model.isDayOnly) {
          dateRef.current = { isDayOnly: true, monthIndex: model.monthIndex, day: model.day }
        } else {
          dateRef.current = model.date ? new Date(model.date) : null
        }
      },
      setDate(date) {
        dateRef.current = date
        props.filterChangedCallback()
      },
      getDate() {
        return dateRef.current
      }
    }),
    [props.valueGetter, props.filterChangedCallback]
  )

  return null
})

DateFilter.displayName = 'DateFilter'

export const DateFloatingFilter = forwardRef((props, ref) => {
  const { getAllKvsByDataset } = useContext(CommonContext)

  const [filterModel, setFilterModel] = useState(null)
  const [text, setText] = useState('')
  const [months, setMonths] = useState([])
  const nativeInputRef = useRef(null)
  const isFocusedRef = useRef(false)

  useEffect(() => {
    getAllKvsByDataset({
      _dataset: DataSets.MONTHS,
      callback: result => {
        if (result) {
          const sorted = [...result].sort((a, b) => Number(a.key) - Number(b.key))
          setMonths(sorted)
        }
      }
    })
  }, [])

  const getMonthLabel = monthIndex => months[monthIndex]?.value ?? ''
  const findMonthIndex = value => months.findIndex(m => m.value?.toLowerCase() === value.toLowerCase().slice(0, 3))

  const dateFormatter = value =>
    props.colDef?.dateFormat
      ? formatDateTimeDefault(value, props.colDef.dateFormat)
      : formatDateDefault(value)

  const formatDisplayDate = model => {
    if (!model) return ''
    if (model.isMonthOnly) {
      return getMonthLabel(model.monthIndex)
    }
    if (model.isDayOnly) {
      return `${getMonthLabel(model.monthIndex)} ${model.day}`
    }
    return model instanceof Date ? dateFormatter(formatDateToApi(model)) : ''
  }

  const toInputDateString = d => {
    if (!d || !(d instanceof Date) || isNaN(d.getTime())) return ''
    const year = d.getUTCFullYear()
    const month = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const parseNumericDate = trimmed => {
    const numericMatch = trimmed.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})$/)
    if (!numericMatch) return null

    const [, a, b, yearStr] = numericMatch
    const dateFormat = getDateFormat().trim()
    const isDayFirst = /^d/i.test(dateFormat)

    const day = parseInt(isDayFirst ? a : b, 10)
    const monthIndex = parseInt(isDayFirst ? b : a, 10) - 1

    if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return null

    let year = parseInt(yearStr, 10)
    if (yearStr.length <= 2) year += 2000

    const parsed = new Date(Date.UTC(year, monthIndex, day))
    if (isNaN(parsed.getTime()) || parsed.getUTCDate() !== day || parsed.getUTCMonth() !== monthIndex) return null

    return parsed
  }

  const parseTypedDate = value => {
    if (!value || !value.trim()) return null
    const trimmed = value.trim()

    const numericParsed = parseNumericDate(trimmed)
    if (numericParsed) return numericParsed

    const monthOnlyMatch = trimmed.match(/^([A-Za-z]{3,})$/)
    if (monthOnlyMatch) {
      const monthIndex = findMonthIndex(monthOnlyMatch[1])
      if (monthIndex !== -1) {
        return { isMonthOnly: true, monthIndex }
      }
    }

    const match = trimmed.match(/^([A-Za-z]{3,})\.?\s+(\d{1,2})(?:,?\s*(\d{2,4}))?$/)
    if (!match) return null

    const [, monStr, dayStr, yearStr] = match
    const monthIndex = findMonthIndex(monStr)
    if (monthIndex === -1) return null

    const day = parseInt(dayStr, 10)
    if (day < 1 || day > 31) return null

    if (!yearStr) {
      return { isDayOnly: true, monthIndex, day }
    }

    let year = parseInt(yearStr, 10)
    if (yearStr.length <= 2) year += 2000

    const parsed = new Date(Date.UTC(year, monthIndex, day))
    if (isNaN(parsed.getTime()) || parsed.getUTCDate() !== day || parsed.getUTCMonth() !== monthIndex) return null

    return parsed
  }

  useImperativeHandle(ref, () => ({
    onParentModelChanged(model) {
      let newModel = null
      if (model?.isMonthOnly) {
        newModel = { isMonthOnly: true, monthIndex: model.monthIndex }
      } else if (model?.isDayOnly) {
        newModel = { isDayOnly: true, monthIndex: model.monthIndex, day: model.day }
      } else if (model?.date) {
        newModel = new Date(model.date)
      }
      setFilterModel(newModel)
      if (!isFocusedRef.current) {
        setText(formatDisplayDate(newModel))
      }
    }
  }))

  const commitDate = newModel => {
    setFilterModel(newModel)
    if (!newModel?.isMonthOnly && !newModel?.isDayOnly) {
      setText(formatDisplayDate(newModel))
    }
    props.parentFilterInstance(instance => {
      instance.setDate(newModel)
    })
  }

  const handleTextChange = e => {
    const value = e.target.value
    setText(value)

    const trimmed = value.trim()
    if (!trimmed) {
      commitDate(null)
      return
    }

    const parsed = parseTypedDate(trimmed)
    if (parsed) {
      commitDate(parsed)
    }
  }

  const commitFromText = () => {
    const trimmed = text.trim()

    if (!trimmed) {
      commitDate(null)
      return
    }

    const parsed = parseTypedDate(trimmed)
    if (parsed) {
      setFilterModel(parsed)
      setText(formatDisplayDate(parsed))
      props.parentFilterInstance(instance => {
        instance.setDate(parsed)
      })
    } else {
      setText(formatDisplayDate(filterModel))
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      commitFromText()
      e.target.blur()
    }
    if (e.key === 'Escape') {
      setText(formatDisplayDate(filterModel))
      e.target.blur()
    }
  }

  const handleFocus = () => {
    isFocusedRef.current = true
  }

  const handleBlur = () => {
    isFocusedRef.current = false
    commitFromText()
  }

  const openPicker = e => {
    e.stopPropagation()
    nativeInputRef.current?.showPicker ? nativeInputRef.current.showPicker() : nativeInputRef.current?.click()
  }

  const handleNativeChange = e => {
    const raw = e.target.value
    const newDate = raw ? new Date(`${raw}T00:00:00Z`) : null
    commitDate(newDate)
  }

  const placeholder = format(new Date(2016, 0, 31), getDateFormat())

  return (
    <div className='dateFloatingFilter' onPointerDown={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
      <TextField
        size='small'
        value={text}
        placeholder={placeholder}
        className='dateFloatingFilterInput'
        onChange={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={e => e.stopPropagation()}
        autoComplete='off'
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton size='small' onClick={openPicker} onMouseDown={e => e.stopPropagation()}>
                <CalendarMonthIcon fontSize='inherit' />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      <input
        ref={nativeInputRef}
        type='date'
        value={toInputDateString(filterModel)}
        className='hiddenDateInput'
        autoComplete='off'
        onChange={handleNativeChange}
        onClick={e => e.stopPropagation()}
      />
    </div>
  )
})

DateFloatingFilter.displayName = 'DateFloatingFilter'