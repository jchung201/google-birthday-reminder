import React, { Component } from "react";
import ReactDOM from "react-dom";
import Home from "../presentational/Home.jsx";
class HomeContainer extends Component {
  state = { loggedIn: false };

  handleSuccess = () => {};
  handleFail = () => {};
  render() {
    const { loggedIn } = this.state;
    return (
      <div>
        <Home loggedIn={loggedIn} />
      </div>
    );
  }
}
export default HomeContainer;

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<HomeContainer />, wrapper) : false;
