import React, { useContext, useCallback } from "react";
import ReactFlow, { MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { useRouter } from "next/router";
import { MenuContext } from "@argus/shared-providers/src/providers/MenuContext";
import { SquareNode } from '@argus/shared-ui/src/components/Shapes/SquareNode'
import { CircleNode } from '@argus/shared-ui/src/components/Shapes/CircleNode'
import { HexNode } from '@argus/shared-ui/src/components/Shapes/HexNode'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'

const nodeTypes = {
  square: SquareNode,
  circle: CircleNode,
  hex: HexNode,
};

export default function PuDashboard() {
  const router = useRouter();
  
  const {
    labels,
  } = useResourceQuery({
    datasetId: ResourceIds.PuDashboard,
  })
  
  const {
    menu,
    openTabs,
    currentTabIndex,
    setCurrentTabIndex,
    setReloadOpenedPage,
    setLastOpenedPage,
  } = useContext(MenuContext);

  const findMenuNodeByPath = useCallback((nodes, targetPath) => {
    for (const node of nodes) {
      if (node.children) {
        const found = findMenuNodeByPath(node.children, targetPath);
        if (found) return found;
      } else if (
        node.path &&
        node.path.replace(/\/$/, "") === targetPath.replace(/\/$/, "")
      ) {
        return node;
      }
    }
    return null;
  }, []);

  const handleFlowNodeClick = (_, flowNode) => {
    const path = flowNode?.data?.path;
    if (!path) return;

    const menuNode = findMenuNodeByPath(menu, path);
    if (!menuNode) return;

    const normalizedPath = menuNode.path.replace(/\/$/, "") + "/";

    const existingTabIndex = openTabs.findIndex(
      (tab) => tab.route === normalizedPath,
    );

    const isCurrentTab = openTabs[currentTabIndex]?.route === normalizedPath;

    if (isCurrentTab) {
      setReloadOpenedPage([]);
      setReloadOpenedPage(menuNode);
    } else if (existingTabIndex !== -1) {
      setCurrentTabIndex(existingTabIndex);
      window.history.replaceState(null, "", openTabs[existingTabIndex].route);
    } else {
      router.push(menuNode.path);
    }

    setLastOpenedPage(menuNode);
  };

  const nodes = [
    {
      id: "pr",
      type: "square",
      position: { x: 100, y: 200 },
      data: {
        label: labels.pr,
        color: "#f4ea2a",
        path: "/purchase-requisition/",
      },
    },
    {
      id: "mrp",
      type: "square",
      position: { x: 50, y: 400 },
      data: { label: labels.mrp, color: "#f4ea2a", path: "/ir-mat-planning/" },
    },
    {
      id: "generatemrp",
      type: "circle",
      position: { x: 70, y: 600 },
      data: {
        label: labels.genMrp,
        color: "#6cc04a",
        path: "/ir-gen-mat-planning/",
      },
    },
    {
      id: "po",
      type: "square",
      position: { x: 600, y: 350 },
      data: {
        label: labels.po,
        color: "#ff3c2f",
        textColor: "#fff",
        path: "/pu-ord/",
      },
    },
    {
      id: "potracker",
      type: "circle",
      position: { x: 620, y: 600 },
      data: { label: labels.poTracker, color: "#6cc04a", path: "/po-tracking/" },
    },
    {
      id: "quotations",
      type: "square",
      position: { x: 600, y: 100 },
      data: {
        label: labels.qtn,
        color: "#ff3c2f",
        textColor: "#fff",
        path: "/pu-qtn/",
      },
    },
    {
      id: "receive",
      type: "square",
      position: { x: 1000, y: 200 },
      data: {
        label: labels.shp,
        color: "#2e86c1",
        textColor: "#fff",
        path: "/shipments/",
      },
    },
    {
      id: "invoice",
      type: "square",
      position: { x: 900, y: 600 },
      data: {
        label: labels.pi,
        color: "#2e86c1",
        textColor: "#fff",
        path: "/pu-trx/5004/",
      },
    },
    {
      id: "generateinvoice",
      type: "circle",
      position: { x: 1150, y: 306 },
      data: {
        label: labels.genIvc,
        color: "#6cc04a",
        path: "/generate-purch-inv/",
      },
    },
    {
      id: "openpo",
      type: "hex",
      position: { x: 800, y: 200 },
      data: { label: labels.openPo, color: "#f5f5f5", path: "/pu-open-po/" },
    },
    {
      id: "openpr",
      type: "hex",
      position: { x: 400, y: 200 },
      data: { label: labels.openPr, color: "#f5f5f5", path: "/pu-open-pr/" },
    }
  ];

  const edges = [
    {
      id: "mrp-pr",
      source: "mrp",
      sourceHandle: "top-source",
      target: "pr",
      targetHandle: "bottom",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "generatemrp-mrp",
      source: "generatemrp",
      sourceHandle: "top-source",
      target: "mrp",
      targetHandle: "bottom",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "pr-quotations",
      source: "pr",
      sourceHandle: "top-source",
      target: "quotations",
      targetHandle: "left",
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "pr-openpr",
      source: "pr",
      sourceHandle: "right-source",
      target: "openpr",
      targetHandle: "left-middle",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "openpr-quotations",
      source: "openpr",
      sourceHandle: "right-center",
      target: "quotations",
      targetHandle: "left",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "openpr-po",
      source: "openpr",
      sourceHandle: "right-center",
      target: "po",
      targetHandle: "left",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "quotations-po",
      source: "quotations",
      sourceHandle: "bottom-source",
      target: "po",
      targetHandle: "top",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "pr-po",
      source: "pr",
      sourceHandle: "bottom-source",
      target: "po",
      targetHandle: "left",
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "po-generateinvoice",
      source: "po",
      sourceHandle: "right-source",
      target: "generateinvoice",
      targetHandle: "left",
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "generateinvoice-receive",
      source: "generateinvoice",
      sourceHandle: "top-source",
      target: "receive",
      targetHandle: "right",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "openpo-receive",
      source: "openpo",
      sourceHandle: "right-center",
      target: "receive",
      targetHandle: "left",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "po-openpo",
      source: "po",
      sourceHandle: "top-source",
      target: "openpo",
      targetHandle: "left-middle",
      markerEnd: { type: MarkerType.Arrow },
    },
    {
      id: "generateinvoice-invoice",
      source: "generateinvoice",
      sourceHandle: "bottom-source",
      target: "invoice",
      targetHandle: "right",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "potracker-po",
      source: "potracker",
      sourceHandle: "top-source",
      target: "po",
      targetHandle: "bottom",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
  ];

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        onNodeClick={handleFlowNodeClick}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnDrag={false}
        zoomOnDoubleClick={false}
        fitView
      />
    </div>
  );
}
