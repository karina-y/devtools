/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

//

import React, { PureComponent } from "react";

import { connect } from "../../utils/connect";

import AccessibleImage from "./AccessibleImage";

import { getSourceClassnames } from "../../utils/source";
import { getFramework } from "../../utils/tabs";
import { getSymbols, getTabs } from "../../selectors";

import "./SourceIcon.css";

export default class SourceIcon extends PureComponent {
  render() {
    const { shouldHide, source } = this.props;
    const iconClass = getSourceClassnames(source);

    if (shouldHide && shouldHide(iconClass)) {
      return null;
    }

    return <AccessibleImage className={`source-icon ${iconClass}`} />;
  }
}
