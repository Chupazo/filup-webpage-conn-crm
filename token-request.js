const axios = require('axios');
const url = require('url');

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
        return accToken.data.access_token;       
    } catch (err) {
        throw err;       
    }
}

exports.getNewToken = getNewToken;
