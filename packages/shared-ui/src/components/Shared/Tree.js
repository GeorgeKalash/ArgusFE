import React, { useRef, useMemo, useContext } from 'react'
import TreeView from '@mui/lab/TreeView'
import TreeItem from '@mui/lab/TreeItem'
import { styled, useTheme } from '@mui/material/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useReactToPrint } from 'react-to-print'
import WindowToolbar from './WindowToolbar'

import { DialogActions, DialogContent, useMediaQuery } from '@mui/material'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const getAllNodeIds = nodes => {
  let nodeIds = []
  nodes.forEach(node => {
    nodeIds.push(node.recordId.toString())
    if (node.children) {
      nodeIds = nodeIds.concat(getAllNodeIds(node.children))
    }
  })

  return nodeIds
}

const PrintableTree = ({ nodes }) => {
  const expandedNodeIds = getAllNodeIds(nodes)

  const renderTree = nodes => (
    <StyledTreeItem key={nodes.recordId} nodeId={nodes.recordId.toString()} label={nodes.name}>
      {Array.isArray(nodes.children) ? nodes.children.map(node => renderTree(node)) : null}
    </StyledTreeItem>
  )

  return (
    <StyledTreeView
      aria-label='plant tree'
      expanded={expandedNodeIds}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
    >
      {nodes.map(node => renderTree(node))}
    </StyledTreeView>
  )
}

const StyledTreeView = styled(TreeView)(({ theme }) => ({
  width: '100%',
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  boxSizing: 'border-box',
  padding: 0,

  '--tree-font': 'clamp(11px, 0.25vw + 10px, 13px)',
  '--tree-rowH': 'clamp(22px, 0.35vw + 20px, 26px)',
  '--tree-py': '0px',
  '--tree-px': '6px',
  '--tree-iconBoxW': '18px',
  '--tree-iconSize': '18px',
  '--tree-indent': '18px',
  '--tree-radius': '0px',

  '& .MuiTreeItem-content': {
    minHeight: 'var(--tree-rowH)',
    paddingTop: 'var(--tree-py)',
    paddingBottom: 'var(--tree-py)',
    paddingLeft: 'var(--tree-px)',
    paddingRight: 'var(--tree-px)',
    borderRadius: 'var(--tree-radius)',
    alignItems: 'center',
    gap: 6
  },

  '& .MuiTreeItem-label': {
    fontSize: 'var(--tree-font)',
    lineHeight: 1.2,
    whiteSpace: 'normal',
    wordBreak: 'break-word'
  },

  '& .MuiTreeItem-iconContainer': {
    width: 'var(--tree-iconBoxW)',
    minWidth: 'var(--tree-iconBoxW)',
    marginRight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  '& .MuiSvgIcon-root': {
    fontSize: 'var(--tree-iconSize)'
  },

  '& .MuiTreeItem-group': {
    marginLeft: 'var(--tree-indent)',
    paddingLeft: 0
  },

  '& .MuiTreeItem-content:hover': {
    backgroundColor: theme.palette.action.hover
  },

  '@media print': {
    overflowY: 'visible',
    '--tree-font': '11pt',
    '--tree-rowH': 'auto'
  },

  [theme.breakpoints.down('sm')]: {
    '--tree-font': 'clamp(10.5px, 0.4vw + 9.5px, 12px)',
    '--tree-rowH': 'clamp(20px, 0.4vw + 18px, 24px)',
    '--tree-iconBoxW': '16px',
    '--tree-iconSize': '16px',
    '--tree-indent': '16px',
    '--tree-px': '4px'
  }
}))

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  '&.Mui-selected > .MuiTreeItem-content': {
    backgroundColor: '#d9d9d9'
  },
  '&.Mui-selected > .MuiTreeItem-content:hover': {
    backgroundColor: '#d9d9d9'
  },
  '&.Mui-focused > .MuiTreeItem-content': {
    backgroundColor: '#d9d9d9'
  },

  '& .MuiTreeItem-content .MuiTreeItem-label': {
    fontSize: 'var(--tree-font) !important',
    lineHeight: '1.2 !important',
    whiteSpace: 'normal',
    wordBreak: 'break-word'
  }
}))

function Tree({ data, window, printable = true }) {
  const { platformLabels } = useContext(ControlContext)

  const theme = useTheme()
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'))

  const printComponentRef = useRef()

  useSetWindow({ title: platformLabels.Tree, window })

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: 'Tree_Structure',
    removeAfterPrint: true
  })

  const treeData = useMemo(() => {
    if (data) {
      const map = new Map(data?.list?.map(item => [item.recordId, { ...item, children: [] }]))
      data?.list?.forEach(item => {
        if (item.parentId) {
          const parent = map.get(item.parentId)
          if (parent) {
            parent.children.push(map.get(item.recordId))
          }
        }
      })

      return [...map.values()].filter(item => !item.parentId)
    }

    return []
  }, [data])

  const renderTree = nodes => (
    <StyledTreeItem key={nodes.recordId} nodeId={nodes.recordId.toString()} label={nodes.name}>
      {Array.isArray(nodes.children) ? nodes.children.map(node => renderTree(node)) : null}
    </StyledTreeItem>
  )

  const actions = printable
    ? [
        {
          key: 'Print',
          condition: true,
          onClick: handlePrint,
          disabled: false
        }
      ]
    : []

  return (
    <>
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        <StyledTreeView
          aria-label='plant tree'
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          {treeData.map(node => renderTree(node))}
        </StyledTreeView>

        <div style={{ display: 'none', visibility: 'hidden' }}>
          <div ref={printComponentRef}>
            <PrintableTree nodes={treeData} />
          </div>
        </div>
      </DialogContent>

      <DialogActions
        sx={{
          p: 0,
          width: '100%'
        }}
      >
        <WindowToolbar actions={actions} isCleared={false} isSaved={false} isInfo={false} />
      </DialogActions>
    </>
  )
}

Tree.width = 500
Tree.height = 400

export default Tree
