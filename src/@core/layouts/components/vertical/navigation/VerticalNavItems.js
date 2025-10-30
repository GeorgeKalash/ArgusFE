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

  const { handleBookmark, setLastOpenedPage, setReloadOpenedPage, openTabs, setCurrentTabIndex, currentTabIndex } =
    useContext(MenuContext)

  const { platformLabels } = useContext(ControlContext)

  const { verticalNavItems, settings, openFolders, setOpenFolders, navCollapsed, isArabic } = props

  const [selectedNode, setSelectedNode] = useState(false)
  const theme = createTheme(themeOptions(settings, 'light'))

  const closeDialog = () => setSelectedNode(false)

  const handleRightClick = (e, node, imgName) => {
    e.preventDefault()
    setSelectedNode([node, Boolean(imgName)])
  }

  const toggleFolder = folderId => {
    setOpenFolders(prev => (prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]))
  }

  const handleNodeClick = node => {
    if (node.children) {
      toggleFolder(node.id)

      return
    }

    const normalizedPath = node.path.replace(/\/$/, '') + '/'
    const existingTabIndex = openTabs.findIndex(tab => tab.route === normalizedPath)
    const isCurrentTab = openTabs[currentTabIndex]?.route === normalizedPath

    if (isCurrentTab) {
      setReloadOpenedPage([])
      setReloadOpenedPage(node)
    } else if (existingTabIndex !== -1) {
      setCurrentTabIndex(existingTabIndex)
      window.history.replaceState(null, '', openTabs[existingTabIndex].route)
    } else {
      router.push(node.path)
    }

    setLastOpenedPage(node)
  }

  const getNodeIcon = (node, isOpen, isRoot) => {
    if (!node.iconName) return null

    return isRoot
      ? `/images/folderIcons/${isOpen ? node.iconName + 'Active' : node.iconName}.png`
      : `/images/folderIcons/${node.iconName}.png`
  }

  const renderArrowIcon = (isOpen, isArabic) => {
    if (isOpen) return <ExpandMoreIcon style={{ fontSize: 20 }} />

    return isArabic ? (
      <ArrowBackIosIcon style={{ fontSize: 13, height: '100%', paddingBottom: '5px' }} />
    ) : (
      <ChevronRightIcon style={{ fontSize: 20 }} />
    )
  }

  const truncateTitle = (title, level) => {
    const maxLength = Math.max(10, 31 - level)

    return title.length > maxLength ? `${title.slice(0, maxLength - 3)}...` : title
  }

  const renderNode = (node, level = 0) => {
    const isOpen = openFolders.includes(node.id)
    const isRoot = node.parentId === 0
    const isFolder = Boolean(node.children)
    const imgName = getNodeIcon(node, isOpen, isRoot)
    const truncatedTitle = truncateTitle(node.title, level)

    return (
      <div key={node.id} style={{ paddingBottom: isRoot ? 5 : undefined }}>
        <div
          className={`node ${isFolder ? 'folder' : 'file'} ${isOpen ? 'open' : ''}`}
          style={{ display: !isFolder && navCollapsed ? 'none' : 'flex' }}
          onClick={() => handleNodeClick(node)}
          onContextMenu={e => !isFolder && handleRightClick(e, node, imgName)}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              overflowX: navCollapsed ? '' : 'hidden',
              height: 25
            }}
          >
            {imgName ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: navCollapsed ? 'center !important' : 'left',
                  justifyContent: navCollapsed ? 'center' : 'left',
                  paddingLeft: 8
                }}
              >
                <Image src={imgName} alt={node.title} width={22} height={22} />
              </div>
            ) : (
              <div style={{ width: 30, height: 22 }} />
            )}

            {!navCollapsed && (
              <div style={{ margin: '2px 0 0 5px', display: 'flex' }}>
                <div className='text' title={node.title}>
                  {truncatedTitle}
                </div>
                {isFolder && (
                  <div className='arrow' style={{ right: isArabic ? '260px' : '8px' }}>
                    {renderArrowIcon(isOpen, isArabic)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {isOpen && isFolder && (
          <div className='children' style={{ paddingLeft: navCollapsed ? '0px' : '12px' }}>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <div className='sidebar' style={{ paddingRight: navCollapsed ? 8 : '' }}>
        {verticalNavItems.map(node => renderNode(node, 0))}
      </div>

      {selectedNode && (
        <ConfirmationDialog
          openCondition={Boolean(selectedNode)}
          closeCondition={closeDialog}
          DialogText={selectedNode[1] ? platformLabels.RemoveFav : platformLabels.AddFav}
          okButtonAction={() => handleBookmark(selectedNode[0], selectedNode[1], closeDialog)}
          cancelButtonAction={closeDialog}
        />
      )}
    </ThemeProvider>
  )
}

export default VerticalNavItems
