// ** Third Party Imports
import dayjs from 'dayjs'

const formatDateFromApi = (date) => {
  console.log(date)
    const timestamp = parseInt(date.match(/\d+/)[0], 10);

    return dayjs(timestamp)
}

const formatDateToApi = (date) => {

    const timestamp = date.valueOf();

    return `/Date(${timestamp})/`
}

export {
    formatDateFromApi,
    formatDateToApi
}
