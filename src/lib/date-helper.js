// ** Third Party Imports
import dayjs from 'dayjs'

// import moment from 'moment';
import { compareAsc, format } from 'date-fns'

const formatDateFromApi = date => {
  const timestamp = date && parseInt(date.match(/\d+/)[0], 10)

  return timestamp ? new Date(timestamp) : null
}

const formatDateFromApiInline = date => {
  const [day, month, year] = date.split('/')
  const parsedDate = new Date(year, month - 1, day)
  const timestamp = parsedDate.getTime()

  return timestamp
}

const formatDateToApi = date => {
  const timestamp = date && date.valueOf()

  return `/Date(${timestamp})/`
}

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
  if (!date) return

  const formats = JSON.parse(window.localStorage.getItem('default') && window.localStorage.getItem('default'))[
    'dateFormat'
  ]
  const timestamp = date instanceof Date ? date.getTime() : parseInt(date?.match(/\d+/)[0], 10)
  const formattedDate = format(new Date(timestamp), formats)

  return formattedDate
}

function formatTimestampToDate(timestamp) {
  if (!timestamp) return

  const formats = JSON.parse(window.localStorage.getItem('default') && window.localStorage.getItem('default'))[
    'dateFormat'
  ]
  const formattedDate = format(new Date(timestamp), formats)

  return formattedDate
}
// function getTimeInTimeZone(dateString, timeZone = 0) {
//   const timestamp = parseInt(dateString?.match(/\/Date\((\d+)\)\//)[1], 10)
//   const currentDate = new Date(timestamp)

//   currentDate.setHours(currentDate.getHours() + timeZone)
//   function padNumber(num) {
//     return num < 10 ? '0' + num : num
//   }

//   let newHours = padNumber(currentDate.getHours())
//   let newMinutes = padNumber(currentDate.getMinutes())
//   let newSeconds = padNumber(currentDate.getSeconds())

//   return `${newHours}:${newMinutes}:${newSeconds}`
// }

function getTimeInTimeZone({ date, suffixAmPm = false, secondVisible = true, timeZoneValue = '' }) {
  const timestamp = parseInt(date?.match(/\/Date\((\d+)\)\//)[1], 10)
  const currentDate = new Date(timestamp)

  console.log('dateString', suffixAmPm, date)
  const timeZone =
    timeZoneValue ||
    JSON.parse(window.localStorage.getItem('default') && window.localStorage.getItem('default'))['timeZone']

  currentDate.setHours(currentDate.getHours() - timeZone)
  function padNumber(num) {
    return num < 10 ? '0' + num : num
  }

  let newHours = padNumber(currentDate.getHours())
  let newMinutes = padNumber(currentDate.getMinutes())
  let newSeconds = padNumber(currentDate.getSeconds())
  const suffix = newHours >= 12 ? 'pm' : 'am'

  if (suffixAmPm) {
    const adjustedHours = newHours % 12 || 12

    newHours = String(adjustedHours).padStart(2, '0')
    newMinutes = String(newMinutes).padStart(2, '0')
    newSeconds = String(newSeconds).padStart(2, '0')
  }

  return `${newHours}:${newMinutes}${(secondVisible && ':' + newSeconds) || ''}${(suffixAmPm && ' ' + suffix) || ''}`
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
  formatDate
}
