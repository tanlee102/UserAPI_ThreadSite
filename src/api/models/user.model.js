const MysqlQuery = require("../query/mysql.query")

const generateString = require('../../helper/randomString');

var moment = require('moment');

class User{
    constructor() {}

    static checkUserAuth(auth_id, email, next){
        let State = "SELECT ID, email, MemberRole_ID, name, user_name, avatar FROM Member LEFT JOIN MemberProfile ON Member.ID=MemberProfile.Member_ID WHERE Auth_ID= ?  OR  email= ? ;";  
        MysqlQuery.select_(State, [auth_id, email], next);
    }

    static checkUserEmail(email, next){
        let State = "SELECT ID, email, verified FROM Member WHERE email = ? ;";  
        MysqlQuery.select_(State, [email], next);
    }
    
    static checkUserID(user_id, password, next){
        let State = "SELECT ID, email, MemberRole_ID, name, user_name, avatar FROM Member LEFT JOIN MemberProfile ON Member.ID=MemberProfile.Member_ID WHERE password = ? AND ID = ? AND password IS NOT NULL;";  
        MysqlQuery.select_(State, [password, user_id], next);
    }

    static checkUserLogin(email, password, next){
        let State = "SELECT ID, email, MemberRole_ID, name, user_name, avatar FROM Member LEFT JOIN MemberProfile ON Member.ID=MemberProfile.Member_ID WHERE password = ? AND email = ? AND password IS NOT NULL;";  
        MysqlQuery.select_(State, [password, email], next);
    }

    static insertUserGoogle(data, next){
        let randomID = String(generateString(Number(process.env.HASH_ID_USER_LENGTH)));
        let State= "SET @CUR_ID = (SELECT IFNULL(MAX(ID), 0) FROM Member) + 1; "+
        "INSERT INTO Member (ID, email, Auth_ID, type_auth) VALUES (@CUR_ID ,'"+String(data.email)+"','"+data.id+"', 'gg'); "+
        "INSERT INTO MemberProfile (Member_ID, user_name, name, thumbnail, medium, avatar, contact) VALUES (@CUR_ID , CONCAT(@CUR_ID, '"+randomID+"') , '"+data.displayName+"','"+data.picture+"','"+data.picture+"','"+data.picture+"','"+String(data.email)+"'); "+
        "INSERT INTO Privacy (Member_ID, send_message, post_liked, member_following) VALUES (@CUR_ID, 0 ,0, 0); "+
        "SELECT @CUR_ID as ID;"+
        "SELECT CONCAT(@CUR_ID, '"+randomID+"') as USER_NAME;";
        MysqlQuery.insert(State, next);
    }

    static getDetailUser(data, next){
        let State = 'SELECT  user_name ,IFNULL(name, "") as name, IFNULL(avatar, "") as avatar, IFNULL(birthday, "") as birthday,  IFNULL(quote, "") as quote,  IFNULL(address, "") as address,  IFNULL(contact, "") as contact FROM MemberProfile WHERE Member_ID = ? ;'
        MysqlQuery.select_(State, [data.user_id], next);
    }

    static updateDetailUser(data, next){ 
        try {
            if(moment(data.birthday, "YYYY-MM-DD").isValid() && data.birthday.split("-")[0].length == 4){
                let State = "UPDATE MemberProfile SET name = ? , birthday = ? , quote = ? , address = ? , contact = ? WHERE Member_ID = ? ;"
                MysqlQuery.insert_(State, [data.name, data.birthday, data.quote, data.address, data.contact, data.user_id], next);
            }else{
                let State = "UPDATE MemberProfile SET name = ? , quote = ? , address = ? , contact = ?  WHERE Member_ID = ? ;"
                MysqlQuery.insert_(State, [data.name, data.quote, data.address, data.contact, data.user_id], next);
            }   
        } catch (error) {
            console.log(error)
        }
    }

    static checkUserName(data, next){
        let State = 'SELECT user_name FROM MemberProfile WHERE user_name = ? ;';
        MysqlQuery.select_(State, [data.user_name], next);
    }

    static updateUserName(data, next){
        let State = 'UPDATE MemberProfile SET user_name = ?  WHERE Member_ID = ? ;';
        MysqlQuery.select_(State, [String(data.user_name).replace(/[^a-z0-9]/gi, '').replace(/\s/g,'').toLowerCase(), data.user_id], next);
    }

}

module.exports = User;