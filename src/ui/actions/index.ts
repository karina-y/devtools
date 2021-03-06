import { Action, Store } from "redux";

import * as appActions from "./app";
import * as timelineActions from "./timeline";
import * as metadataActions from "./metadata";
import * as sessionActions from "./session";
import { ThunkAction } from "ui/utils/thunk";
import { UIState } from "ui/state";
import type { AppAction } from "./app";
import type { MetadataAction } from "./metadata";
import type { TimelineAction } from "./timeline";
import * as eventListeners from "devtools/client/debugger/src/actions/event-listeners";
import debuggerActions from "devtools/client/debugger/src/actions";
import { MarkupAction } from "devtools/client/inspector/markup/actions/markup";
import { EventTooltipAction } from "devtools/client/inspector/markup/actions/eventTooltip";
import { SessionAction } from "ui/actions/session";
import UserProperties from "devtools/client/inspector/rules/models/user-properties";
const consoleActions = require("devtools/client/webconsole/actions");

type DebuggerAction = Action<"RESUME">;

export type UIAction =
  | AppAction
  | MetadataAction
  | TimelineAction
  | MarkupAction
  | EventTooltipAction
  | SessionAction
  | DebuggerAction;

interface ThunkExtraArgs {
  client: any;
  panels: any;
  prefsService: any;
  toolbox: any;
  parser: any;
  search: any;
}

export type UIThunkAction<TReturn = void> = ThunkAction<TReturn, UIState, ThunkExtraArgs, UIAction>;

export type UIStore = Store<UIState, UIAction> & {
  userProperties?: UserProperties;
};

export const actions = {
  ...appActions,
  ...timelineActions,
  ...metadataActions,
  ...eventListeners,
  ...debuggerActions,
  ...consoleActions,
  ...sessionActions,
};
