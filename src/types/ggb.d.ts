/**
 * GeoGebra Applet 全局类型补丁
 * 基于 GeoGebra Apps API 官方参考 (v5.0+) 声明本工具使用的方法。
 */

export interface GGBAppletApi {
  // ── 创建对象 ──
  evalCommand: (cmd: string) => boolean;
  evalCommandCAS?: (cmd: string) => string;
  evalCommandGetLabels?: (cmd: string) => string;
  evalLaTeX?: (input: string) => boolean;

  // ── 通用对象状态 ──
  setVisible: (label: string, visible: boolean) => void;
  setColor: (label: string, r: number, g: number, b: number) => void;
  setLineThickness: (label: string, thickness: number) => void;
  setLineStyle: (label: string, style: number) => void;
  setPointStyle: (label: string, style: number) => void;
  setPointSize: (label: string, size: number) => void;
  setFilling: (label: string, opacity: number) => void;
  setCaption: (label: string, caption: string) => void;
  setLabelStyle: (label: string, style: number) => void;
  setLabelVisible: (label: string, visible: boolean) => void;
  setFixed: (label: string, fixed: boolean, selectionAllowed?: boolean) => void;
  setTrace: (label: string, flag: boolean) => void;
  setLayer: (label: string, layer: number) => void;
  setLayerVisible: (layer: number, visible: boolean) => void;
  setDisplayStyle: (label: string, style: string) => void;
  setValue: (label: string, value: number) => void;
  setTextValue: (label: string, value: string) => void;
  setCoords: (label: string, x: number, y: number, z?: number) => void;
  deleteObject: (label: string) => void;
  renameObject: (oldName: string, newName: string) => boolean;
  setAuxiliary: (label: string, auxiliary: boolean) => void;

  // ── 自动动画 ──
  setAnimating: (label: string, animate: boolean) => void;
  setAnimationSpeed: (label: string, speed: number) => void;
  startAnimation: () => void;
  stopAnimation: () => void;
  isAnimationRunning: () => boolean;

  // ── 获取对象状态 ──
  getXcoord: (label: string) => number;
  getYcoord: (label: string) => number;
  getZcoord: (label: string) => number;
  getValue: (label: string) => number;
  getColor: (label: string) => string;
  getVisible: (label: string, view?: number) => boolean;
  getValueString: (label: string, useLocalizedInput?: boolean) => string;
  getDefinitionString: (label: string) => string;
  getCommandString: (label: string, useLocalizedInput?: boolean) => string;
  getLaTeXString: (label: string) => string;
  getObjectType: (label: string) => string;
  exists: (label: string) => boolean;
  isDefined: (label: string) => boolean;
  isIndependent: (label: string) => boolean;
  isMoveable: (label: string) => boolean;
  getAllObjectNames: (type?: string) => string[];
  getObjectNumber: () => number;
  getObjectName: (i: number) => string;
  getLayer: (label: string) => number;
  getLineStyle: (label: string) => number;
  getLineThickness: (label: string) => number;
  getPointStyle: (label: string) => number;
  getPointSize: (label: string) => number;
  getFilling: (label: string) => number;
  /** 对象 XML 表示（含 lineOpacity/fillOpacity 等样式属性，透明度精确读取用） */
  getXML?: (label: string) => string;
  getCaption: (label: string, substitutePlaceholders?: boolean) => string;
  getLabelStyle: (label: string) => number;
  getLabelVisible: (label: string) => boolean;

  // ── 构造 / UI ──
  setCoordSystem: (xmin: number, xmax: number, ymin: number, ymax: number) => void;
  setCoordSystem3D?: (xmin: number, xmax: number, ymin: number, ymax: number, zmin: number, zmax: number, yVertical: boolean) => void;
  /** 同步 applet 内部尺寸（resize 时更新 viewWidth/viewHeight，坐标系据此重算缩放） */
  setSize?: (width: number, height: number) => void;
  /** 当前 applet 像素尺寸（视窗宽高比校正用）。GGB 官方 API。 */
  getWidth?: () => number;
  getHeight?: () => number;
  setAxesVisible: (xAxis: boolean, yAxis: boolean, zAxis?: boolean) => void;
  setAxisLabels: (view: number, xLabel: string, yLabel: string, zLabel: string) => void;
  setAxisUnits: (view: number, xUnit: string, yUnit: string, zUnit: string) => void;
  setAxisSteps: (view: number, xStep: number, yStep: number, zStep: number) => void;
  setGridVisible: (flag: boolean) => void;
  getGridVisible: (view?: number) => boolean;
  setPerspective: (perspective: string) => void;
  getPerspectiveXML: () => string;
  enable3D: (enable: boolean) => void;
  enableRightClick: (enable: boolean) => void;
  enableLabelDrags: (enable: boolean) => void;
  enableShiftDragZoom: (enable: boolean) => void;
  enableCAS: (enable: boolean) => void;
  setRepaintingActive: (flag: boolean) => void;
  setErrorDialogsActive: (flag: boolean) => void;
  setOnTheFlyPointCreationActive: (flag: boolean) => void;
  setPointCapture: (view: number, mode: number) => void;
  setRounding: (round: string) => void;
  hideCursorWhenDragging: (flag: boolean) => void;
  setMode: (mode: number) => void;
  getMode: () => number;
  refreshViews: () => void;
  showAllObjects: () => void;
  setUndoPoint: () => void;
  undo: () => void;
  redo: () => void;
  showToolBar: (show: boolean) => void;
  showMenuBar: (show: boolean) => void;
  showAlgebraInput: (show: boolean) => void;
  showResetIcon: (show: boolean) => void;

  // ── 事件监听器 ──
  registerAddListener: (fn: (label: string) => void) => void;
  registerRemoveListener: (fn: (label: string) => void) => void;
  registerUpdateListener: (fn: (label: string) => void) => void;
  registerObjectUpdateListener: (label: string, fn: () => void) => void;
  registerClickListener: (label: string, fn: () => void) => void;
  registerClientListener: (fn: (event: Record<string, unknown>) => void) => void;
  unregisterAddListener: (fn: (label: string) => void) => void;
  unregisterRemoveListener: (fn: (label: string) => void) => void;
  unregisterUpdateListener: (fn: (label: string) => void) => void;
  unregisterObjectUpdateListener: (label: string) => void;
  unregisterClickListener: (label: string) => void;
  unregisterClientListener: (fn: (event: Record<string, unknown>) => void) => void;

  // ── 文件 / 导出 ──
  reset: () => void;
  newConstruction: () => void;
  getBase64: (callback?: (data: string) => void) => string | void;
  setBase64: (base64: string, callback?: () => void) => void;
  getPNGBase64: (exportScale: number, transparent: boolean, dpi: number) => string;
  getScreenshotBase64: (callback: (data: string) => void) => void;
  writePNGtoFile: (filename: string, exportScale: number, transparent: boolean, dpi: number) => boolean;
  exportSVG: (callback: ((svg: string) => void) | string) => void;
  exportPDF: (scale: number, callback: ((pdf: string) => void) | string, sliderLabel?: string) => void;
  openFile: (url: string) => void;
}

export interface GGBAppletParameters {
  appName?: "classic" | "graphing" | "geometry" | "3d" | "suite";
  width?: number;
  height?: number;
  showToolBar?: boolean;
  showAlgebraInput?: boolean;
  showMenuBar?: boolean;
  showResetIcon?: boolean;
  showKeyboardOnFocus?: boolean;
  enableLabelDrags?: boolean;
  enableShiftDragZoom?: boolean;
  enableRightClick?: boolean;
  perspective?: string;
  errorDialogsActive?: boolean;
  useBrowserForJS?: boolean;
  language?: string;
  appletOnLoad?: (api: GGBAppletApi) => void;
  scaleContainerClass?: string;
  preventFocus?: boolean;
  borderColor?: string;
}

declare global {
  interface Window {
    GGBApplet: new (params: GGBAppletParameters, html5NoWebSimple?: boolean) => {
      inject: (elementId: string) => void;
      setHTML5Codebase?: (url: string) => void;
    };
  }
}

export {};
