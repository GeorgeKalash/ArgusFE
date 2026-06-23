// import moment from 'moment';
import { format } from 'date-fns'
import dayjs from 'dayjs'

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

function formatDateForGetApI(dateString) {
  return dayjs(dateString).format('YYYY-MM-DD')
}

function formatDateTimeForGetAPI(dateString) {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

function formatDateDefault(date) {
  return formatDateandTime(date);
}

function formatDateTimeDefault(date, timeFormat = 'hh:mm a', showDate = true) {
  return formatDateandTime(date, timeFormat, showDate);
}

function formatDateandTime(date, recFormat = '', showDate = true) {
  if (!date) return '';

  const defaultSettings = JSON.parse(window.localStorage.getItem('default') || '{}');
  const dateFormat = defaultSettings.dateFormat || 'dd/MM/yyyy';

  let formatString;

  if (showDate && recFormat) {
    // Date + Time
    formatString = `${dateFormat} ${recFormat}`;
  } else if (showDate) {
    // Date only
    formatString = dateFormat;
  } else {
    // Time only
    formatString = recFormat;
  }

  const timestamp =
    date instanceof Date
      ? date.getTime()
      : parseInt(date?.match(/\d+/)?.[0], 10);

  if (!timestamp) return '';

  return format(new Date(timestamp), formatString);
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

const formatDateFromISO = (timestamp) => {
  if (!timestamp) return null
  const match = /Date\((\d+)\)/.exec(timestamp)
  if (!match) return null
  const date = new Date(Number(match[1]))

  return  new Date(date.getTime() + date.getTimezoneOffset() * 60000)
}

//Used for cases that we use Json.Stringify with no initial value in fields
const formatDateToISO = date => {
  // Adjust date to keep the local time
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)

  //format
  return localDate.toISOString().slice(0, 19) + '.000Z'
}

// ✅ Format date as MM/dd/yyyy
export function formatDateMDY(date) {
  if (!date) return null
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()

  return `${month}/${day}/${year}`
}

// from yyyymmdd to Day, Month dd, yyyy
const formatDayId = dayId => {
  if (!dayId || dayId.length !== 8) return dayId
  const year = dayId.slice(0, 4)
  const month = dayId.slice(4, 6)
  const day = dayId.slice(6, 8)
  const date = new Date(`${year}-${month}-${day}`)

  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const formatTimeToApi = time => {
  return new Date(time).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// Format date as 'yyyymmdd'
const formatDateToYYYYMMDD = date => {
  if (!date) return null

  const d = new Date(date)

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

// Format date as 'yyyy/mm/dd'
const formatDateToSlashDate = dateStr => {
  if (!dateStr) return null

  const value = String(dateStr)

  return `${value.substring(0, 4)}/${value.substring(4, 6)}/${value.substring(6, 8)}`
}

const formatEEEEMMMDDYY = (apiDate) => {
  const date = formatDateFromApi(apiDate)

  if (!date) return ''

  return format(date, 'EEEE - MMM dd,yy')
}

const formatMMMDDYY = (apiDate) => {
  const date = formatDateFromApi(apiDate)

  if (!date) return ''

  return format(date, 'MMMM dd, yy')
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
  formatDateToYYYYMMDD,
  formatDateToSlashDate,
  formatDateTimeDefault,
  formatDateFromISO,
  formatDateToISO,
  formatDateTimeForGetAPI,
  formatDayId,
  formatTimeToApi,
  formatEEEEMMMDDYY,
  formatMMMDDYY
}