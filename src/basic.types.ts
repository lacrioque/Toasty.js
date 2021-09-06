export interface TransitionAnimateRecord extends Object {
  init: string;
  show: string;
  hide: string;
}

export interface TransitionToastRecord extends Object {
  info: string;
  success: string;
  warning: string;
  error: string;
}

export interface TransitionClassListMappings extends Object {
  container: string;
  mainwrapp: string;
  toasts: TransitionToastRecord;
  animate: TransitionAnimateRecord;
  progressbar: string;
  playerclass: string;
}

export interface ToastyOptions extends Object {
  classname?: string;
  transition?: string;
  insertBefore?: boolean;
  duration?: number;
  enableSounds?: boolean;
  autoClose?: boolean;
  progressBar?: boolean;
  sounds?: Record<string, string>;
  onShow?: (type: string) => void;
  onHide?: (type: string) => void;
  prependTo?: HTMLElement | ChildNode | Element;
}

export interface ToastySettings {
  classname: string;
  transition: string;
  insertBefore: boolean;
  duration: number;
  enableSounds: boolean;
  autoClose: boolean;
  progressBar: boolean;
  sounds: Record<string, string>;
  onShow: (type: string) => void;
  onHide: (type: string) => void;
  prependTo: HTMLElement | ChildNode;
}
