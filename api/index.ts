const cors = require('cors');
const express = require('express');
const axios = require('axios');
//const parseForm = require('../parse-form');
const multer = require('multer');
const connectDb = require('../db-config');
const { renewTokenDB, findToken } = require('../db-functions');
const { getNewToken } = require('../token-request');
const upload = multer();
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

//Connect to DB
connectDb();

//Middlewares
app.use(cors());
//app.use(express.json());
app.use(findToken);


//Send lead and appointment data to the CRM
app.post('/form', upload.none(), async (req, res, next) =>{

    const body = req.body;
    
    //Interceptor made to retry request if token expired. Calls getNewToken (refresh) function and adds new token to the header before retrying.
    axios.interceptors.response.use((res)=>{
        return res;
    },async function(error) {
        const originalRequest = error.config;        
        if(error.response.status === 401 && error.response.data.code ==='INVALID_TOKEN' && !originalRequest._retry){
            try{
                originalRequest._retry = true;                
                const newToken = await getNewToken();
                await renewTokenDB(newToken);
                originalRequest.headers['Authorization'] = `Zoho-oauthtoken ${newToken}`;
                return axios.request(originalRequest);
            } catch(error){                
                throw error;
            }          
            
        }
        return Promise.reject(error);
    }    
    
    );

    try{
        const newLeadEvent = await axios.post(process.env.PostUrl, body, {
            headers: { 
                'Authorization': `Zoho-oauthtoken ${req.token}`,                   
              }
        });       
        //res.status(newLeadEvent.status).json(newLeadEvent.data); 
        res.redirect(301, 'https://landing.filup.mx/gracias-main-page/');
    } catch(err) {
        //Throws errors unrelated to tokens
        console.log(err);
        res.status(500).json({
            msg: 'Error al enviar los datos. Intenta de nuevo más tarde',
            err,
        });
    }
});

app.listen(port);

module.exports = app;
