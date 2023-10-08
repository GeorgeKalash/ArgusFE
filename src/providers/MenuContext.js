// ** React Imports
import { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'

const MenuContext = createContext()

const MenuProvider = ({ children }) => {

    const { getRequest, postRequest } = useContext(RequestsContext)

    const [menu, setMenu] = useState([])

    const getMenu = async () => {
        var parameters = '_filter='
        getRequest({
            'extension': SystemRepository.get2AM,
            'parameters': parameters,
        })
            .then(async (res) => {
                const builtMenu = buildMenu(res.record.folders, res.record.commandLines)
                setMenu(builtMenu)
            })
            .catch((error) => {
                console.log({ error: error })
            })
    }

    const buildMenu = (folders, commandLines, parentId = 0) => {
        const menu = []

        folders
            .filter((folder) => folder.parentId === parentId)
            .forEach((folder) => {
                const folderItem = {
                    id: folder.id,
                    title: folder.name,
                    iconName: folder.iconName && folder.iconName,
                    icon: folder.nextIcon,
                    parentId: folder.parentId,
                    children: [],
                }

                folderItem.children = buildMenu(folders, commandLines, folder.id)

                commandLines
                    .filter((commandLine) => commandLine.folderId === folder.id)
                    .forEach((commandLine) => {
                        folderItem.children.push({
                            id: commandLine.id,
                            title: commandLine.name,
                            path: `/${commandLine.nextApi ? commandLine.nextApi : commandLine.api.replace(/\.aspx$/, "").toLowerCase()}`,
                            iconName: commandLine.addToBookmarks && 'FavIcon'
                        })
                    })

                menu.push(folderItem)
            })

        return menu
    }

    const handleBookmark = (item, isBookmarked, callBack = undefined) => {
        //TEMP userData later replace with userProvider
        const userData =
            window.localStorage.getItem('userData') ?
                window.localStorage.getItem('userData') : window.sessionStorage.getItem('userData')

        const record = {
            userId: JSON.parse(userData).userId,
            commandId: item.id,
            displayOrder: 1
        }

        if (isBookmarked) {
            postRequest({
                'extension': AccessControlRepository.delBMK,
                'record': JSON.stringify(record),
            })
                .then((res) => {
                    getMenu()
                    if (typeof callBack === 'function') {
                        callBack()
                    }
                    toast.success('Removed from favorites')
                })
                .catch((error) => {
                    toast.error(error)
                    console.log({ error: error })
                })
        } else {
            postRequest({
                'extension': AccessControlRepository.setBMK,
                'record': JSON.stringify(record),
            })
                .then((res) => {
                    getMenu()
                    if (typeof callBack === 'function') {
                        callBack()
                    }
                    toast.success('Added to favorites')
                })
                .catch((error) => {
                    toast.error(error)
                    console.log({ error: error })
                })
        }
    }

    useEffect(() => {
        getMenu()
    }, [])

    const values = {
        menu,
        handleBookmark
    }

    return <MenuContext.Provider value={values}>{children}</MenuContext.Provider>
}

export { MenuContext, MenuProvider }
