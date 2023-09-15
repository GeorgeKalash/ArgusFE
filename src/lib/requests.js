import axios from "axios"


const getRequest = async (body) => {

    return axios({
        method: 'GET',
        url: process.env.BASE_URL + body.service + body.extension + '?' + body.parameters,
        headers: {
            // 'Authorization': 'Bearer ' + accessToken,
            "Content-Type": "multipart/form-data",
        },
    }).then(res => res.data)
}

const postRequest = async (body) => {

    var bodyFormData = new FormData()
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
}

// const accessTokenHandler = async () => {

//     return new Promise((resolve) => {

//         if (store.getState().expiresAt !== null) {

//             var dateNow = new Date()

//             if (store.getState().expiresAt < Math.trunc(dateNow.getTime() / 1000)) {

//                 var bodyFormData = new FormData()
//                 bodyFormData.append('record', JSON.stringify({ "accessToken": store.getState().accessToken, "refreshToken": store.getState().refreshToken }))

//                 return axios({

//                     method: 'POST',
//                     url: store.getState().identityServerURL != '' ? store.getState().identityServerURL : 'https://identity.arguserp.net/' + 'MA.asmx/' + 'newAT',
//                     headers: {
//                         'authorization': 'Bearer ' + store.getState().accessToken,
//                         "Content-Type": "multipart/form-data",
//                     },
//                     data: bodyFormData,
//                 })
//                     .then(res => {

//                         store.dispatch({
//                             type: 'CHANGE_AUTHENTICATION',
//                             payload: {
//                                 accessToken: res.data.record.accessToken,
//                                 refreshToken: res.data.record.refreshToken,
//                                 expiresAt: jwt(res.data.record.accessToken).exp,
//                             }
//                         })
//                         resolve(res.data.record.accessToken)
//                     })
//                     .catch(() => {
//                         resolve('error getting new Access Token')
//                     })
//             } else
//                 resolve(store.getState().accessToken)
//         } else
//             resolve(null)
//     })
// }

export {
    getRequest,
    postRequest
}