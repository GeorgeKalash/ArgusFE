// ** React Imports
import { createContext, useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

const MenuContext = createContext()

const MenuProvider = ({ children }) => {

    let { getRequest } = useContext(RequestsContext)

    const [commandLines, setCommandLines] = useState([])
    const [folders, setFolders] = useState([])

    const getMenu = async () => {
        var parameters = '_filter='
        getRequest({
            'extension': SystemRepository.get2AM,
            'parameters': parameters,
        })
            .then((get2AMRes) => {
                console.log({ get2AMRes })
                setCommandLines(get2AMRes.record.commandLines)
                setFolders(get2AMRes.record.folders)
            })
            .catch((error) => {
                console.log({ error: error.response.data })
            })
    }

    useEffect(() => {
        getMenu()
    }, [])

    const values = {
        commandLines,
        folders,
    }

    return <MenuContext.Provider value={values}>{children}</MenuContext.Provider>
}

export { MenuContext, MenuProvider }
