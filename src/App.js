import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import OidcService from './service/OidcService';
import queryString from 'query-string';
import { Button } from 'reactstrap';
import { withRouter } from 'react-router-dom';

const oidcService = new OidcService();
const authorisationURL = oidcService.authorizeURL;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      authenticated: false,
      userEmail: null,
      accessToken: null,
      stateApp: null,
      code: null
    };
  }

  _exchangeToken = () => {
    oidcService._getToken(this.state.code,this.state.stateApp).then(response => {
        if (!response.ok) throw new Error(response.status)
        else return response.json();
      }).then(json => {
        console.log(json);
        this.setState({ authenticated: true, accessToken: json.access_token });
      }).catch(error => {
        console.log('*****Error :::', error);
      });    
  }

  _getUserInfo = () => {
    oidcService._getUserInfo(this.state.accessToken).then(response => {
      if (!response.ok) throw new Error(response.status)
      else return response.json();
    }).then(userInfo => {
      this.setState({ userEmail: userInfo.sub });
      console.log('Email::::',this.state.userEmail);
    }).catch(error => {
      console.log('*****Error :::', error);
    });
  }

  _logout = () => {
    oidcService._signOut(this.state.accessToken).then(signedOut => {
      if (signedOut) {
        this.setState({ authenticated: false });
      }
    });
  }

  componentDidMount() {
    const params = queryString.parse(this.props.location.search);
    console.log("Params", params);
    if (params.code) { 
      this.setState({ stateApp: params.state, code: params.code, authenticated: true });
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>{this.state.authenticated ? "authenticated" : "unauthenticated"}
          </p>
          <Button color="primary">
          <a
            className="App-link"
            href={authorisationURL}
          >
            GetCode
          </a>
          </Button>
          <br/>
          <Button color="primary" onClick={this._exchangeToken}>ExchangeToken</Button>
          <br/>
          <Button color="primary" onClick={this._getUserInfo}>GetInfo</Button>
          <br/>
          <Button color="primary" onClick={this._logout}>Logout</Button>
        </header>
      </div>
    );
  }
}

export default withRouter(App);
