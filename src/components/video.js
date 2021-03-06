import React from 'react';
import VideoCall from '../helpers/simple-peer';
import '../styles/video.css';
import io from 'socket.io-client';
import { getDisplayStream } from '../helpers/media-access';
import ShareScreenIcon from './ShareScreenIcon';
class Video extends React.Component {
  constructor() {
    super();
    this.state = {
      localStream: {},
      remoteStreamUrl: '',
      streamUrl: '',
      initiator: false,
      peer: {},
      full: false,
      connecting: false,
      waiting: true
    };
  }
  videoCall = new VideoCall();
  componentDidMount() {
    const socket = io(process.env.REACT_APP_SIGNALING_SERVER);
    console.log('socket = ', socket)
    const component = this;
    this.setState({ socket });
    const { roomId } = this.props.match.params;
    let newRoom

    this.getUserMedia().then(() => {
      console.warn('gonna emit join roomId = ', roomId)
      socket.emit('join', { roomId   });
    });
    socket.on('init', () => {
      component.setState({ initiator: true });
    });
    socket.on('ready', () => {
      console.log('date.now= ', Date.now())
      component.enter(roomId);
    });
    socket.on('desc', data => {
      if (data.type === 'offer' && component.state.initiator) {
        console.log("data - offer", data)
        return
      };
      if (data.type === 'answer' && !component.state.initiator) {
        console.log("data - answer ", data)
        return
      };
      component.call(data);
    });
    socket.on('disconnected', () => {
      component.setState({ initiator: true });
    });
    socket.on('full', () => {
      component.setState({ full: true });
    });
  }
  getUserMedia(cb) {
    return new Promise((resolve, reject) => {
      console.log('navigator0000 = ', navigator)
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      const op = {
        video: {
          width: { min: 160, ideal: 640, max: 1280 },
          height: { min: 120, ideal: 360, max: 720 }
        },
        audio: true
      };
      console.log('navigator11 = ', navigator)
      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          op,
          stream => {
            console.log('navigator = ', navigator)
            this.setState({ streamUrl: stream, localStream: stream });
            this.localVideo.srcObject = stream;
            resolve();
          },
          () => {}
        );
      } else {
        console.log("getUserMedia not supported");
      }
    });
  }

  enter = roomId => {
    this.setState({ connecting: true });
    const peer = this.videoCall.init(
      this.state.localStream,
      this.state.initiator
    );
    this.setState({ peer });

    peer.on('signal', data => {
      const signal = {
        room: roomId,
        desc: data
      };
      console.warn('signal = ', signal)
      this.state.socket.emit('signal', signal);
    });
    peer.on('stream', stream => {
      this.remoteVideo.srcObject = stream;
      this.setState({ connecting: false, waiting: false });
    });
    peer.on('error', function(err) {
      console.log(err);
    });
  };
  call = otherId => {
    this.videoCall.connect(otherId);
  };

  render() {
    return (
      <div className='video-wrapper'>
        <div className='local-video-wrapper'>
          <video
            autoPlay
            id='localVideo'
            muted
            ref={video => (this.localVideo = video)}
          />
        </div>
        <video
          autoPlay
          className={`${
            this.state.connecting || this.state.waiting ? 'hide' : ''
          }`}
          id='remoteVideo'
          ref={video => (this.remoteVideo = video)}
        />

        {this.state.connecting && (
          <div className='status'>
            <p>Establishing connection...</p>
          </div>
        )}

      </div>
    );
  }
}

export default Video;
