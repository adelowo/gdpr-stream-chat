import React, { Component } from "react";
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
              <button className="export" onClick={() => alert("Oops")}>
                Export data
              </button>
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
