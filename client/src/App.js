import React, { Component } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "stream-chat-react/dist/css/index.css";
import Login from "./Login";
import ChatView from "./ChatView";
import { StreamChat } from "stream-chat";

export default class App extends Component {
  state = { isAuthenticated: false };

  constructor(props) {
    super(props);
    this.chatClient = new StreamChat("myzp4by98ukn");
  }

  setUser = (user, token) => {
    this.chatClient.setUser(user, token);
    this.setState({ isAuthenticated: true });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {this.state.isAuthenticated ? (
            <ChatView chatClient={this.chatClient} />
          ) : (
            <Login cb={this.setUser} />
          )}
        </header>
      </div>
    );
  }
}
