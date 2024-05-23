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
function getTimeInTimeZone(dateString, timeZone = 0) {
  const timestamp = parseInt(dateString.match(/\/Date\((\d+)\)\//)[1], 10)
  const currentDate = new Date(timestamp)
  let currentHours = currentDate.getHours()
  let currentMinutes = currentDate.getMinutes()
  let currentSeconds = currentDate.getSeconds()

  console.log(`Current Time: ${currentHours}:${currentMinutes}:${currentSeconds}`)

  // Step 3: Add 3 hours to the current date and time
  currentDate.setHours(currentDate.getHours() + timeZone)
  function padNumber(num) {
    return num < 10 ? '0' + num : num
  }

  // Extract the new time from the updated date
  let newHours = padNumber(currentDate.getHours())
  let newMinutes = padNumber(currentDate.getMinutes())
  let newSeconds = padNumber(currentDate.getSeconds())

  return `${newHours}:${newMinutes}:${newSeconds}`
}

export {
  formatDateFromApi,
  formatDateToApi,
  formatDateToApiFunction,
  formatDateDefault,
  formatTimestampToDate,
  formatDateFromApiInline,
  getTimeInTimeZone
}
