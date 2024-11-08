import { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'

const MenuContext = createContext()

const MenuProvider = ({ children }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [menu, setMenu] = useState([])
  const [gear, setGear] = useState([])
  const [lastOpenedPage, setLastOpenedPage] = useState(null)
  const [reloadOpenedPage, setReloadOpenedPage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const getMenu = async () => {
    var parameters = '_filter='
    getRequest({
      extension: SystemRepository.mainMenu,
      parameters: parameters
    }).then(async res => {
      const builtMenu = buildMenu(res.record.folders, res.record.commandLines)
      const builtGear = buildGear(res.record.commandLines)
      setGear(builtGear)
      setMenu(builtMenu)
    })
  }

  const buildMenu = (folders, commandLines, parentId = 0) => {
    const menu = []

    folders
      .filter(folder => folder.parentId === parentId)
      .forEach(folder => {
        const folderItem = {
          id: folder.id,
          title: folder.name,
          iconName: folder.iconName && folder.iconName,
          icon: folder.nextIcon,
          parentId: folder.parentId,
          children: []
        }

        folderItem.children = buildMenu(folders, commandLines, folder.id)

        commandLines
          .filter(commandLine => commandLine.folderId === folder.id)
          .forEach(commandLine => {
            if (commandLine.nextAPI)
              folderItem.children.push({
                id: commandLine.id,
                title: commandLine.name,
                path: `/${commandLine.nextAPI}`,
                name: commandLine.name,

                // path: `/${commandLine.nextAPI ? commandLine.nextAPI : commandLine.api.replace(/\.aspx$/, "").toLowerCase()}`,
                iconName: commandLine.addToBookmarks && 'FavIcon'
              })
          })

        menu.push(folderItem)
      })

    return menu
  }

  const buildGear = commandLines => {
    const Gear = []
    commandLines
      .filter(commandLine => commandLine.folderId === 0)
      .forEach(commandLine => {
        if (commandLine.nextAPI) {
          const GearItem = {
            id: commandLine.id,
            title: commandLine.name,
            path: `/${commandLine.nextAPI}`,
            name: commandLine.name,
            folderId: commandLine.folderId,
            iconName: commandLine.addToBookmarks && 'FavIcon'
          }
          Gear.push(GearItem)
        }
      })

    return Gear
  }

  const handleBookmark = (item, isBookmarked, callBack = undefined) => {
    //TEMP userData later replace with userProvider
    const userData = window.localStorage.getItem('userData')
      ? window.localStorage.getItem('userData')
      : window.sessionStorage.getItem('userData')

    const record = {
      userId: JSON.parse(userData).userId,
      commandId: item.id,
      displayOrder: 1
    }

    if (isBookmarked) {
      postRequest({
        extension: AccessControlRepository.delBMK,
        record: JSON.stringify(record)
      }).then(res => {
        getMenu()
        if (typeof callBack === 'function') {
          callBack()
        }
        toast.success('Removed from favorites')
      })
    } else {
      postRequest({
        extension: AccessControlRepository.setBMK,
        record: JSON.stringify(record)
      }).then(res => {
        getMenu()
        if (typeof callBack === 'function') {
          callBack()
        }
        toast.success('Added to favorites')
      })
    }
  }

  useEffect(() => {
    getMenu()
  }, [])

  const values = {
    menu,
    gear,
    handleBookmark,
    lastOpenedPage,
    setLastOpenedPage,
    reloadOpenedPage,
    setReloadOpenedPage
  }

  return (
    <>
      <MenuContext.Provider value={values}>{children}</MenuContext.Provider>
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export { MenuContext, MenuProvider }
