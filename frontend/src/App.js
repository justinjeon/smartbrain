import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import './App.css';
import Clarifai from 'clarifai'

const app = new Clarifai.App({
  apiKey: '7b40887b08ab45bb9802b8bd1ae6e54e'
});

const particlesOptions = {
  particles: {
    number: {
      value: 20,
      density: {
        enable:true,
        value_area:800
      }
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signout',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: '',
      }
    }
  };

  loadUser = (data) => {
    console.log(data);
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined,
    }})
  }

  

  calculateFaceLocation = (data) => {
    const faces = data.outputs[0].data.regions;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    const boxes = faces.map( (face, index) => {
      const boundedBox = face.region_info.bounding_box;
      return {
        topRow: boundedBox.top_row * height,
        rightCol: width - (boundedBox.right_col * width),
        bottomRow: height - (boundedBox.bottom_row * height),
        leftCol: boundedBox.left_col * width,
      };
    });
    // console.log(boxes);
    return boxes;

  /*
     const boundedBox = faces.region_info.bounding_box;
      return {
        topRow: boundedBox.top_row * height,
        rightCol: width - (boundedBox.right_col * width),
        bottomRow: height - (boundedBox.bottom_row * height),
        leftCol: boundedBox.left_col * width,
      };
    */
  };

  displayFaceBox = (boxes) => {
    this.setState({box: boxes});
  };

  onInputChange = (event) => {
    this.setState({
      input: event.target.value,
    });
  };

  onButtonSubmit = () => {
    this.setState({
      imageUrl: this.state.input
    })
    app.models
      .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
      .then( (response) => {
        if (response) {
          fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id,
          })
        })
          .then(resp => resp.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count}));
      })
      .catch(err => {
        console.log("no success");
      })

      const boxes = this.calculateFaceLocation(response);
      this.displayFaceBox(boxes);
      boxes.forEach((box,index) => {
        this.displayFaceBox(box);
      })
    }})
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({isSignedIn: false})
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  };

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
        { route === 'home'
        ? <div><Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries}/>
          <ImageLinkForm 
            onInputChange={this.onInputChange} 
            onButtonSubmit={this.onButtonSubmit}
          />
          <FaceRecognition 
            imageUrl={imageUrl}
            box={box}
          />
          </div>
        : (
            this.state.route==='signout' 
            ? <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
            : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
          )
        }
      </div>
    );
  }
}

export default App;
 