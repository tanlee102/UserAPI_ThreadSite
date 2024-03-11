const DeviceDetector = require('node-device-detector');
const requestIp = require('request-ip');

const {saveDataToFile, loadDataFromFile} = require('../../helper/FileUtils');
const path = require('path');

const detector = new DeviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    deviceAliasCode: false,
});
  
class MailMiddleWare{

    static IPList =  {};
    static requestHashTable = {};
    static previousTimeHashtable = {};
    static emailHashtable = {};

    /////SETTLE RATE LIMIT ----------------------------------------------------------
    static dataFilePaths = {
        IPList: path.join(__dirname, '/mail/IPList.json'),
        requestHashTable: path.join(__dirname, '/mail/requestHashTable.json'),
        previousTimeHashtable: path.join(__dirname, '/mail/previousTimeHashtable.json'),
        emailHashtable: path.join(__dirname, '/mail/emailHashtable.json'),
    };
    static resetData_MailMid = async () => {            
        this.IPList =  {};
        this.requestHashTable = {};
        this.previousTimeHashtable = {};
        this.emailHashtable = {};

        this.saveAllDataToFiles();
    }

    static saveIntervalData_MailMid = async () => {
        setInterval(() => {
            this.saveAllDataToFiles();
        }, Number(process.env.TIME_SAVE_SYSTEM_MID));
    }

    static loadAllDataFromFiles_MailMid = () => {
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


    static checkValidateRequestMail = (req,res,next) => {

        const clientIp = requestIp.getClientIp(req); 
        const device = detector.detect(String(req.headers['user-agent']));
        const email = String(req.body.email);

        const osName = device.os.name ?? 'Unknown';
        const osVersion = device.os.version ?? 'Unknown';
        const clientName = device.client.name ?? 'Unknown';
        const brand = device.device.brand ?? 'Unknown';
        
        const key = `${clientIp}:${osName}:${osVersion}:${clientName}:${brand}`.toLowerCase().replace(/\s/g, '');


        if (!this.IPList.hasOwnProperty(clientIp))
            this.IPList[clientIp] = 1;

        if (!this.requestHashTable[key]) 
            this.requestHashTable[key] = 1; 

        if (!this.emailHashtable.hasOwnProperty(email))
            this.emailHashtable[email] = 1;

        if(this.IPList[clientIp] < 31 && this.requestHashTable[key] < 19 && this.emailHashtable[email] < 11 ){

            const currentTime = new Date();
            const previousTime = this.previousTimeHashtable[key];
            if (previousTime && currentTime - previousTime < 8000) {
                res.status(400).send({status: "Bạn đang sử dụng quá nhanh, vui lòng thử lại vài giây."})
            }else{    
                
                req.body.emailTime = this.emailHashtable[email];

                this.IPList[clientIp] += 1;
                this.requestHashTable[key]++;
                this.emailHashtable[email] += 1;
                this.previousTimeHashtable[key] = currentTime;

                return next();
            }

        }else{
            res.status(400).send({status: "Hệ thống phát hiện hành vi không bình thường và tạm thời chặn một số hoạt động của bạn."})
        }
        
    }


    static checkValidEmail(req,res,next){

        let typePara = ((req.method==='GET') ? 'query' : 'body'); 
        let email = req[typePara].email;
  
        let re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if ( re.test(String(email)) ) {
            req[typePara].email = email.trim();
            return next();
        }else {
            res.status(400).send({status: "Email không hợp lệ."});
        }
        
    }



    static checkValidNewEmail(req,res,next){

        let typePara = ((req.method==='GET') ? 'query' : 'body'); 
        let newemail = req[typePara].newemail;
  
        let re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if ( re.test(String(newemail)) ) {
            req[typePara].newemail = newemail.trim();
            return next();
        }else {
            res.status(400).send({status: "Email không hợp lệ."});
        }
        
    }



}

module.exports = MailMiddleWare;