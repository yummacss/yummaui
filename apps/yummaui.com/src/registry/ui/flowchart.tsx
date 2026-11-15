"use client";

import "@xyflow/react/dist/base.css";
import { IconMinus, IconPlus, IconMaximize } from "@tabler/icons-react";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  type Edge,
  type EdgeProps,
  getBezierPath,
  Handle,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  useViewport,
} from "@xyflow/react";
import { type ReactNode, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

export interface FlowchartStep {
  /** A name unique within the chart, which edges point at. */
  id: string;
  /** What the step does. */
  label: string;
  /** A line under the label, such as where it acts. */
  description?: string;
  /** A glyph in a tile beside the label. */
  icon?: ReactNode;
  /** A short tag on the step's corner, such as "Done". */
  status?: string;
  /** Where the step sits on the canvas, in pixels at 100%. */
  position: { x: number; y: number };
}

export interface FlowchartLink {
  /** The step the edge leaves. */
  from: string;
  /** The step it arrives at. */
  to: string;
  /** Marks the edge in use, with a dash that flows along it. */
  running?: boolean;
}

export interface FlowchartProps {
  /** The steps, each a raised node. */
  steps: FlowchartStep[];
  /** The edges between them, from one step's foot to another's head. */
  links: FlowchartLink[];
  /** Lets people drag steps to new places. */
  draggable?: boolean;
  /** The zoom bar in the corner: out, in and fit. */
  controls?: boolean;
  /**
   * Corner radius of the canvas, the steps and the bar. Inherits the nearest
   * `Shape`.
   */
  shape?: Shape;
  /**
   * A dragged step lifting and the running dash flowing. Reduced motion turns
   * both off.
   */
  animated?: boolean;
  /**
   * The focus outline. `true` draws it, `false` removes it, and a string of
   * Yumma CSS utilities restyles it. Removing it outright and putting nothing
   * back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /**
   * Extra classes on the canvas, where its height goes. `merge` folds them in
   * last, so one here replaces the component's own class for the same utility.
   */
  className?: string;
}

type StepData = FlowchartStep & Record<string, unknown>;

// what every step and edge needs from the chart, without passing it through the library
const Look = createContext({ shape: "rounded" as Shape, lift: true, outline: "" });

// the library paints its own dot; ours sits inside it, so the library's stylesheet cannot win
const BARE = { background: "none", border: "none", width: 8, height: 8, minWidth: 0, minHeight: 0 };
const DOT = "d:b w:2 h:2 br:9999 bw:1 bc:hint bg:raised";

function Step({ data, selected, dragging }: NodeProps<Node<StepData>>) {
  const { shape, lift } = useContext(Look);
  return (
    <div
      className={merge(
        "p:r d:f ai:c g:3 w:48 py:2 pl:2 pr:3 bw:1 bg:raised c:label",
        RADIUS.popup[shape],
        selected ? "bc:check" : "bc:rim",
        dragging ? "bs-o:xl" : "bs-o:key",
        lift && "tp:a tdu:200 ttf:out-quart @prm:tp:none",
        lift && dragging && "s:103",
      )}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} style={BARE}>
        <span className={DOT} />
      </Handle>
      {data.icon && (
        <span
          aria-hidden
          className={merge("d:f ai:c jc:c fs:0 w:8 h:8 bw:1 bc:line bg:well c:hint", RADIUS.chip[shape])}
        >
          {data.icon}
        </span>
      )}
      <span className="d:f fd:c min-w:0">
        <span className="fs:sm fw:500 ws:nw o:h to:e">{data.label}</span>
        {data.description && <span className="fs:xs c:hint ws:nw o:h to:e">{data.description}</span>}
      </span>
      {data.status && (
        <span
          className={merge(
            "p:a t:-2 r:3 px:2 fs:xs fw:500 lh:4 bw:1 bc:line bg:raised c:hint",
            RADIUS.chip[shape],
          )}
        >
          {data.status}
        </span>
      )}
      <Handle type="source" position={Position.Bottom} isConnectable={false} style={BARE}>
        <span className={DOT} />
      </Handle>
    </div>
  );
}

function Link({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) {
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  const running = Boolean(data?.running);
  const marker = `arrow-${id}`;
  return (
    // the marker lives beside its edge, so its stroke reads the edge's own color
    <g className={running ? "c:label" : "c:hint"}>
      <defs>
        <marker id={marker} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1l8 4-8 4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      <BaseEdge path={path} markerEnd={`url(#${marker})`} style={{ stroke: "currentColor", strokeWidth: 1.5 }} />
    </g>
  );
}

const NODE_TYPES = { step: Step };
const EDGE_TYPES = { link: Link };

function Bar() {
  const { shape, outline } = useContext(Look);
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const key = merge(outline, "d:f ai:c jc:c w:8 h:8 bw:1 bc:transparent bg:transparent c:label c:p h:bg:well", RADIUS.item[shape]);
  return (
    <div className="p:a l:3 r:3 b:3 zi:10 d:f ai:c jc:sb g:2 pe:none">
      <div
        role="toolbar"
        aria-label="Zoom"
        className={merge("d:f g:1 p:1 bw:1 bc:rim bg:raised bs-o:key pe:auto", RADIUS.bar[shape])}
      >
        <button type="button" aria-label="Zoom out" className={key} onClick={() => zoomOut({ duration: 200 })}>
          <IconMinus aria-hidden className="w:4 h:4" />
        </button>
        <button type="button" aria-label="Zoom in" className={key} onClick={() => zoomIn({ duration: 200 })}>
          <IconPlus aria-hidden className="w:4 h:4" />
        </button>
        <button type="button" aria-label="Fit to view" className={key} onClick={() => fitView({ duration: 300, padding: 0.15 })}>
          <IconMaximize aria-hidden className="w:4 h:4" />
        </button>
      </div>
      <span className={merge("px:2 py:1 fs:xs c:hint fvn:tn bw:1 bc:line bg:raised", RADIUS.chip[shape])}>
        {Math.round(zoom * 100)}%
      </span>
    </div>
  );
}

function Chart({ steps, links, draggable = true, controls = true, shape: shapeProp, animated = true, focus = true, className }: FlowchartProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [still, setStill] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setStill(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const moving = animated && !still;

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<StepData>>([]);
  useEffect(() => {
    setNodes(steps.map((step) => ({ id: step.id, type: "step", position: step.position, data: step as StepData })));
  }, [steps, setNodes]);
  const edges = useMemo<Edge[]>(
    () =>
      links.map((link) => ({
        id: `${link.from}-${link.to}`,
        source: link.from,
        target: link.to,
        type: "link",
        animated: moving && link.running,
        data: { running: link.running },
      })),
    [links, moving],
  );
  const look = useMemo(() => ({ shape, lift: moving, outline }), [shape, moving, outline]);

  // Yumma CSS caps every svg at max-width 100%; the edges' svg sits in a box 0px wide, so it would draw nothing
  const canvas = useRef<HTMLDivElement>(null);
  useEffect(() => {
    for (const layer of canvas.current?.querySelectorAll<SVGElement>(".react-flow__edges svg") ?? []) {
      layer.style.maxWidth = "none";
    }
  });

  return (
    <Look.Provider value={look}>
      <div ref={canvas} className={merge("p:r w:100% h:100 o:h bw:1 bc:line bg:well bs-o:sunk", RADIUS.popup[shape], className)}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          nodesDraggable={draggable}
          nodesConnectable={false}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.4}
          maxZoom={2}
          className="c:line"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1.2} color="currentColor" />
          {controls && <Bar />}
        </ReactFlow>
      </div>
    </Look.Provider>
  );
}

/**
 * Steps joined by edges on a canvas you can pan and zoom, such as what happens
 * to a file once it is saved.
 */
export default function Flowchart(props: FlowchartProps) {
  return (
    <ReactFlowProvider>
      <Chart {...props} />
    </ReactFlowProvider>
  );
}
