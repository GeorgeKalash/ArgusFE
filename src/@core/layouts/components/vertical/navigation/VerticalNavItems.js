import { useContext, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { useRouter } from 'next/router'
import Image from 'next/image'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import { MenuContext } from 'src/providers/MenuContext'
import { createTheme } from '@mui/system'
import themeOptions from 'src/@core/theme/ThemeOptions'
import ConfirmationDialog from 'src/components/ConfirmationDialog'
import { ControlContext } from 'src/providers/ControlContext'

const VerticalNavItems = props => {
  const router = useRouter()
  const { handleBookmark, setLastOpenedPage, setReloadOpenedPage } = useContext(MenuContext)
  const { platformLabels } = useContext(ControlContext)
  const { verticalNavItems, settings, openFolders, setOpenFolders, navCollapsed, isArabic } = props
  const { menu } = useContext(MenuContext)
  const [selectedNode, setSelectedNode] = useState(false)

  let theme = createTheme(themeOptions(settings, 'light'))

  const closeDialog = () => {
    setSelectedNode(false)
  }

  const handleRightClick = (e, node, imgName) => {
    e.preventDefault()
    setSelectedNode([node, imgName ? true : false])
  }

  const toggleFolder = folderId => {
    if (openFolders.includes(folderId)) {
      setOpenFolders(openFolders.filter(id => id !== folderId))
    } else {
      setOpenFolders([...openFolders, folderId])
    }
  }

  const findNode = (nodes, targetRouter) => {
    for (const node of nodes) {
      if (node.children) {
        const result = findNode(node.children, targetRouter)
        if (result) {
          return result
        }
      } else if (node.path && node.path === targetRouter) {
        return node.path
      }
    }

    return null
  }

  const renderNode = node => {
    const isOpen = openFolders.includes(node.id)
    const isRoot = node.parentId === 0
    const isFolder = node.children

    const imgName = node.iconName
      ? isRoot
        ? `/images/folderIcons/${isOpen ? node.iconName + 'Active' : node.iconName}.png`
        : `/images/folderIcons/${node.iconName}.png`
      : null

    return (
      <div key={node.id} style={{ paddingBottom: isRoot && 5 }}>
        <div
          className={`node ${isFolder ? 'folder' : 'file'} ${isOpen ? 'open' : ''}`}
          style={{ display: !isFolder && navCollapsed ? 'none' : 'flex' }}
          onClick={() => {
            if (node.children) {
              toggleFolder(node.id)
            } else {
              setReloadOpenedPage([])
              if (
                findNode(
                  menu,
                  node.path.replace(/\/$/, '') + '/' === router.asPath &&
                    node.path.replace(/\/$/, '') + '/' !== window?.history?.state?.as
                ) ||
                window?.history?.state?.as === node.path.replace(/\/$/, '') + '/'
              ) {
                setReloadOpenedPage(node)
              } else {
                router.push(node.path)
              }
              setLastOpenedPage(node)
            }
          }}
          onContextMenu={e => !isFolder && handleRightClick(e, node, imgName)}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', overflowX: navCollapsed ? '' : 'hidden', height: '25px' }}
          >
            {imgName ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: navCollapsed ? 'center !important' : 'left',
                  justifyContent: navCollapsed ? 'center' : 'left',
                  paddingLeft: '8px'
                }}
              >
                <Image src={imgName} alt={node.title} width={22} height={22} />
              </div>
            ) : (
              <div style={{ width: '30px', height: '22px' }}>{/* placeHolder */}</div>
            )}
            <>
              <div
                style={{
                  margin: '2px 0px 0px 5px',
                  display: navCollapsed ? 'none' : 'flex'
                }}
              >
                <div className='text'>
                  {' '}
                  <span>{node.title}</span>
                </div>
                {isFolder && (
                  <div
                    className='arrow'
                    style={{
                      right: isArabic ? '260px' : '8px'
                    }}
                  >
                    {isOpen ? (
                      <ExpandMoreIcon style={{ fontSize: 20 }} />
                    ) : isArabic ? (
                      <ArrowBackIosIcon style={{ fontSize: 13, height: '100%', paddingBottom: '5px' }} />
                    ) : (
                      <ChevronRightIcon style={{ fontSize: 20 }} />
                    )}
                  </div>
                )}
              </div>
            </>
          </div>
        </div>
        {isOpen && isFolder && (
          <div className='children' style={{ paddingLeft: navCollapsed ? '0px' : '12px' }}>
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <ThemeProvider theme={theme}>
        <div className='sidebar' style={{ paddingRight: navCollapsed ? '8px' : '' }}>
          {verticalNavItems.map(node => renderNode(node))}
        </div>
        {selectedNode && (
          <ConfirmationDialog
            openCondition={selectedNode ? true : false}
            closeCondition={() => setSelectedNode(false)}
            DialogText={selectedNode[1] ? platformLabels.RemoveFav : platformLabels.AddFav}
            okButtonAction={() => handleBookmark(selectedNode[0], selectedNode[1], closeDialog)}
            cancelButtonAction={() => setSelectedNode(false)}
          />
        )}
      </ThemeProvider>
    </>
  )
}

export default VerticalNavItems
