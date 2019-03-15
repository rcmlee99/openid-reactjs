import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import OidcService from './service/OidcService';
import queryString from 'query-string';
import { Button, Table, Row, Col } from 'reactstrap';
import { withRouter } from 'react-router-dom';

const oidcService = new OidcService();
const authorisationAuthCodeURL = oidcService._authorizeAuthCodeURL();
const authorisationImplicitURL = oidcService._authorizeImplicitURL();

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      authenticated: false,
      userEmail: null,
      accessToken: null,
      idToken: null,
      refreshToken: null,
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
        console.log(JSON.stringify(json));
        this.setState({ authenticated: true, accessToken: json.access_token, refreshToken: json.refresh_token, idToken: json.id_token });
      }).catch(error => {
        console.log('*****Error :::', error);
      });    
  }

  _getUserInfo = () => {
    oidcService._getUserInfo(this.state.accessToken).then(response => {
      if (!response.ok) throw new Error(response.status)
      else return response.json();
    }).then(userInfo => {
      console.log(userInfo);
      this.setState({ userEmail: userInfo.sub });
      console.log('Email::::',this.state.userEmail);
    }).catch(error => {
      console.log('*****Error :::', error);
    });
  }

  _getRefreshToken = () => {
    oidcService._postRefreshToken(this.state.refreshToken).then(response => {
      if (!response.ok) throw new Error(response.status)
      else return response.json();
    }).then(json => {
      console.log(json);
      this.setState({ accessToken: json.access_token, refreshToken: json.refresh_token });
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
    const hashParams = queryString.parse(this.props.location.hash);
    if (params.code) { 
      console.log(params);
      this.setState({ stateApp: params.state, code: params.code, authenticated: true });
    } else if (hashParams.access_token) {
      console.log(hashParams);
      this.setState({ authenticated: true, accessToken: hashParams.access_token});
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>State: {this.state.authenticated ? "Authenticated" : "Unauthenticated"}
          </p>
          <Table>
            <Row border="1">
              <Col>
                Authorication Code Pattern
              </Col>
              <Col>
                Implicit Grant Pattern
              </Col>
            </Row>
            <Row>
              <Col>
                <Button color="primary">
                <a
                  className="App-link"
                  href={authorisationAuthCodeURL}
                >
                  AuthCode Login
                </a>
                </Button>
                <br/>
                <Button color="primary" onClick={this._exchangeToken}>ExchangeToken</Button>
              </Col>
              <Col>
                <Button color="primary">
                  <a
                    className="App-link2"
                    href={authorisationImplicitURL}
                  >
                    Implicit Login
                  </a>
                </Button>
              </Col>
            </Row>
          </Table>
          <br/>
          <Button color="primary" onClick={this._getUserInfo}>GetInfo</Button>
          <br/>
          <Table>
            <Row border="1">
              <Col>
              <Button color="primary" onClick={this._getRefreshToken}>RefreshToken</Button>
              </Col>
              <Col>
              </Col>
            </Row>
          </Table>
          <br/>
          <Button color="primary" onClick={this._logout}>Logout</Button>
        </header>
      </div>
    );
  }
}

export default withRouter(App);
