// ** React Imports
import { createContext, useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

const MenuContext = createContext()

const MenuProvider = ({ children }) => {

    const { getRequest } = useContext(RequestsContext)

    const [menu, setMenu] = useState([])

    const getMenu = async () => {
        var parameters = '_filter='
        getRequest({
            'extension': SystemRepository.get2AM,
            'parameters': parameters,
        })
            .then(async (get2AMRes) => {
                const builtMenu = await buildMenu(get2AMRes.record.folders, get2AMRes.record.commandLines)
                setMenu(builtMenu)
            })
            .catch((error) => {
                console.log({ error: error })
            })
    }

    const buildMenu = async (folders, commandLines, parentId = 0) => {
        const menu = []

        folders
            .filter((folder) => folder.parentId === parentId)
            .forEach(async (folder) => {
                const folderItem = {
                    title: folder.name,

                    //use later for starred
                    // badgeContent: 'new',
                    // badgeColor: 'error',
                    // icon: folder.iconName,
                    icon: 'mdi:home-outline',
                    children: [],
                }

                folderItem.children = await buildMenu(folders, commandLines, folder.id)

                commandLines
                    .filter((commandLine) => commandLine.folderId === folder.id)
                    .forEach((commandLine) => {
                        folderItem.children.push({
                            title: commandLine.name,
                            path: '/' + commandLine.api,
                            icon: 'mdi:apps',
                        })
                    })

                menu.push(folderItem)
            })

        return menu
    }


    useEffect(() => {
        getMenu()
    }, [])

    const values = {
        menu
    }

    return <MenuContext.Provider value={values}>{children}</MenuContext.Provider>
}

export { MenuContext, MenuProvider }
