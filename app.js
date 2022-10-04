const cors = require('cors');
const express = require('express');
const axios = require('axios');
const url = require('url');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

async function getToken(req, res, next) {
    //Axios instance made to handle http 200 responses tht contain errors
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
        req.token = accToken.data.access_token;
        console.log(req.token);
        next();
    } catch (err) {
       console.log(err)
    }
}

app.use(express.json());

app.get('/appt-dates', getToken, async (req, res, next) => {
    //const body = req.body;
    //console.log(req);
    try{
        const dates = await axios.get(process.env.GetUrl, {
            headers: { 
                'Authorization': `Zoho-oauthtoken ${req.token}`, 
                //'Content-Type': 'application/json',    
              }
        });
        console.log(dates.data.details);
        res.status(dates.status).json(dates.data.details);
               
    } catch(err) {
        console.log(err);
        res.status(500).json({
            msg: 'Error al agendar la cita. Intenta de nuevo más tarde',
            err,
        });
    }
});

app.post('/test', getToken, async (req, res, next) =>{
    const body = req.body;
    console.log(req);
    try{
        const newLeadEvent = await axios.post(process.env.PostUrl, body, {
            headers: { 
                'Authorization': `Zoho-oauthtoken ${req.token}`, 
                //'Content-Type': 'application/json',    
              }
        });
        console.log(newLeadEvent.data);
        res.status(newLeadEvent.status).json(newLeadEvent.data);
               
    } catch(err) {
        console.log(err);
        res.status(500).json({
            msg: 'Error al agendar la cita. Intenta de nuevo más tarde',
            err,
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});