import React, { useContext, useCallback } from "react";
import ReactFlow, { MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { useRouter } from "next/router";
import { MenuContext } from "@argus/shared-providers/src/providers/MenuContext";
import { SquareNode } from "@argus/shared-ui/src/components/Shapes/SquareNode";
import { CircleNode } from "@argus/shared-ui/src/components/Shapes/CircleNode";
import { HexNode } from "@argus/shared-ui/src/components/Shapes/HexNode";
import { ResourceIds } from "@argus/shared-domain/src/resources/ResourceIds";
import { useResourceQuery } from "@argus/shared-hooks/src/hooks/resource";
import { useWindowDimensions } from "@argus/shared-domain/src/lib/useWindowDimensions";
import { useSettings } from "@argus/shared-core/src/@core/hooks/useSettings";

const nodeTypes = {
  square: SquareNode,
  circle: CircleNode,
  hex: HexNode,
};

const LAYOUT_KEY = {
  SMALL_MOBILE: "smallMobile",
  MOBILE: "mobile",
  LARGE_MOBILE: "largeMobile",
  IPAD: "ipad",
  TABLET: "tablet",
  LAPTOP: "laptop",
  DESKTOP: "desktop",
};

const RESPONSIVE_LAYOUTS = {
  [LAYOUT_KEY.SMALL_MOBILE]: {
    circleSize: 70,
    squareWidth: 85,
    squareHeight: 40,
    hexWidth: 80,
    hexHeight: 50,
    positions: {
      pr: { x: 35, y: 130 },
      mrp: { x: 20, y: 260 },
      generatemrp: { x: 25, y: 390 },
      quotations: { x: 200, y: 45 },
      openpr: { x: 120, y: 130 },
      po: { x: 200, y: 200 },
      openpo: { x: 280, y: 130 },
      receive: { x: 360, y: 130 },
      generateinvoice: { x: 420, y: 200 },
      invoice: { x: 340, y: 390 },
      potracker: { x: 200, y: 390 },
    },
  },
  [LAYOUT_KEY.MOBILE]: {
    circleSize: 80,
    squareWidth: 120,
    squareHeight: 55,
    hexWidth: 105,
    hexHeight: 55,
    positions: {
      pr: { x: 45, y: 140 },
      mrp: { x: 25, y: 290 },
      generatemrp: { x: 35, y: 430 },
      quotations: { x: 240, y: 55 },
      openpr: { x: 145, y: 140 },
      po: { x: 240, y: 220 },
      openpo: { x: 330, y: 140 },
      receive: { x: 440, y: 140 },
      generateinvoice: { x: 520, y: 220 },
      invoice: { x: 420, y: 430 },
      potracker: { x: 240, y: 430 },
    },
  },
  [LAYOUT_KEY.LARGE_MOBILE]: {
    circleSize: 92,
    squareWidth: 135,
    squareHeight: 60,
    hexWidth: 118,
    hexHeight: 60,
    positions: {
      pr: { x: 60, y: 160 },
      mrp: { x: 35, y: 325 },
      generatemrp: { x: 45, y: 490 },
      quotations: { x: 320, y: 60 },
      openpr: { x: 195, y: 160 },
      po: { x: 320, y: 250 },
      openpo: { x: 440, y: 160 },
      receive: { x: 590, y: 160 },
      generateinvoice: { x: 710, y: 250 },
      invoice: { x: 560, y: 490 },
      potracker: { x: 320, y: 490 },
    },
  },
  [LAYOUT_KEY.IPAD]: {
    circleSize: 95,
    squareWidth: 138,
    squareHeight: 60,
    hexWidth: 118,
    hexHeight: 60,
    positions: {
      pr: { x: 65, y: 155 },
      mrp: { x: 35, y: 315 },
      generatemrp: { x: 45, y: 475 },
      quotations: { x: 335, y: 60 },
      openpr: { x: 200, y: 155 },
      po: { x: 335, y: 245 },
      openpo: { x: 455, y: 155 },
      receive: { x: 610, y: 155 },
      generateinvoice: { x: 725, y: 245 },
      invoice: { x: 575, y: 475 },
      potracker: { x: 335, y: 475 },
    },
  },
  [LAYOUT_KEY.TABLET]: {
    circleSize: 110,
    squareWidth: 155,
    squareHeight: 66,
    hexWidth: 135,
    hexHeight: 66,
    positions: {
      pr: { x: 85, y: 180 },
      mrp: { x: 45, y: 360 },
      generatemrp: { x: 60, y: 540 },
      quotations: { x: 460, y: 70 },
      openpr: { x: 280, y: 180 },
      po: { x: 460, y: 285 },
      openpo: { x: 620, y: 180 },
      receive: { x: 820, y: 180 },
      generateinvoice: { x: 965, y: 285 },
      invoice: { x: 760, y: 540 },
      potracker: { x: 470, y: 540 },
    },
  },
  [LAYOUT_KEY.LAPTOP]: {
    circleSize: 124,
    squareWidth: 168,
    squareHeight: 70,
    hexWidth: 145,
    hexHeight: 70,
    positions: {
      pr: { x: 95, y: 195 },
      mrp: { x: 50, y: 390 },
      generatemrp: { x: 65, y: 585 },
      quotations: { x: 560, y: 90 },
      openpr: { x: 360, y: 195 },
      po: { x: 560, y: 335 },
      openpo: { x: 760, y: 195 },
      receive: { x: 960, y: 195 },
      generateinvoice: { x: 1095, y: 290 },
      invoice: { x: 860, y: 585 },
      potracker: { x: 585, y: 585 },
    },
  },
  [LAYOUT_KEY.DESKTOP]: {
    circleSize: 140,
    squareWidth: 180,
    squareHeight: 74,
    hexWidth: 140,
    hexHeight: 64,
    positions: {
      pr: { x: 100, y: 200 },
      mrp: { x: 50, y: 400 },
      generatemrp: { x: 70, y: 600 },
      quotations: { x: 600, y: 100 },
      openpr: { x: 400, y: 200 },
      po: { x: 600, y: 350 },
      openpo: { x: 800, y: 200 },
      receive: { x: 1000, y: 200 },
      generateinvoice: { x: 1150, y: 306 },
      invoice: { x: 900, y: 600 },
      potracker: { x: 620, y: 600 },
    },
  },
};

export default function PuDashboard() {
  const router = useRouter();
  const { settings } = useSettings();
  const { navCollapsed } = settings;
  const { width: screenWidth } = useWindowDimensions();

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

  const menuWidth =
    screenWidth <= 768 ? 180 :
    screenWidth <= 1024 ? 200 :
    screenWidth <= 1280 ? 210 :
    screenWidth <= 1366 ? 220 :
    screenWidth <= 1600 ? 240 : 300;

  const sidebarWidth = navCollapsed ? 10 : menuWidth;
  const availableWidth = Math.max(0, screenWidth - sidebarWidth);

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

  const getLayoutKey = width => {
    if (width <= 375) return LAYOUT_KEY.SMALL_MOBILE;
    if (width <= 480) return LAYOUT_KEY.MOBILE;
    if (width <= 600) return LAYOUT_KEY.LARGE_MOBILE;
    if (width <= 768) return LAYOUT_KEY.IPAD;
    if (width <= 1024) return LAYOUT_KEY.TABLET;
    if (width <= 1280) return LAYOUT_KEY.LAPTOP;
    return LAYOUT_KEY.DESKTOP;
  }

  const layoutKey = getLayoutKey(availableWidth);
  const layout = RESPONSIVE_LAYOUTS[layoutKey];

  const nodes = [
    {
      id: "pr",
      type: "square",
      position: layout.positions.pr,
      width: layout.squareWidth,
      height: layout.squareHeight,
      style: { width: layout.squareWidth, height: layout.squareHeight },
      data: {
        label: labels?.pr ?? "",
        color: "#f4ea2a",
        path: "/purchase-requisition/",
      },
    },
    {
      id: "mrp",
      type: "square",
      position: layout.positions.mrp,
      width: layout.squareWidth,
      height: layout.squareHeight,
      style: { width: layout.squareWidth, height: layout.squareHeight },
      data: {
        label: labels?.mrp ?? "",
        color: "#f4ea2a",
        path: "/ir-mat-planning/",
      },
    },
    {
      id: "generatemrp",
      type: "circle",
      position: layout.positions.generatemrp,
      width: layout.circleSize,
      height: layout.circleSize,
      style: { width: layout.circleSize, height: layout.circleSize },
      data: {
        label: labels?.genMrp ?? "",
        color: "#6cc04a",
        path: "/ir-gen-mat-planning/",
      },
    },
    {
      id: "po",
      type: "square",
      position: layout.positions.po,
      width: layout.squareWidth,
      height: layout.squareHeight,
      style: { width: layout.squareWidth, height: layout.squareHeight },
      data: {
        label: labels?.po ?? "",
        color: "#ff3c2f",
        textColor: "#fff",
        path: "/pu-ord/",
      },
    },
    {
      id: "potracker",
      type: "circle",
      position: layout.positions.potracker,
      width: layout.circleSize,
      height: layout.circleSize,
      style: { width: layout.circleSize, height: layout.circleSize },
      data: {
        label: labels?.poTracker ?? "",
        color: "#6cc04a",
        path: "/po-tracking/",
      },
    },
    {
      id: "quotations",
      type: "square",
      position: layout.positions.quotations,
      width: layout.squareWidth,
      height: layout.squareHeight,
      style: { width: layout.squareWidth, height: layout.squareHeight },
      data: {
        label: labels?.qtn ?? "",
        color: "#ff3c2f",
        textColor: "#fff",
        path: "/pu-qtn/",
      },
    },
    {
      id: "receive",
      type: "square",
      position: layout.positions.receive,
      width: layout.squareWidth,
      height: layout.squareHeight,
      style: { width: layout.squareWidth, height: layout.squareHeight },
      data: {
        label: labels?.shp ?? "",
        color: "#2e86c1",
        textColor: "#fff",
        path: "/shipments/",
      },
    },
    {
      id: "invoice",
      type: "square",
      position: layout.positions.invoice,
      width: layout.squareWidth,
      height: layout.squareHeight,
      style: { width: layout.squareWidth, height: layout.squareHeight },
      data: {
        label: labels?.pi ?? "",
        color: "#2e86c1",
        textColor: "#fff",
        path: "/pu-trx/5004/",
      },
    },
    {
      id: "generateinvoice",
      type: "circle",
      position: layout.positions.generateinvoice,
      width: layout.circleSize,
      height: layout.circleSize,
      style: { width: layout.circleSize, height: layout.circleSize },
      data: {
        label: labels?.genIvc ?? "",
        color: "#6cc04a",
        path: "/generate-purch-inv/",
      },
    },
    {
      id: "openpo",
      type: "hex",
      position: layout.positions.openpo,
      width: layout.hexWidth,
      height: layout.hexHeight,
      style: { width: layout.hexWidth, height: layout.hexHeight },
      data: {
        label: labels?.openPo ?? "",
        color: "#f5f5f5",
        path: "/pu-open-po/",
      },
    },
    {
      id: "openpr",
      type: "hex",
      position: layout.positions.openpr,
      width: layout.hexWidth,
      height: layout.hexHeight,
      style: { width: layout.hexWidth, height: layout.hexHeight },
      data: {
        label: labels?.openPr ?? "",
        color: "#f5f5f5",
        path: "/pu-open-pr/",
      },
    },
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
        key={layoutKey}
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
