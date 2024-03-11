const DeviceDetector = require('node-device-detector');
const requestIp = require('request-ip');
const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');

const {saveDataToFile, loadDataFromFile} = require('../../helper/FileUtils');
const path = require('path');

const detector = new DeviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    deviceAliasCode: false,
});
  
class AccountMiddleWare{

    static IPList =  {};
    static requestHashTable = {};
    static previousTimeHashtable = {};

    static IPList_ = {};
    static requestHashTable_ = {};

    /////SETTLE RATE LIMIT ----------------------------------------------------------
    static dataFilePaths = {
        IPList: path.join(__dirname, '/account/IPList.json'),
        requestHashTable: path.join(__dirname, '/account/requestHashTable.json'),
        previousTimeHashtable: path.join(__dirname, '/account/previousTimeHashtable.json'),
  
        IPList_: path.join(__dirname, '/account/IPList_.json'),
        requestHashTable_: path.join(__dirname, '/account/requestHashTable_.json'),
    };

    static resetData_AccountMid = async () => {            
        this.IPList =  {};
        this.requestHashTable = {};
        this.previousTimeHashtable = {};
        this.IPList_ =  {};
        this.requestHashTable_ = {};

        this.saveAllDataToFiles();
    }

    static saveIntervalData_AccountMid = async () => {
        setInterval(() => {
            this.saveAllDataToFiles();
        }, Number(process.env.TIME_SAVE_SYSTEM_MID));
    }

    static loadAllDataFromFiles_AccountMid = () => {
        for (const [key, filePath] of Object.entries(this.dataFilePaths)) {
            this[key] = loadDataFromFile(filePath);
        }
    }
    static saveAllDataToFiles= () => {
        for (const [key, filePath] of Object.entries(this.dataFilePaths)) {
            saveDataToFile(this[key], filePath);
        }
    }
    /////SETTLE RATE LIMIT ----------------------------------------------------------


    static checkValidateRequestCreateAccount = (req,res,next) => {

        const clientIp = requestIp.getClientIp(req); 
        const device = detector.detect(String(req.headers['user-agent']));

        const osName = device.os.name ?? 'Unknown';
        const osVersion = device.os.version ?? 'Unknown';
        const clientName = device.client.name ?? 'Unknown';
        const brand = device.device.brand ?? 'Unknown';
        
        const key = `${clientIp}:${osName}:${osVersion}:${clientName}:${brand}`.toLowerCase().replace(/\s/g, '');

        if (!this.IPList.hasOwnProperty(clientIp)) 
            this.IPList[clientIp] = 1;

        if (!this.requestHashTable[key]) 
            this.requestHashTable[key] = 1; 

        if(this.IPList[clientIp] < 30 && this.requestHashTable[key] < 13 ){

            const currentTime = new Date();
            const previousTime = this.previousTimeHashtable[key];
            if (previousTime && currentTime - previousTime < 7000) {
                res.status(400).send({status: "Bạn đang sử dụng quá nhanh, vui lòng thử lại vài giây."})
            }else{

                this.IPList[clientIp] += 1;
                this.requestHashTable[key]++; 
                this.previousTimeHashtable[key] = currentTime;

                return next();
            }

        }else{
            res.status(400).send({status: "Hệ thống phát hiện hành vi không bình thường và tạm thời chặn một số hoạt động của bạn."})
        }
        
    }




    static checkValidateRequestLogin = (req,res,next) => {

        const clientIp = requestIp.getClientIp(req); 
        const email = String(req.body.email);

        const key = `${clientIp}:${email}`.toLowerCase().replace(/\s/g, '');

        if (!this.IPList_.hasOwnProperty(clientIp)) 
            this.IPList_[clientIp] = 1;

        if (!this.requestHashTable_[key]) 
            this.requestHashTable_[key] = 1; 

        if(this.IPList_[clientIp] < 300 && this.requestHashTable_[key] < 50 ){

            this.IPList_[clientIp] += 1;
            this.requestHashTable_[key]++; 
    
            return next();
        }else{
            res.status(400).send({status: "Hệ thống phát hiện hành vi không bình thường và tạm thời chặn một số hoạt động của bạn."})
        }
        
    }




    static checkValidateVerifyAccount = (req,res,next) => {

        if(validationResult(req).isEmpty()){

            let typePara = ((req.method==='GET') ? 'query' : 'body'); 
            
            jwt.verify( req[typePara].token , process.env.ACCESS_TOKEN_VERIFY_ACCOUNT , function(err, decoded) {
                if(err){
                    res.redirect(process.env.TYPE_HTTP+'://'+process.env.HOST+'/verify?type=unverified'); 
                }else{
                    req[typePara].user_id = decoded.user.id;
                    req[typePara].email = decoded.user.email;
                    return next();
                }
            });
            
        }else{
            res.redirect(process.env.TYPE_HTTP+'://'+process.env.HOST+'/verify?type=unverified'); 
        }

    }



    static checkValidateForgotAccount = (req,res,next) => {

        if(validationResult(req).isEmpty()){

            let typePara = ((req.method==='GET') ? 'query' : 'body'); 
            
            jwt.verify( req[typePara].token , process.env.ACCESS_TOKEN_FORGOT_ACCOUNT , function(err, decoded) {
                if(err){
                    res.status(400).send({status: "Token hết thời hạn."})
                }else{
                    req[typePara].user_id = decoded.user.id;
                    req[typePara].email = decoded.user.email;
                    return next();
                }
            });
            
        }else{
            res.status(400).send({status: "Không hợp lệ dữ liệu."})
        }

    }


    static checkValidPassword = (req,res,next) => {
            let typePara = ((req.method==='GET') ? 'query' : 'body'); 
            if(String(String(String(req[typePara].password).trim()).replace(/\s/g, '')).length >= 2){
                return next();
            }else{
                res.status(400).send({status: "Không hợp lệ dữ liệu."})
            }
    }


}

module.exports = AccountMiddleWare;









    // static loadAllDataFromFiles = () => {
    //     this.IPList = loadDataFromFile(this.dataFilePaths.IPList);
    //     this.requestHashTable = loadDataFromFile(this.dataFilePaths.requestHashTable);
    //     this.previousTimeHashtable = loadDataFromFile(this.dataFilePaths.previousTimeHashtable);

    //     this.IPList_ = loadDataFromFile(this.dataFilePaths.IPList_);
    //     this.requestHashTable_ = loadDataFromFile(this.dataFilePaths.requestHashTable_);
    //   };
    
    //   static saveAllDataToFiles = () => {
    //     saveDataToFile(this.IPList, this.dataFilePaths.IPList);
    //     saveDataToFile(this.requestHashTable, this.dataFilePaths.requestHashTable);
    //     saveDataToFile(this.previousTimeHashtable, this.dataFilePaths.previousTimeHashtable);

    //     saveDataToFile(this.IPList_, this.dataFilePaths.IPList_);
    //     saveDataToFile(this.requestHashTable_, this.dataFilePaths.requestHashTable_);
    //   };
