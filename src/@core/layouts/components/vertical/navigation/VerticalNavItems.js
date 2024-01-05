// ** React Imports
import { useContext, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'

// ** Next Imports
import { useRouter } from 'next/router'
import Image from 'next/image'

// ** MUI Imports
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

// ** Context
import { MenuContext } from 'src/providers/MenuContext'
import { createTheme } from '@mui/system'
import themeOptions from 'src/@core/theme/ThemeOptions'
import ConfirmationDialog from 'src/components/ConfirmationDialog'

const VerticalNavItems = props => {
  const router = useRouter()
  const { handleBookmark, setLastOpenedPage } = useContext(MenuContext)

  // ** Props
  const { verticalNavItems, settings, openFolders, setOpenFolders, navHover, navCollapsed } = props

  const [selectedNode, setSelectedNode] = useState(false)
  let theme = createTheme(themeOptions(settings, 'light'))

  const closeDialog = () => {
    // setOpenFolders([])
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
      <div key={node.id} style={{ paddingTop: isRoot && 10,}}>
        <div
          className={`node ${isFolder ? 'folder' : 'file'} ${isOpen ? 'open' : ''}`}
          style={{display: !isFolder && navCollapsed && !navHover ? 'none' : 'flex',}}
          onClick={() => {
            if (node.children) {
              toggleFolder(node.id)
            } else {
              router.push(node.path)
              setLastOpenedPage(node)
            }
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', overflowX: navCollapsed && !navHover ? '':'hidden'}}
            onContextMenu={e => !isFolder && handleRightClick(e, node, imgName)}
          >
            {imgName ? (
              <div
              style={{
                display: 'flex',
                alignItems: navCollapsed && !navHover ? 'center !important' : 'left',
                justifyContent: navCollapsed && !navHover ? 'center' : 'left',
                paddingLeft:'8px',
              }}
              >
                <Image
                  src={imgName} // Assuming the images are in the public/icons folder
                  alt={node.title}
                  width={22} // Set the width as needed
                  height={22} // Set the height as needed
                />
              </div>
            ):<div style={{ width: '30px', height: '22px' }}>
              {/* placeHolder */}
              </div>}
              <>
              <div style={{
                margin:'2px 0px 0px 5px',
                display:navCollapsed && !navHover ? 'none':'flex',
                }}>
                <div className='text'>
                  {' '}
                  {/* Added a container div for text */}
                  <span>{node.title}</span>
                </div>
                {isFolder && (
                  <div className='arrow'>
                    {isOpen ? (
                      <ExpandMoreIcon style={{ fontSize: 20 }} />
                    ) : (
                      <ChevronRightIcon style={{ fontSize: 20 }} />
                    )}
                  </div>
                )}
                </div>
              </>
          </div>
        </div>
        {isOpen && isFolder && 
        <div className='children'
          style={{ paddingLeft: navCollapsed && !navHover ? '0px' : '12px',}}
        >
          {node.children.map(child => renderNode(child))}
        </div>}
      </div>
    )
  }

  return (
    <>
    <ThemeProvider theme={theme}>
      <div className='sidebar' style={{ paddingRight: navCollapsed && !navHover ? '8px' : '' }}>
        {verticalNavItems.map(node => renderNode(node))}
      </div>
      {selectedNode && (
        <ConfirmationDialog
          openCondition={selectedNode ? true : false}
          closeCondition={() => setSelectedNode(false)}
          DialogText={
            selectedNode[1] ? 'Remove from favorites ?' : 'Add to favorites ?'
          }
          okButtonAction={() =>
            handleBookmark(selectedNode[0], selectedNode[1], closeDialog)
          }
          cancelButtonAction={() => setSelectedNode(false)}
        />
      )}
      </ThemeProvider>
    </>
  )

  // const RenderMenuItems = verticalNavItems?.map((item, index) => {
  //   const TagName = resolveNavItemComponent(item)

  //   return <TagName {...props} key={index} item={item} />
  // })

  // return <>{RenderMenuItems}</>
}

export default VerticalNavItems
