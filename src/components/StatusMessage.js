import React from "react";

function StatusMessage({ status }) {
  let message = null;
  if (status === "READY") {
    message = <>Press any key to&nbsp;start</>;
  } else if (status === "GAME_OVER") {
    message = (
      <>
        Game over
        <Button handler={this.restartHandler}>Restart</Button>
      </>
    );
  } else if (status === "PAUSE") {
    message = (
      <>
        Game paused.
        <br />
        <br />
        Press «P» to resume.
      </>
    );
  }

  if (message) {
    return (
      <div class="message">
        <div class="message--inner">{message}</div>
      </div>
    );
  } else return null;
}

export default StatusMessage;
