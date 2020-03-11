import React from "react";

function Button({ children, handler }) {
  return (
    <button class="button" onClick={handler}>
      {children}
    </button>
  );
}

export default Button;
