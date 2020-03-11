import React from "react";

import Button from "./Button.js";

function StatusMessage({ status, handleClick }) {
  let message = null;
  if (status === "READY") {
    message = <>Press any key to&nbsp;start</>;
  } else if (status === "GAME_OVER") {
    message = (
      <>
        Game over
        <Button handleClick={handleClick}>Restart</Button>
      </>
    );
  } else if (status === "PAUSE") {
    message = (
      <>
        Game paused.
        <br />
        <br />
        Press «P» or «space» to&nbsp;resume.
      </>
    );
  }

  if (message) {
    return (
      <div className="message">
        <div className="message--inner">{message}</div>
      </div>
    );
  } else return null;
}

export default StatusMessage;
