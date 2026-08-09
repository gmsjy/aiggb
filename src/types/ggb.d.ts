/**
 * GeoGebra Applet 全局类型补丁
 * 仅声明本工具实际用到的方法，未覆盖完整 SDK。
 */

export interface GGBAppletApi {
  evalCommand: (cmd: string) => boolean;
  evalCommandCAS?: (cmd: string) => string;
  setVisible: (label: string, visible: boolean) => void;
  setColor: (label: string, r: number, g: number, b: number) => void;
  setLineThickness: (label: string, thickness: number) => void;
  setLineStyle: (label: string, style: number) => void;
  setFilling: (label: string, opacity: number) => void;
  setCaption: (label: string, caption: string) => void;
  setLabelStyle: (label: string, style: number) => void;
  setLabelVisible: (label: string, visible: boolean) => void;
  setCoordSystem: (xmin: number, xmax: number, ymin: number, ymax: number) => void;
  setAxisLabels: (view: number, xLabel: string, yLabel: string, zLabel: string) => void;
  setAxisUnits?: (view: number, xUnit: string, yUnit: string, zUnit: string) => void;
  setPerspective?: (perspective: string) => void;
  enable3D?: (enable: boolean) => void;
  getPerspectiveXML?: () => string;
  setAnimating: (label: string, animate: boolean) => void;
  setAnimationSpeed: (label: string, speed: number) => void;
  startAnimation: () => void;
  stopAnimation: () => void;
  setTrace: (label: string, flag: boolean) => void;
  deleteObject: (label: string) => void;
  reset: () => void;
  newConstruction: () => void;
  getBase64: (callback?: (data: string) => void) => string | void;
  setBase64: (base64: string, callback?: () => void) => void;
  getPNGBase64: (exportScale: number, transparent: boolean, dpi: number) => string;
  getAllObjectNames: () => string[];
  exists: (label: string) => boolean;
  registerAddListener?: (fn: (label: string) => void) => void;
  registerRemoveListener?: (fn: (label: string) => void) => void;
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
