/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { Component, createElement } = require("react");
const dom = require("react-dom-factories");
const { connect } = require("devtools/client/shared/redux/visibility-handler-connect");
const actions = require("devtools/client/webconsole/actions/index");
const ReactDOM = require("react-dom");
const { selectors } = require("ui/reducers");

const PropTypes = require("prop-types");
const {
  MessageContainer,
} = require("devtools/client/webconsole/components/Output/MessageContainer");

const { MESSAGE_TYPE } = require("devtools/client/webconsole/constants");

class ConsoleOutput extends Component {
  static get propTypes() {
    return {
      messages: PropTypes.object.isRequired,
      messagesUi: PropTypes.array.isRequired,
      timestampsVisible: PropTypes.bool,
      messagesPayload: PropTypes.object.isRequired,
      warningGroups: PropTypes.object.isRequired,
      visibleMessages: PropTypes.array.isRequired,
      pausedExecutionPoint: PropTypes.string,
    };
  }

  componentDidMount() {
    if (this.props.visibleMessages.length > 0) {
      scrollToBottom(this.outputNode);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.closestMessage != prevProps.closestMessage) {
      return this.scrollToClosestMessage();
    }

    this.maybeScrollToResult(prevProps);
  }

  scrollToClosestMessage() {
    const { closestMessage } = this.props;

    if (!closestMessage) {
      return;
    }

    const outputNode = ReactDOM.findDOMNode(this);
    const element = outputNode.querySelector(`.message[data-message-id="${closestMessage.id}"]`);

    if (!element) {
      return;
    }

    const consoleHeight = outputNode.getBoundingClientRect().height;
    const elementTop = element.getBoundingClientRect().top;
    if (elementTop < 30 || elementTop + 50 > consoleHeight) {
      element.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  maybeScrollToResult(prevProps) {
    const messagesDelta = this.props.messages.size - prevProps.messages.size;

    // [...this.props.messages.values()] seems slow
    // we should have a separate messageList somewhere we can check OR
    // use a memoization function to be able to get the last message quickly
    const lastMessage = [...this.props.messages.values()][this.props.messages.size - 1];

    if (messagesDelta <= 0 || lastMessage.type !== MESSAGE_TYPE.RESULT) {
      return;
    }

    const node = ReactDOM.findDOMNode(this);
    const resultNode = node.querySelector(`div[data-message-id='${lastMessage.id}']`);

    if (!resultNode) {
      return;
    }

    // Don't scroll to the evaluation result if it's already in view.
    const { top, bottom } = resultNode.getBoundingClientRect();
    const scrolledParentRect = node.getBoundingClientRect();
    const isVisible = top >= scrolledParentRect.top && bottom <= scrolledParentRect.bottom;

    if (isVisible) {
      return;
    }

    // Scroll to the previous message node if it exists. It should be the
    // input which triggered the evaluation result we're scrolling to.
    const previous = resultNode.previousSibling;
    (previous || resultNode).scrollIntoView();
  }

  getIsFirstMessageForPoint(index, visibleMessages) {
    const { messages } = this.props;

    if (index == 0) {
      return true;
    }

    let previousMessage = messages.get(visibleMessages[index - 1]);
    let currentMessage = messages.get(visibleMessages[index]);

    if (!previousMessage || !currentMessage) {
      return false;
    }

    return previousMessage.executionPoint !== currentMessage.executionPoint;
  }

  render() {
    let {
      dispatch,
      visibleMessages,
      messages,
      messagesUi,
      messagesPayload,
      warningGroups,
      timestampsVisible,
      pausedExecutionPoint,
      closestMessage,
    } = this.props;

    const messageNodes = visibleMessages.map((messageId, i) =>
      createElement(MessageContainer, {
        dispatch,
        key: messageId,
        messageId,
        open: messagesUi.includes(messageId),
        payload: messagesPayload.get(messageId),
        timestampsVisible,
        badge: warningGroups.has(messageId) ? warningGroups.get(messageId).length : null,
        inWarningGroup:
          warningGroups && warningGroups.size > 0
            ? isMessageInWarningGroup(messages.get(messageId), visibleMessages)
            : false,
        pausedExecutionPoint,
        getMessage: () => messages.get(messageId),
        isPaused: closestMessage?.id == messageId,
        isFirstMessageForPoint: this.getIsFirstMessageForPoint(i, visibleMessages),
      })
    );

    return dom.div(
      {
        className: "webconsole-output",
        role: "main",
        ref: node => {
          this.outputNode = node;
        },
      },
      messageNodes
    );
  }
}

function scrollToBottom(node) {
  if (node.scrollHeight > node.clientHeight) {
    node.scrollTop = node.scrollHeight;
  }
}

function mapStateToProps(state, props) {
  return {
    pausedExecutionPoint: selectors.getExecutionPoint(state),
    closestMessage: selectors.getClosestMessage(state),
    messages: selectors.getAllMessagesById(state),
    visibleMessages: selectors.getVisibleMessages(state),
    messagesUi: selectors.getAllMessagesUiById(state),
    messagesPayload: selectors.getAllMessagesPayloadById(state),
    warningGroups: selectors.getAllWarningGroupsById(state),
    timestampsVisible: state.consoleUI.timestampsVisible,
  };
}
const mapDispatchToProps = dispatch => ({
  openLink: actions.openLink,
  dispatch,
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(ConsoleOutput);
