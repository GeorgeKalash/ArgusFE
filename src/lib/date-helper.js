// import moment from 'moment';
import { format } from 'date-fns'

function timeStamptoDate(timestamp) {
  const timezoneOffset = -new Date().getTimezoneOffset()
  const sign = timezoneOffset >= 0 ? '+' : '-'

  const timeZoneHours = Math.floor(Math.abs(timezoneOffset) / 60)
    .toString()
    .padStart(2, '0')
  const timeZoneMin = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0')
  const isoTimeZone = `${sign}${timeZoneHours}:${timeZoneMin}`
  const timestampWithTimezone = `${new Date(timestamp).toUTCString()}${isoTimeZone}`
  const dateWithTimezone = new Date(timestampWithTimezone)

  return dateWithTimezone
}

function dateToTimeStamp(date) {
  let timezoneOffset = new Date().getTimezoneOffset()

  const sign = timezoneOffset >= 0 ? '+' : '-'

  const timeZoneHours = Math.floor(Math.abs(timezoneOffset) / 60)
    .toString()
    .padStart(2, '0')
  const timeZoneMin = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0')
  const isoTimeZone = `${sign}${timeZoneHours}:${timeZoneMin}`

  const timestampWithTimezone = `${date.toUTCString()}${isoTimeZone}`
  const dateWithTimezone = new Date(timestampWithTimezone)

  return dateWithTimezone
}

const formatDateFromApi = date => {
  const timestamp = date && parseInt(date.match(/-?\d+/)[0], 10)

  return timestamp ? timeStamptoDate(timestamp) : null
}

/**
 * @deprecated this was removed because inline component is removed
 */
const formatDateFromApiInline = date => {
  const [day, month, year] = date.split('/')
  const parsedDate = new Date(year, month - 1, day)
  const timestamp = parsedDate.getTime()

  return timestamp
}

const formatDateToApi = date => {
  const timestamp = date && dateToTimeStamp(new Date(date)).valueOf()

  return `/Date(${timestamp})/`
}

//should be edited??
const formatDateToApiFunction = value => {
  var date = value
  date = new Date(date)
  date = date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  const parsedDate = new Date(date)

  // Format the date as "yyyy-MM-dd"
  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0') // Months are 0-based
  const day = String(parsedDate.getDate()).padStart(2, '0')

  const formattedDateYYYYMMDD = `${year}-${month}-${day}`

  return formattedDateYYYYMMDD
}

function formatDateDefault(date) {
  return formatDateandTime(date)
}

function formatDateandTime(date, recFormat) {
  if (!date) return

  let formats = JSON.parse(window.localStorage.getItem('default') && window.localStorage.getItem('default'))[
    'dateFormat'
  ]
  formats = recFormat ? `${formats} ` + recFormat : formats
  const timestamp = date instanceof Date ? date.getTime() : parseInt(date?.match(/\d+/)[0], 10)
  const formattedDate = format(timeStamptoDate(timestamp), formats)

  return formattedDate
}

function formatDateTimeDefault(date) {
  return formatDateandTime(date, 'hh:mm a')
}

function formatTimestampToDate(timestamp) {
  if (!timestamp) return

  const formats = JSON.parse(window.localStorage.getItem('default') && window.localStorage.getItem('default'))[
    'dateFormat'
  ]
  const formattedDate = format(new Date(timestamp), formats)

  return formattedDate
}
function getTimeInTimeZone(dateString, timeZone = 0) {
  const timestamp = parseInt(dateString?.match(/\/Date\((\d+)\)\//)[1], 10)
  const currentDate = new Date(timestamp)

  currentDate.setHours(currentDate.getHours() + timeZone)
  function padNumber(num) {
    return num < 10 ? '0' + num : num
  }

  let newHours = padNumber(currentDate.getHours())
  let newMinutes = padNumber(currentDate.getMinutes())
  let newSeconds = padNumber(currentDate.getSeconds())

  return `${newHours}:${newMinutes}:${newSeconds}`
}

const formatDate = dateString => {
  const date = new Date(dateString)
  const timestamp = date.getTime()

  return `/Date(${timestamp})/`
}

export {
  formatDateFromApi,
  formatDateToApi,
  formatDateToApiFunction,
  formatDateDefault,
  formatTimestampToDate,
  formatDateFromApiInline,
  getTimeInTimeZone,
  formatDate,
  formatDateTimeDefault
}
