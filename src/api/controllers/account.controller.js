const DeviceDetector = require('node-device-detector');

const Account = require('../models/account.model');
const User = require('../models/user.model');
const Auth = require('../../auth/auth_');

const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
});


class account {

    static createAccount(req, res){
        User.checkUserEmail( req.body.email ,function(error_code, result){
            if(error_code == 0){
                console.log(result);
                res.status(400).send({status: "Lỗi hệ thống."})
            }else{
                if(Number(result.length) > 0){
                    res.status(400).send({status: "Email đã được sử dụng cho một tài khoản khác."})
                }else{
                    Account.insertAccount(req.body, function(error_code, result){
                        if(error_code == 0){
                            console.log(result)
                            res.status(400).send({status: "Lỗi hệ thống."})
                        }else{

                            let useragent = String(req.headers['user-agent']);
                            let device = detector.detect(useragent);

                            const valid_user = {
                                id: result[4][0].ID,
                                name: String(req.body.name),
                                email: String(req.body.email),
                                user_name: result[5][0].USER_NAME,
                                avatar: String(process.env.NON_AVATAR),
                                device: device.os.name+ ' - ' + device.client.name + ' - ' +device.device.brand,
                                role: 0
                            }

                            const { accessToken, refreshToken } = Auth.generateTokens(valid_user);

                            Auth.updateValidToken(valid_user.id, valid_user.device, refreshToken, function (code, result) {
                            });

                            let redata = {
                                user_package: JSON.stringify(valid_user),
                                access_token: accessToken,
                                refresh_token: refreshToken
                            }

                            res.status(201).send(redata)
                        }
                    });
                }
            }
        });
    }



    static loginAccount(req, res){
        User.checkUserLogin(req.body.email, req.body.password, async function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send({status: "Lỗi hệ thống."})
            }else{
                if(result.length === 1){
                    let useragent = String(req.headers['user-agent']);
                    let device = detector.detect(useragent);
    
                    const valid_user = {
                        id: result[0].ID,
                        name: result[0].name,
                        email: result[0].email,
                        user_name: result[0].user_name,
                        avatar: result[0].avatar,
                        device: device.os.name+ ' - ' + device.client.name + ' - ' +device.device.brand,
                        role: result[0].MemberRole_ID
                    }
        
                    const { accessToken, refreshToken } = Auth.generateTokens(valid_user);
            
                    Auth.updateValidToken(valid_user.id, valid_user.device, refreshToken, function (code, result) {
                    });
            
                    let redata = {
                        user_package: JSON.stringify(valid_user),
                        access_token: accessToken,
                        refresh_token: refreshToken
                    }
            
                    res.status(201).send(redata)
                }else{
                    res.status(400).send({status: "Sai địa chỉ email hoặc mật khẩu."})
                }
            }
        });
    }




    static changeEmail(req, res){
        User.checkUserID(req.body.user_id, req.body.password, async function(error_code, result){
            if(error_code == 0){
                res.status(400).send({status: "Lỗi hệ thống."})
            }else{
                if(result.length === 1){
                    if(result[0].email === req.body.newemail){
                        res.status(200).send({status: "Trùng email hiện tại."})
                    }else{
                        Account.updateEmailAccount(req.body.newemail ,req.body.user_id, req.body.password, async function(error_code, result){
                            if(error_code == 0){
                                res.status(400).send({status: "Email này đã được sử dụng cho một tài khoản khác."})
                            }else{
                                res.status(200).send({status: "Thành công."})
                            }
                        });
                    }
                }else{
                    res.status(400).send({status: "Sai mật khẩu."})
                }
            }
        });
    }





    static changePassword(req, res){
        User.checkUserID(req.body.user_id, req.body.password, async function(error_code, result){
            if(error_code == 0){
                res.status(400).send({status: "Lỗi hệ thống."})
            }else{
                if(result.length === 1){
                    Account.updatePasswordAccount(req.body.newpassword ,req.body.user_id, req.body.password, async function(error_code, result){
                        if(error_code == 0){
                            res.status(400).send({status: "Lỗi hệ thống."})
                        }else{
                            res.status(200).send({status: "Thành công."})
                        }
                    });
                }else{
                    res.status(400).send({status: "Sai mật khẩu hiện tại."})
                }
            }
        });
    }


    static checkVerified(req, res){
        Account.checkVerified(req.query.user_id, async function(error_code, result){
            if(error_code == 0){
                res.status(400).send({status: "Lỗi hệ thống."})
            }else{
                if(result.length === 1){
                    res.status(200).send(result[0])
                }else{
                    res.status(400).send({status: "Tài khoản không tồn tại."})
                }
            }
        });
    }


    static verifyAccount(req, res){
        Account.verifyAccount(req.query.user_id, req.query.email, async function(error_code, result){
            if(error_code == 0){
                res.redirect(process.env.TYPE_HTTP+'://'+process.env.HOST+'/verify?type=unverified');
            }else{
                res.redirect(process.env.TYPE_HTTP+'://'+process.env.HOST+'/verify?type=verified');
            }
        });
    }

    
    static createPasswordAccount(req, res){
        Account.createPasswordAccount(req.body.user_id, req.body.email, req.body.password, async function(error_code, result){
            if(error_code == 0){
                res.status(400).send({status: "Lỗi hệ thống."})
            }else{
                res.status(200).send({status: "Thành công."})
            }
        });
    }

}

module.exports = account;