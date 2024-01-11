// ** Third Party Imports
import dayjs from 'dayjs'

const formatDateFromApi = (date) => {

    const timestamp = date && parseInt(date.match(/\d+/)[0], 10);

    return dayjs(timestamp)
}

const formatDateToApi = (date) => {

    const timestamp = date &&  date.valueOf();

    return `/Date(${timestamp})/`
}

const   formatDateToApiFunction = (value)=>{

  var date =  value
    date  = new Date(date)
    date = date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return date
 }


export {
    formatDateFromApi,
    formatDateToApi,
    formatDateToApiFunction
}
