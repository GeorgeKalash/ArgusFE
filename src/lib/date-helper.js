// import moment from 'moment';
import { format } from 'date-fns'

/**
 * @deprecated this was removed because we need to send same date time even if different that asp
 */
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

/**
 * @deprecated this was removed because we need to send same date time even if different that asp
 */
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

  //return timestamp ? timeStamptoDate(timestamp) : null
  return timestamp ? new Date(timestamp) : null
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
  //const timestamp = date && dateToTimeStamp(new Date(date)).valueOf()
  const timestamp = date && date.valueOf()

  return `/Date(${timestamp})/`
}

//should be edited by Omar
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
  //used for report params
  return formatDateandTime(date)
}

function formatDateandTime(date, recFormat) {
  if (!date) return

  let formats = JSON.parse(window.localStorage.getItem('default') && window.localStorage.getItem('default'))[
    'dateFormat'
  ]
  formats = recFormat ? `${formats} ` + recFormat : formats
  const timestamp = date instanceof Date ? date.getTime() : parseInt(date?.match(/\d+/)[0], 10)

  //const formattedDate = format(timeStamptoDate(timestamp), formats)
  const formattedDate = format(timestamp, formats)

  return formattedDate
}

function formatDateTimeDefault(date) {
  return formatDateandTime(date, 'hh:mm a')
}

//Omar
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

//Omar
const formatDate = dateString => {
  const date = new Date(dateString)
  const timestamp = date.getTime()

  return `/Date(${timestamp})/`
}

//Used for cases that we use Json.Stringify with no initial value in fields
const formatDateToISO = date => {
  // Adjust date to keep the local time
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)

  //format
  return localDate.toISOString().slice(0, 19) + '.000Z'
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
  formatDateTimeDefault,
  formatDateToISO
}
