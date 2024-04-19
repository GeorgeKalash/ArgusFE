import React, { useRef, useEffect, useState } from 'react'
import TreeView from '@mui/lab/TreeView'
import TreeItem from '@mui/lab/TreeItem'
import { styled } from '@mui/material/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useReactToPrint } from 'react-to-print'
import WindowToolbar from './WindowToolbar'
import { padding } from '@mui/system'

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

const StyledTreeView = styled(TreeView)({
  height: 280,
  flexGrow: 1,
  maxWidth: 400,
  overflowY: 'auto',
  '@media print': {
    height: 'auto',
    maxHeight: '100%',
    width: '100%',
    maxWidth: '100%',
    overflowY: 'visible'
  }
})

const StyledTreeItem = styled(TreeItem)(({ theme, depth }) => ({
  '&.Mui-selected > .MuiTreeItem-content .MuiTreeItem-label': {
    backgroundColor: 'transparent',
    borderColor: 'transparent'
  },
  '&.Mui-focused > .MuiTreeItem-content .MuiTreeItem-label': {
    backgroundColor: 'transparent'
  }
}))

function Tree({ data }) {
  const [treeData, setTreeData] = useState([])
  const componentRef = useRef()
  const printComponentRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: 'Tree_Structure',
    removeAfterPrint: true
  })

  useEffect(() => {
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
      const tree = [...map.values()].filter(item => !item.parentId)
      setTreeData(tree)
    }
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
    <div>
      <div ref={componentRef}>
        <StyledTreeView
          aria-label='plant tree'
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          {treeData.map(node => renderTree(node))}
        </StyledTreeView>
      </div>
      <div style={{ display: 'none' }}>
        <div ref={printComponentRef}>
          <PrintableTree nodes={treeData} />
        </div>
      </div>
      <WindowToolbar actions={actions} isCleared={false} isSaved={false} isInfo={false} />
    </div>
  )
}

export default Tree
