const axios = require('axios');
const url = require('url');
//const renewTokenDB = require('./db-functions');

async function getNewToken() {
    //Axios instance made to handle http 200 responses that contain errors
    const tokenReq = axios.create({
        baseURL: process.env.RefreshUrl.toString()
    });

    //Parameters needed to get token
    const params = new url.URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: process.env.REFRESH_TOKEN,
        grant_type: 'refresh_token'
    });
    
    //Interceptor that gets error from response (token request errors get http status 200 with the error inside data)
    tokenReq.interceptors.response.use(res => {
        if (res.data.error) {
            // Error message is retrived from the JSON body 
            const error = new Error(res.data.error);
            error.response = res;
            throw error;
        }
        return res;
    })

    //Get the actual token
    try{
        const accToken = await tokenReq.post('/oauth/v2/token', params.toString());        
        /*req.token = accToken.data.access_token;
        console.log(req.token);*/
        return accToken.data.access_token;
        //next();
    } catch (err) {
        throw err;
       //console.log(err)
    }
}

/*async function handleExpiredToken(error) {
    //store original request config in a variable
    const originalRequest = error.config;
    
    //triggers only when token is invalid. Has a flag to avoid infinite loops
    if(error.response.status === 401 && error.response.data.code ==='INVALID_TOKEN' && !originalRequest._retry){
        try{
            originalRequest._retry = true;
            console.log('Token inválido. Renovando...');
            const newToken = await getNewToken();
            await renewTokenDB(newToken);
            originalRequest.headers['Authorization'] = `Zoho-oauthtoken ${newToken}`;
            return axios.request(originalRequest);
        } catch(error){
            console.log(error);
            throw error;
        }          
        
    }
    return Promise.reject(error);
};*/

exports.getNewToken = getNewToken;
//exports.handleExpiredToken = handleExpiredToken;
