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
function formatDateForGetApI(dateString) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}-${month}-${day}`
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

function getTimeInTimeZone(dateString, type = '') {
  const timestamp = parseInt(dateString?.match(/\/Date\((\d+)\)\//)[1], 10)
  const date = new Date(timestamp)
  let hours = ''
  let minutes = ''
  let seconds = ''

  if (type === 'utc') {
    hours = date.getHours()
    minutes = date.getMinutes()
    seconds = date.getSeconds()
  } else {
    hours = date.getUTCHours()
    minutes = date.getUTCMinutes()
    seconds = date.getUTCSeconds()
  }

  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds

  return `${hours}:${minutes}:${seconds}`
}

//Omar
const formatDate = dateString => {
  const date = new Date(dateString)
  const timestamp = date.getTime()

  return `/Date(${timestamp})/`
}

export {
  formatDateFromApi,
  formatDateToApi,
  formatDateForGetApI,
  formatDateDefault,
  formatTimestampToDate,
  formatDateFromApiInline,
  getTimeInTimeZone,
  formatDate,
  formatDateTimeDefault
}
