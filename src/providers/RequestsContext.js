// ** React Imports
import { createContext, useContext } from 'react'

// ** 3rd Party Imports
import axios from "axios"
import jwt from 'jwt-decode'

import { AuthContext } from 'src/providers/AuthContext'

const RequestsContext = createContext()

const RequestsProvider = ({ children }) => {

    const { user } = useContext(AuthContext)

    const getRequest = async (body) => {

        const accessToken = await getAccessToken()

        return axios({
            method: 'GET',
            url: process.env.NEXT_PUBLIC_BASE_URL + body.extension + '?' + body.parameters,
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                "Content-Type": "multipart/form-data",
            },
        }).then(res => res.data)
    }

    const postRequest = async (body) => {

        const accessToken = await getAccessToken()

        var bodyFormData = new FormData()
        bodyFormData.append('record', body.record)

        return axios({
            method: 'POST',
            url: process.env.NEXT_PUBLIC_BASE_URL + body.extension,
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                "Content-Type": "multipart/form-data",
            },
            data: bodyFormData,
        }).then(res => res.data)
    }

    const getAccessToken = async () => {
        return new Promise(async (resolve) => {

            if (user.expiresAt !== null) {

                var dateNow = new Date()

                if (user.expiresAt < Math.trunc(dateNow.getTime() / 1000)) {

                    var bodyFormData = new FormData()
                    bodyFormData.append('record', JSON.stringify({ "accessToken": user.accessToken, "refreshToken": user.refreshToken }))

                    try {
                        const res = await axios({
                            method: 'POST',
                            url: process.env.NEXT_PUBLIC_AuthURL + 'MA.asmx/' + 'newAT',
                            headers: {
                                'authorization': 'Bearer ' + user.accessToken,
                                "Content-Type": "multipart/form-data",
                            },
                            data: bodyFormData,
                        })

                        let newUser = {
                            ...user,
                            accessToken: res.data.record.accessToken,
                            refreshToken: res.data.record.refreshToken,
                            expiresAt: jwt(res.data.record.accessToken).exp,
                        }

                        if (window.localStorage.getItem('userData'))
                            window.localStorage.setItem('userData', JSON.stringify(newUser))

                        else
                            window.sessionStorage.setItem('userData', JSON.stringify(newUser))

                        resolve(res.data.record.accessToken)
                    } catch {
                        resolve('error getting new Access Token')
                    }
                } else
                    resolve(user.accessToken)
            } else
                resolve(null)
        })
    }

    const values = {
        getRequest,
        postRequest,
    }

    return <RequestsContext.Provider value={values}>{children}</RequestsContext.Provider>
}

export { RequestsContext, RequestsProvider }
