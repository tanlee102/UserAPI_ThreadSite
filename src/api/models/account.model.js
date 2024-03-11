const MysqlQuery = require("../query/mysql.query")

const generateString = require('../../helper/randomString');

class Account{

    constructor() {}

    static insertAccount(data, next){
        let randomID = String(generateString(Number(process.env.HASH_ID_USER_LENGTH)));
        let State= "SET @CUR_ID = (SELECT IFNULL(MAX(ID), 0) FROM Member) + 1; "+
        "INSERT INTO Member (ID, email, password, type_auth) VALUES (@CUR_ID , ? , ? , 'em'); "+
        "INSERT INTO MemberProfile (Member_ID, user_name, name, thumbnail, medium, avatar, contact) VALUES (@CUR_ID , CONCAT(@CUR_ID, '"+randomID+"') , ? ,'"+String(process.env.NON_AVATAR)+"','"+String(process.env.NON_AVATAR)+"','"+String(process.env.NON_AVATAR)+"', ? ); "+
        "INSERT INTO Privacy (Member_ID, send_message, post_liked, member_following) VALUES (@CUR_ID, 0 ,0, 0); "+
        "SELECT @CUR_ID as ID;"+
        "SELECT CONCAT(@CUR_ID, '"+randomID+"') as USER_NAME;";
        MysqlQuery.insert_(State, [String(data.email), String(data.password), String(data.name), String(data.email)] ,next);
    }

    static checkVerified(user_id, next){
        let State = "SELECT verified FROM Member WHERE ID = ? ;";  
        MysqlQuery.select_(State, [user_id], next);
    }

    static updateEmailAccount(newemail, user_id, password, next){
        let State = "UPDATE Member SET email = ? , verified = '0' WHERE ID = ? AND password = ? AND password IS NOT NULL;";  
        MysqlQuery.insert_(State, [newemail, user_id, password], next);
    }

    static updatePasswordAccount(newpassword, user_id, password, next){
        let State = "UPDATE Member SET password = ? WHERE ID = ? AND password = ? AND password IS NOT NULL;";  
        MysqlQuery.insert_(State, [newpassword, user_id, password], next);
    }

    static createPasswordAccount(user_id, email, password, next){
        let State = "UPDATE Member SET password = ? WHERE ID = ? AND email = ?;";  
        MysqlQuery.insert_(State, [password, user_id, email], next);
    }

    static verifyAccount(user_id, email, next){
        let State = "UPDATE Member SET verified = '1' WHERE ID = ? AND email = ?;";  
        MysqlQuery.insert_(State, [user_id, email], next);
    }

}

module.exports = Account;