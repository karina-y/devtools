import React from "react";
import classnames from "classnames";
import { compareNumericStrings } from "../../../../../../../protocol/utils";
import { getExecutionPoint } from "../../../reducers/pause";
import { connect } from "../../../utils/connect";
import { selectors } from "ui/reducers";
const { getAnalysisPointsForLocation } = selectors;
import { actions } from "ui/actions";
import { findLast, find } from "lodash";

import BreakpointTimeline from "./BreakpointTimeline";
import "./BreakpointNavigation.css";

function BreakpointNavigation({
  executionPoint,
  breakpoint,
  seek,
  analysisPoints,
  setZoomedBreakpoint = () => {},
}) {
  const navigateToPoint = point => {
    if (point) {
      seek(point.point, point.time, true);
    }
  };
  const isEmpty = analysisPoints && analysisPoints?.length == 0;

  let prev, next;

  if (executionPoint && analysisPoints?.length > 0) {
    prev = findLast(analysisPoints, p => compareNumericStrings(p.point, executionPoint) < 0);
    next = find(analysisPoints, p => compareNumericStrings(p.point, executionPoint) > 0);
  }

  return (
    <div className={classnames("breakpoint-navigation", { empty: isEmpty })}>
      {!isEmpty ? (
        <BreakpointNavigationCommands prev={prev} next={next} navigateToPoint={navigateToPoint} />
      ) : null}
      {analysisPoints?.length ? (
        <BreakpointTimeline breakpoint={breakpoint} setZoomedBreakpoint={setZoomedBreakpoint} />
      ) : null}
      {executionPoint ? (
        <BreakpointNavigationStatus
          executionPoint={executionPoint}
          analysisPoints={analysisPoints}
        />
      ) : null}
    </div>
  );
}

function BreakpointNavigationCommands({ prev, next, navigateToPoint }) {
  return (
    <div className="breakpoint-navigation-commands">
      <button
        className={`breakpoint-navigation-command-prev ${!prev ? " disabled" : ""}`}
        disabled={!prev}
        onClick={() => {
          navigateToPoint(prev);
        }}
      >
        <div className="img play-circle" style={{ transform: "rotate(180deg)" }} />
      </button>{" "}
      <button
        className={`breakpoint-navigation-command-next ${!next ? " disabled" : ""}`}
        disabled={!next}
        onClick={() => {
          navigateToPoint(next);
        }}
      >
        <div className="img play-circle" />
      </button>
    </div>
  );
}

function BreakpointNavigationStatus({ executionPoint, analysisPoints }) {
  let status = "";

  if (!analysisPoints) {
    status = "Loading";
  } else if (analysisPoints.length == 0) {
    status = "No hits";
  } else {
    const points = analysisPoints
      ? analysisPoints.filter(point => BigInt(point.point) <= BigInt(executionPoint))
      : [];

    status = `${points.length}/${analysisPoints.length}`;
  }

  return (
    <div className="breakpoint-navigation-status-container">
      <div className="breakpoint-navigation-status">{status}</div>
    </div>
  );
}

const mapStateToProps = (state, { breakpoint }) => ({
  analysisPoints: getAnalysisPointsForLocation(state, breakpoint.location),
  executionPoint: getExecutionPoint(state),
});

export default connect(mapStateToProps, {
  seek: actions.seek,
})(BreakpointNavigation);
