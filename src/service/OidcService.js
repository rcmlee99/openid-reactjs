const uuidv1 = require('uuid/v1');
var btoa = require('btoa');

let host = 'https://www.amazon.com/ap/oa';
let apiHost = 'https://api.amazon.com';
let client_id = '';
let client_secret = '';
let redirect_uri = '';
let uuid = uuidv1();

class OidcService {

    _urlToken() {
        return apiHost + "/auth/o2/token";
    }

    _urlRefreshToken() {
        return apiHost + "/auth/o2/token";
    }
    
    _urlUserInfo() {
        return apiHost + "/user/profile";
    }

    _authorizeAuthCodeURL() {
        const authorizeURL = host + "?state=" + uuid + "&scope=profile&client_id=" + client_id + "&response_type=code&redirect_uri=" + redirect_uri;
        console.log(authorizeURL);
        return authorizeURL;
    }
    
    _authorizeImplicitURL() {
        const authorizeURL = host + "/oauth2/authorize?state=" + uuid + "&scope=openid%20profile&client_id=" + client_id + "&response_type=token&redirect_uri=" + redirect_uri;
        console.log(authorizeURL);
        return authorizeURL;
    }

    _getUserInfo = (accessToken) => {
        const userInfoHeaders = {
            'Authorization': 'Bearer ' + accessToken,
        };
        console.log('Getting User Info');
        return new Promise((resolve, reject) =>{
            fetch(this._urlUserInfo(), {
                headers: userInfoHeaders,
                method: 'GET'
            }).then(json => {
                resolve(json);
            }).catch(error => {
                reject(error) 
            });
        });
    }

    _signOut = (accessToken) =>  {
        console.log('Login With Amazon logout is clear the access token');
    }

    _getToken = (oidc_code, oidc_state) => {
        console.log('Getting Token');
        const formHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization' : 'Basic ' +  btoa(client_id+':'+client_secret)
          };
        const formData = 'grant_type=authorization_code&redirect_uri=' + redirect_uri +
            '&state=' + oidc_state +
            '&code=' + oidc_code;

        return new Promise((resolve, reject) =>{
            fetch(this._urlToken(), {
                headers: formHeaders,
                method: 'POST',
                body: formData
            }).then(json => {
                resolve(json);
            }).catch(error => {
                reject(error);
            });
        });
    }

    _postRefreshToken = (refresh_token) => {
        console.log('Getting Refresh Token');
        const formHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization' : 'Basic ' +  btoa(client_id+':'+client_secret)
          };
        const formData = 
            '&grant_type=refresh_token' +
            '&refresh_token=' + refresh_token;

        return new Promise((resolve, reject) =>{
            fetch(this._urlRefreshToken(), {
                headers: formHeaders,
                method: 'POST',
                body: formData
            }).then(json => {
                resolve(json);
            }).catch(error => {
                reject(error);
            });
        });
    }

}

export default OidcService;