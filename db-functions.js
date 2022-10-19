const Tokens = require('./models');

//Function to rewrite access token. Deletes old token(s) and writes the new (valid) token in the DB
async function renewTokenDB(newToken) {
    try{
        await Tokens.deleteMany({});        
        await Tokens.create({
            token: `${newToken}`
        });        
    }
    catch(e){
        throw e;
    }
    
}

//Function to get token from DB. If the collection is empty, assigns a dummy value in order to trigger a token request.
async function findToken(req, res, next){
    try {
        const tokenFromDB = await Tokens.findOne({});        
        if(!tokenFromDB){
            req.token = 'new';
        } else {
            req.token = tokenFromDB.token;
        }
        next();        
    } catch (error) {
        throw error;
    }
}

exports.renewTokenDB = renewTokenDB;
exports.findToken = findToken;