const uuidv1 = require('uuid/v1');

let host = '';
let client_id = '';
let client_secret = '';
let redirect_uri = '';
let uuid = uuidv1();

class OidcService {

    _urlToken() {
        return host + "/oauth/token";
    }
    
    _urlUserInfo() {
        return host + "/oauth/userinfo";
    }

    _urlSignOut = (access_token) => {
        return host + "/oauth/tokens/" + access_token;
    }

    _authorizeURL() {
        const authorizeURL = host + "/oauth/authorize?state=" + uuid + "&scope=openid%20profile&client_id=" + client_id + "&response_type=code&redirect_uri=" + redirect_uri;
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
        console.log('Signing Out Token :::', accessToken);
        const urlSignOut = host + "/oauth/tokens/" + accessToken;
        return new Promise((resolve, reject) =>{
            fetch(urlSignOut, {
                method: 'DELETE'
            }).then(() => {
                resolve(true);
            }).catch(error => {
                console.log('*****Error :::', error);
                reject(false) 
            });
        });
    }

    _getToken = (oidc_code, oidc_state) => {
        console.log('Getting Token');
        const formHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded'
          };
        const formData = 'client_id=' + client_id + 
            '&client_secret=' + client_secret + 
            '&grant_type=authorization_code&redirect_uri=' + redirect_uri +
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

}

export default OidcService;