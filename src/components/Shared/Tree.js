import React, { useRef, useMemo } from 'react'
import TreeView from '@mui/lab/TreeView'
import TreeItem from '@mui/lab/TreeItem'
import { styled } from '@mui/material/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useReactToPrint } from 'react-to-print'
import WindowToolbar from './WindowToolbar'

import { DialogActions, DialogContent } from '@mui/material'

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

const StyledTreeView = styled(TreeView)(({}) => ({
  '@media print': {
    height: 'auto',
    maxHeight: '100%',
    width: '100%',
    maxWidth: '100%',
    overflowY: 'visible'
  }
}))

const StyledTreeItem = styled(TreeItem)(({ theme, depth }) => ({
  '&.Mui-selected > .MuiTreeItem-content .MuiTreeItem-label': {
    backgroundColor: 'transparent',
    borderColor: 'transparent'
  },
  '&.Mui-focused > .MuiTreeItem-content .MuiTreeItem-label': {
    backgroundColor: 'transparent'
  }
}))

function Tree({ data, expanded }) {
  const componentRef = useRef()
  const printComponentRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: 'Tree_Structure',
    removeAfterPrint: true
  })

  const treeData = useMemo(() => {
    if (data) {
      const map = new Map(data.list.map(item => [item.recordId, { ...item, children: [] }]))
      data.list.forEach(item => {
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

  const actions = [
    {
      key: 'Print',
      condition: true,
      onClick: handlePrint,
      disabled: false
    }
  ]

  return (
    <>
      <DialogContent
        sx={{
          padding: 0
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
          padding: 0
        }}
      >
        <WindowToolbar actions={actions} isCleared={false} isSaved={false} isInfo={false} />
      </DialogActions>
    </>
  )
}

export default Tree
