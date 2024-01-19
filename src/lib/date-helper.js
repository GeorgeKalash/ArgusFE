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

  const parsedDate = new Date(date);

  // Format the date as "yyyy-MM-dd"
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(parsedDate.getDate()).padStart(2, '0');

  const formattedDateYYYYMMDD = `${year}-${month}-${day}`;

  return formattedDateYYYYMMDD;
 }


export {
    formatDateFromApi,
    formatDateToApi,
    formatDateToApiFunction
}
