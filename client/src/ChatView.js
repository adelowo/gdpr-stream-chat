import React, { useState, Component } from "react";
import {
  Chat,
  MessageList,
  MessageInput,
  Thread,
  Channel,
  Window,
  ChannelList,
  withChannelContext
} from "stream-chat-react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";

function GDPRExporter(props) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div>
      <Button variant="primary" onClick={handleShow}>
        Export Data
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <FormControl
              placeholder="Recipient's email"
              aria-label="Recipient's username"
              aria-describedby="basic-addon2"
              type="email"
              onChange={setEmail}
            />
            <InputGroup.Append>
              <Button
                variant="primary"
                onClick={() => {
                  axios
                    .post("http://localhost:5200/users/export", {
                      user_id: props.user,
                      email: email
                    })
                    .then(res => {
                      alert(res.data.message);
                      handleClose();
                    })
                    .catch(err => {
                      console.log(err);
                      alert("Could not export data");
                    });
                }}
              >
                Export
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          An email containing the exported data will be sent to you
        </Modal.Footer>
      </Modal>
    </div>
  );
}

class MyChannelPreview extends Component {
  render() {
    const { setActiveChannel, channel } = this.props;
    const unreadCount = channel.countUnread();

    return (
      <div className="channel_preview">
        <a href="#" onClick={e => setActiveChannel(channel, e)}>
          {channel.data.name}
        </a>

        <span>Unread messages: {unreadCount}</span>
      </div>
    );
  }
}

class MyMessageComponent extends Component {
  render() {
    return (
      <div>
        <b>{this.props.message.user.name}</b> {this.props.message.text}
      </div>
    );
  }
}

const CustomChannelHeader = withChannelContext(
  class CustomChannelHeader extends React.PureComponent {
    render() {
      return (
        <div className="str-chat__header-livestream">
          <div className="str-chat__header-livestream-left">
            <p className="str-chat__header-livestream-left--title">
              {this.props.channel.data.name}
            </p>
            <p className="str-chat__header-livestream-left--members">
              {Object.keys(this.props.members).length} members,{" "}
              {this.props.watcher_count} online
            </p>
          </div>
          <div className="str-chat__header-livestream-right">
            <div className="str-chat__header-livestream-right-button-wrapper">
              <GDPRExporter user={this.props.client.user_id} />
            </div>
          </div>
        </div>
      );
    }
  }
);

export default class ChatView extends Component {
  render() {
    return (
      <Chat client={this.props.chatClient} theme={"messaging light"}>
        <ChannelList Preview={MyChannelPreview} />
        <Channel Message={MyMessageComponent}>
          <Window>
            <CustomChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    );
  }
}
