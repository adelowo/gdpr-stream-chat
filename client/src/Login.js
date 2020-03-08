import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";

export default class Login extends Component {
  state = {
    username: "",
    password: ""
  };

  handleSubmit = e => {
    e.preventDefault();

    axios
      .post("http://localhost:5200/users/auth", this.state)
      .then(res => {
        if (!res.data.status) {
          alert(res.data.message);
          return;
        }

        this.props.cb(res.data.user,res.data.token)
      })
      .catch(err => {
        console.error(err);
        alert(
          "Could not log you in now. Please check if password and username matches"
        );
      });
  };

  handlePasswordChange = e => {
    this.setState({
      password: e.target.value
    });
  };

  handleUsernameChange = e => {
    this.setState({
      username: e.target.value
    });
  };

  render() {
    return (
      <div className="Login">
        <Form onSubmit={this.handleSubmit}>
          <Form.Group controlId="email" bsSize="large">
            <Form.Control
              autoFocus
              type="text"
              value={this.state.username}
              onChange={this.handleUsernameChange}
            />
          </Form.Group>
          <Form.Group controlId="password" bsSize="large">
            <Form.Control
              value={this.state.password}
              onChange={this.handlePasswordChange}
              type="password"
            />
          </Form.Group>
          <Button
            block
            bsSize="large"
            disabled={
              !(
                this.state.username.length > 0 && this.state.password.length > 0
              )
            }
            type="submit"
          >
            Login
          </Button>
        </Form>
      </div>
    );
  }
}

