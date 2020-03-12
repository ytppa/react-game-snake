import React from "react";

class SwipeListener extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  mobile = require("is-mobile");
  // document.addEventListener('swiped-left', function(e) {
  //   console.log(e.target); // element that was swiped
  // });
  render() {
    const isMobile = this.mobile();

    return (
      <div className="swipeListener">{isMobile ? `mobile` : `desktop`}</div>
    );
  }
}

export default SwipeListener;
