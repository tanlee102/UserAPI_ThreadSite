const {check} = require('express-validator');

const mail = require('../controllers/mail.controller');
const userController = require('../controllers/user.controller');
const accountController = require('../controllers/account.controller');

const MysqlQuery = require('../query/mysql.query');

const express=require("express");
const router=express.Router();
const router1=express.Router();
const router2=express.Router();

const { saveIntervalData_MailMid, loadAllDataFromFiles_MailMid, resetData_MailMid,
        checkValidateRequestMail, checkValidEmail, checkValidNewEmail} = require('../middleware/mail.middleware');
const { saveIntervalData_AccountMid, loadAllDataFromFiles_AccountMid ,resetData_AccountMid, 
        checkValidateRequestCreateAccount, checkValidateRequestLogin, checkValidateVerifyAccount, checkValidateForgotAccount, checkValidPassword} = require('../middleware/account.middleware');
const { checkValidReCaptcha } = require('../middleware/recaptcha.middleware');

const UserMiddleWare = require('../middleware/user.middleware');

const checkAuthUserDefault = UserMiddleWare.checkAuthUserDefault;
const checkAuthAdmin = UserMiddleWare.checkAuthAdmin;
const checkAuthUser = UserMiddleWare.checkAuthUser;
const checkParameters = UserMiddleWare.checkParameters;


console.log("first-time");

let BanList = [];

const loadListBanned = async () => {
    let myPromise = new Promise(function(resolve) {
        MysqlQuery.select("SELECT Member_ID FROM Banned", function(error_code, result){
            if(error_code == 0){
                resolve("fail");
            }else{
                resolve(result);
            }
        })
    });
    let data = await myPromise;    
    let ReList = [];
    data.forEach(element => {
        ReList.push(element.Member_ID);
    });
    return ReList;
}


module.exports = async function(routerx){

    BanList = await loadListBanned();
    UserMiddleWare.banList = BanList;

    loadAllDataFromFiles_MailMid();
    saveIntervalData_MailMid();

    loadAllDataFromFiles_AccountMid();
    saveIntervalData_AccountMid();

    routerx.use("/user/", router);

    router
    //Detail Account.
    .get('/detail',[], checkAuthUser, userController.getDetailUser)

    .post('/detail/update',[
        check('name').not().isEmpty().bail().isString().isLength({ min: 2, max: 70 }),
        check('quote').isString().isLength({ max: Number(process.env.MAX_DEFAULT_USER_LENGTH) }),
        check('address').isString().isLength({ max: Number(process.env.MAX_DEFAULT_USER_LENGTH) }),
        check('contact').isString().isLength({ max: Number(process.env.MAX_DEFAULT_USER_LENGTH) }),
        check('birthday').isString().isLength({ min: 1, max: Number(process.env.MAX_DEFAULT_SETTING_LENGTH) }),
    ], checkAuthUser, userController.updateDetailUser)

    //Get List Device Logged.
    .get('/list/logged', [
        check('refresh_token').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_TOKEN_LENGTH) }),
    ],checkAuthUser , userController.getAllLogged)

    .post('/delete/logged', [
        check('device').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_DEFAULT_SETTING_LENGTH) }),
        check('time').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_DEFAULT_SETTING_LENGTH) }),
    ], checkAuthUser ,userController.removeLogged)

    //Refresh Token
    .post('/token',[
        check('refresh_token').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_TOKEN_LENGTH) }),
    ], checkParameters, userController.getToken)

    .post('/username/check',[
        check('user_name').not().isEmpty().bail().isString().isLength({ min: Number(process.env.MIN_NAME_USER_LENGTH), max: Number(process.env.MAX_NAME_USER_LENGTH) }),
    ], checkAuthUser, userController.checkUserName)

    .post('/username/update',[
        check('user_name').not().isEmpty().bail().isString().isLength({ min: Number(process.env.MIN_NAME_USER_LENGTH), max: Number(process.env.MAX_NAME_USER_LENGTH) }),
    ], checkAuthUser, userController.updateUserName)

    

    .post('/create/account',[
        check('name').not().isEmpty().bail().isString().isLength({ min: 2, max: 70 }),
        check('email').not().isEmpty().bail().isString().isLength({ min: 3, max: 50 }),
        check('password').not().isEmpty().bail().isString().isLength({ min: 8, max: 70 }),
        check('recaptcha').not().isEmpty().bail().isString().isLength({ min: 5, max: 2500 }),
    ], checkParameters, checkValidPassword, checkValidEmail, checkValidReCaptcha, checkValidateRequestCreateAccount, accountController.createAccount)

    .post('/login',[
        check('email').not().isEmpty().bail().isString().isLength({ min: 3, max: 50 }),
        check('password').not().isEmpty().bail().isString().isLength({ min: 2, max: 70 }),
    ], checkParameters, checkValidPassword, checkValidEmail, checkValidateRequestLogin, accountController.loginAccount)

    .post('/change/email',[
        check('newemail').not().isEmpty().bail().isString().isLength({ min: 3, max: 50 }),
        check('password').not().isEmpty().bail().isString().isLength({ min: 8, max: 70 }),
    ], checkAuthUser, checkValidPassword, checkValidNewEmail, accountController.changeEmail)

    .post('/change/password',[
        check('newpassword').not().isEmpty().bail().isString().isLength({ min: 8, max: 70 }),
        check('password').not().isEmpty().bail().isString().isLength({ min: 8, max: 70 }),
    ], checkAuthUser, checkValidPassword, accountController.changePassword)

    .get('/check/verified',[
    ], checkAuthUser, accountController.checkVerified)

    .get('/verify/account',[
        check('token').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_TOKEN_LENGTH) }),
    ], checkValidateVerifyAccount, accountController.verifyAccount)

    .post('/create/password',[
        check('token').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_TOKEN_LENGTH) }),
        check('password').not().isEmpty().bail().isString().isLength({ min: 8, max: 70 }),
    ], checkValidateForgotAccount, checkValidPassword, accountController.createPasswordAccount)





    






    routerx.use("/user/mail/", router1);

    router1
    .post('/forgot',[
        check('email').not().isEmpty().bail().isString().isLength({ min: 3, max: 50 }),
    ], checkParameters, checkValidEmail, checkValidateRequestMail, mail.forgot)

    .post('/verify', [
        check('email').not().isEmpty().bail().isString().isLength({ min: 3, max: 50 }),
    ], checkParameters, checkValidEmail , checkValidateRequestMail, mail.verify)









    ///MEMBER API:
    routerx.use("/user/ban", router2);
    router2

    .post('/check', [
    ], async function name(req, res) {
        console.log("received")

        BanList = await loadListBanned();
        UserMiddleWare.banList = BanList;

        console.log(BanList)
        res.status(201).send("Created");
    })



    ///SYSTEM API:
    routerx.use("/user/system/23122000", router2);
    router2

    .get('/reset/data', [
    ], async (req, res) => {

        console.log("reset_all_mid_data_")

        resetData_MailMid();
        resetData_AccountMid();

        res.status(200).send("Reseted");
    })

    
}