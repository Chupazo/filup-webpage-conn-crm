const Tokens = require('./models');
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

async function findToken(req, res, next){
    try {
        const tokenFromDB = await Tokens.findOne({});        
        req.token = tokenFromDB.token;
        next();        
    } catch (error) {
        throw error;
    }
}

exports.renewTokenDB = renewTokenDB;
exports.findToken = findToken;