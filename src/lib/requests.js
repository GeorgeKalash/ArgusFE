import axios from "axios";


const getRequest = async (body) => {

    return axios({
        method: 'GET',
        url: process.env.BASE_URL + body.service + body.extension + '?' + body.parameters,
        headers: {
            // 'Authorization': 'Bearer ' + accessToken,
            "Content-Type": "multipart/form-data",
        },
    }).then(res => res.data)
};

const postRequest = async (body) => {

    var bodyFormData = new FormData();
    bodyFormData.append('record', body.record)

    return axios({
        method: 'POST',
        url: process.env.BASE_URL + body.service + body.extension,
        headers: {
            // 'authorization': 'Bearer ' + accessToken,
            "Content-Type": "multipart/form-data",
        },
        data: bodyFormData,
    }).then(res => res.data)
};

export {
    getRequest,
    postRequest
}