const User = require('../models/user.model');
const Auth = require('../../auth/auth_');
const DeviceDetector = require('node-device-detector');
const M_UserToken = require('../schema/mongodb/user.token.schema');

const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
});


class user {

    static getToken(req, res){
        Auth.ReToken(req.body.refresh_token, function (code ,result) {
            if(code){
                res.status(200).send(result);
            }else{
                res.status(200).send({accessToken: 'unauthorized'});
            }
        })
    }   


    static setAuthUser(valid_user, req , res, isprofile){
        let useragent = String(req.headers['user-agent']);
        let device = detector.detect(useragent);
        valid_user.device = device.os.name+ ' - ' + device.client.name + ' - ' +device.device.brand;
        const { accessToken, refreshToken } = Auth.generateTokens(valid_user);

        Auth.updateValidToken(valid_user.id, valid_user.device, refreshToken, function (code, result) {
            let domainRes = process.env.HOST_COOKIE_NAME;
            if(code){

                res.cookie('user_package', JSON.stringify(valid_user), { 
                    maxAge: 1000 * 60 * Number(process.env.MINUTE_REFRESH_TOKEN), domain: domainRes ,
                });
                res.cookie('access_token', accessToken, {
                    maxAge: 1000 * 60 * Number(process.env.MINUTE_ACCESS_TOKEN),  domain: domainRes ,
                });
                res.cookie('refresh_token', refreshToken, {
                    maxAge: 1000 * 60 * Number(process.env.MINUTE_REFRESH_TOKEN), domain: domainRes , 
                });

                if(isprofile) res.redirect(process.env.TYPE_HTTP+'://'+process.env.HOST+'/account/detail'); 
                else res.redirect( process.env.TYPE_HTTP+'://'+process.env.HOST+'/'); 
                
            }else{
                res.redirect(process.env.FAILED_URL_LOGIN); 
            }
        });
    }

    
    static checkUserGoogle(req, res){

        User.checkUserAuth(req.user.id, req.user.email, async function(error_code, result){

            if(error_code == 0){
                console.log(result)
                res.redirect(process.env.FAILED_URL_LOGIN); 
            }else{
                if(result?.length > 0){

                    const valid_user = {
                        id: result[0].ID,
                        name: result[0].name,
                        email: result[0].email,
                        user_name: result[0].user_name,
                        avatar: result[0].avatar,
                        role: result[0].MemberRole_ID
                    }
                    user.setAuthUser(valid_user, req, res, false);

                }else{
                    User.insertUserGoogle(req.user,function(error_code, result){

                        if(error_code == 0){
                            console.log(result)
                            res.redirect(process.env.FAILED_URL_LOGIN); 
                        }else{
                            const valid_user = {
                                id: result[4][0].ID,
                                name: req.user.displayName,
                                email: req.user.email,
                                user_name: result[5][0].USER_NAME,
                                avatar: req.user.picture,
                                role: 0
                            }
                            user.setAuthUser(valid_user, req, res, true);
                        }
                    });
                }
            }
        });
    }


    static getAllLogged(req, res){
        M_UserToken.findOne({id_user: req.query.user_id, refresh_token: req.query.refresh_token},{device: 1, time: 1, id_user: 1}).exec(function (err, ownItem) {
            if (err) res.status(400).send(err);
            else
            if(ownItem !== null){
                M_UserToken.find({id_user: req.query.user_id, _id: {$ne : ownItem._id}}, {device: 1, time: 1, id_user: 1}).sort({ time: -1 }).exec(function(err, items){
                    if (err) res.status(400).send(err);
                    else{
                        items = JSON.parse(JSON.stringify(items));
                        items.unshift(ownItem)
                        res.status(200).send(items);
                    }
                });
            }else{
                res.status(200).send([]);
            }
        });
    }

    static removeLogged(req, res){
        M_UserToken.findOneAndDelete({ id_user: req.body.user_id, device: req.body.device, time: req.body.time}).then((result) => {
            if(result?._id){
                res.status(201).send('Status: Created');
            }else{
                console.log(result);
                res.status(400).send('Status: Bad Request');
            }
        });
    }


    
    static getDetailUser(req, res){
        User.getDetailUser(req.query, function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request')
            }else{
                res.status(200).send(JSON.parse(JSON.stringify(result[0])))
            }
        });
    }

    static updateDetailUser(req, res){
        User.updateDetailUser(req.body, function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(201).send('Status: Created');
            }
        });
    }



    static checkUserName(req, res){
        User.checkUserName( req.body, function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(201).send(result.length > 0);
            }
        });
    }

    static updateUserName(req, res){
        User.checkUserName( req.body, function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                if(result.length == 0){
                    User.updateUserName( req.body, function(error_code, result){
                        if(error_code == 0){
                            res.status(400).send('Status: Bad Request');
                        }else{
                            res.status(201).send('Status: Create');
                        }
                    });
                }else{
                    res.status(400).send('Status: Bad Request');
                }
            }
        });
    }

}

module.exports = user;