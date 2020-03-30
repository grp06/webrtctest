import React, { Component } from 'react'
import io from 'socket.io-client';

class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      usernameInput: '',
      savedUsername: '',
      message: '',
      roomId: '',
      allChatMessages: [],
      waitingForPartner: false,
      personTyping: ''
    }
  }

  componentDidMount() {
    const socket = io();
    const username = localStorage.getItem('username')
    console.log('username = ', username)
    this.setState({
      socket,
      savedUsername: username,
    })
    socket.on('welcomeMessage', ({roomId, waitingForPartner}) => {
      this.setState({
        roomId,
        waitingForPartner,
      })
    })

    socket.on('chat', (data) => {
      const { allChatMessages } = this.state
      const updatedAllChatMessages = allChatMessages.concat(data)

      this.setState({
        allChatMessages: updatedAllChatMessages,
        personTyping: ''
      })
    })

    const component = this

    socket.on('typing', function(data) {
      console.log('data = ', data)
      component.setState({
        personTyping: data
      })
    })

  }

  handleUsernameChange = (e) => {
    this.setState({
      usernameInput: e.target.value
    })
  }

  saveUsername = () => {
    const { usernameInput } = this.state
    localStorage.setItem('username', usernameInput)

    this.setState({
      savedUsername: usernameInput
    })
  }
  renderNeedsUsername = () => {
    const { savedUsername } = this.state
    if (!savedUsername && savedUsername !== "undefined") {
      return (
        <div id="usernameContainer">
          <form id="needsUsername">
            <input onChange={this.handleUsernameChange} placeholder="Type a username" type="text" />
            <div><button onClick={this.saveUsername}>Set username</button></div>
          </form>
        </div>
      )

    }
  }

  editUsername = () => {
    localStorage.setItem('username', '')
    this.setState({
      savedUsername: ''
    })
  }

  renderHasUsername = (savedUsername) => {
    if (savedUsername && !this.state.roomId) {
      return (
        <div id="hasUsername">
          <span id="welcome">Welcome, {savedUsername}</span><a id="editUsername" onClick={this.editUsername}>edit</a>
        </div>
      )
    }
  }

  findRoom = () => {
    const bigRandomNumber = Math.round(Math.random()*10000000)
    this.state.socket.emit('join', {
      roomId: bigRandomNumber,
    })
    this.setState({
      waitingForPartner: true
    })
  }

  submitMessage(e) {
    const { message, savedUsername, allChatMessages } = this.state
      e.preventDefault()
    if (message.length) {
      this.state.socket.emit('chat', {
        message: message,
        handle: savedUsername,
      })
      this.setState({
        message: '',
      })
    }
  }

  handleUpdateMessage = (e) => {
    this.state.socket.emit('typing', this.state.savedUsername)
    this.setState({
      message: e.target.value
    })
  }

  renderAllMessages = () => {
    const { allChatMessages } = this.state
    return allChatMessages.map(({handle, message}) => {
      return (
        <p key={message}><strong>{handle}</strong>: {message}</p>
      )
    })
  }

  renderPersonTypingText = (personTyping) => {
    if (personTyping) {
      return <p>{personTyping} is typing...</p>
    }
  }

  renderRoom = () => {
    const { savedUsername,
      roomId,
      message,
      waitingForPartner,
      personTyping,
    } = this.state

    if (waitingForPartner) {
      return (
        <h2>Waiting for a partner to join...</h2>
      )
    }
    if (savedUsername && roomId) {
      return (
        <div id="room-info">
          <div id="mario-chat">
            <div id="chat-window">
              <div id="output">{this.renderAllMessages()}</div>
              <div id="feedback">{this.renderPersonTypingText(personTyping)}</div>
            </div>
            <form type="submit" id="sendMessage" onSubmit={this.submitMessage.bind(this)}>
              <input id="message" type="text" placeholder="enter message" onChange={this.handleUpdateMessage} value={message}/>
              <button id="send">Send</button>
            </form>
          </div>
          <button id="nextButton" onClick={this.findRoom}>Find a new room</button>
        </div>
      )

    }
  }

  renderFindARoom = () => {
    if (this.state.savedUsername && !this.state.roomId) {
      return (
        <button id="joinRoom" onClick={this.findRoom}>Find a room</button>
      )
    }
  }

  render() {
    const { usernameInput, savedUsername, message, roomId } = this.state

    return (
      <div className="container">
        <div id="roomId">{roomId}</div>
        {this.renderNeedsUsername()}
        {this.renderHasUsername(savedUsername)}
        {this.renderFindARoom()}
        {this.renderRoom()}
      </div>
    )
  }
}

export default Home