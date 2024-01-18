// ** React Imports
import { useContext, useEffect, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'

// ** Next Imports
import { useRouter } from 'next/router'
import Image from 'next/image'

// ** MUI Imports
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

// ** Context
import { MenuContext } from 'src/providers/MenuContext'
import { createTheme } from '@mui/system'
import themeOptions from 'src/@core/theme/ThemeOptions'
import ConfirmationDialog from 'src/components/ConfirmationDialog'
import { useAuth } from 'src/hooks/useAuth'

const VerticalNavItems = props => {
  const router = useRouter()
  const { handleBookmark, setLastOpenedPage } = useContext(MenuContext)

  // ** Props
  const { verticalNavItems, settings, openFolders, setOpenFolders, navCollapsed } = props

  const [selectedNode, setSelectedNode] = useState(false)
  const auth = useAuth()
  const [isArabic, setIsArabic] = useState(false)

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

  useEffect (()=>{
    if(auth?.user?.languageId === 2) setIsArabic(true)
    else setIsArabic(false)
  }, [])

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
      <div key={node.id} style={{ paddingBottom: isRoot && 10,}}>
        <div
          className={`node ${isFolder ? 'folder' : 'file'} ${isOpen ? 'open' : ''}`}
          style={{display: !isFolder && navCollapsed ? 'none' : 'flex',}}
          onClick={() => {
            if (node.children) {
              toggleFolder(node.id)
            } else {
              router.push(node.path)
              setLastOpenedPage(node)
            }
          }}
          onContextMenu={e => !isFolder && handleRightClick(e, node, imgName)}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', overflowX: navCollapsed ? '':'hidden'}} >
            {imgName ? (
              <div
              style={{
                display: 'flex',
                alignItems: navCollapsed ? 'center !important' : 'left',
                justifyContent: navCollapsed ? 'center' : 'left',
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
                display:navCollapsed ? 'none':'flex',
                }}>
                <div className='text'>
                  {' '}
                  {/* Added a container div for text */}
                  <span>{node.title}</span>
                </div>
                {isFolder && (
                  <div className='arrow' style={{ 
                    right: isArabic? '260px' :'8px',
                  }}>
                   {isOpen ? (
                      <ExpandMoreIcon style={{ fontSize: 20 }} />
                    ) : (
                      isArabic ? (
                        <ArrowBackIosIcon style={{ fontSize: 13, height:'100%', paddingBottom:'5px' }} />
                      ) : (
                        <ChevronRightIcon style={{ fontSize: 20 }} />
                      )
                    )}

                  </div>
                )}
                </div>
              </>
          </div>
        </div>
        {isOpen && isFolder && 
        <div className='children'
          style={{ paddingLeft: navCollapsed ? '0px' : '12px',}}
        >
          {node.children.map(child => renderNode(child))}
        </div>}
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
