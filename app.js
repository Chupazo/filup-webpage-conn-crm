const cors = require('cors');
const express = require('express');
const axios = require('axios');
const connectDb = require('./db-config');
const { renewTokenDB, findToken } = require('./db-functions');
const { getNewToken } = require('./token-request');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

connectDb();
app.use(cors());

app.use(express.json());
app.use(findToken);

app.get('/appt-dates', async (req, res, next) => {
        
    //Interceptor made to retry request if token expired. Calls getNewToken (refresh) function and adds new token to the header before retrying.
    axios.interceptors.response.use((res)=>{
        return res;
    }, async function(error) {
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
        const dates = await axios.get(process.env.GetUrl, {
            headers: { 
                'Authorization': `Zoho-oauthtoken ${req.token}`, 
                //'Content-Type': 'application/json',    
              }
        });        
        res.status(dates.status).json(dates.data.details);
               
    } catch(err) {
        console.log(err);
        res.status(500).json({
            msg: 'Error al agendar la cita. Intenta de nuevo más tarde',
            err,
        });
    }
});

app.post('/form', async (req, res, next) =>{
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
        
        
        res.status(newLeadEvent.status).json(newLeadEvent.data);
               
    } catch(err) {
        //Throws errors unrelated to tokens
        console.log(err);
        res.status(500).json({
            msg: 'Error al agendar la cita. Intenta de nuevo más tarde',
            err,
        });
    }
});

app.listen(port);