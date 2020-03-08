import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Login";
import {StreamChat} from 'stream-chat'

export default class App extends Component {

  state = {
    isAuthenticated: false,
  }

  constructor(props) {
    super(props);
    this.chatClient = new StreamChat('9agc4x9dmrft');
  }

  setUser = (user, token) => {
    this.chatClient.setUser(user, token);
    this.setState({isAuthenticated:true});
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {this.state.isAuthenticated ? null : <Login cb={this.setUser} />}
        </header>
      </div>
    );
  }
}
