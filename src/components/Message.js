import React from "react";

function Message(props) {
  const text = props.children || "";

  if (text) {
    return (
      <div class="message">
        <div class="message--inner">{text}</div>
      </div>
    );
  }
}

export default Message;
