const Mail = require('../models/mail.model');
const User = require('../models/user.model');
const Auth = require('../../auth/auth_');
const nodemailer = require("nodemailer");


const sendEmail = async (req, subject, content) => {
  let host, user, pass;

  if(Number(req.emailTime) <= 2){
    host = "smtppro.zoho.com";
    pass = "xxxvideosex102TAN";
    user = "service@vnthread.com";

  }else if(Number(req.emailTime) <= 5){
    host = "smtppro.zoho.com";
    pass = "xxxvideosex102TAN";
    user = "service@vnthread.site";

  }else if(Number(req.emailTime) <= 10){
    host = "smtp.gmail.com";
    pass = "mpoimrvvqcbeuzon";
    user = "vnthread.service@gmail.com";
  }
  
  const transporter = nodemailer.createTransport({
    host: host,
    port: 465,
    secure: true,
    auth: {
      user: user,
      pass: pass,
    },
  });

  transporter.sendMail({
    from: '"Vn Thread" '+user, // sender address
    to: req.email, // list of receivers
    subject: subject, // Subject line
    html: content, 
  }, function(err, info){
    if (err) {
      console.log(err);
      if(req.emailTime < 6){
        req.emailTime = 6;
        sendEmail(req, subject, content);
      }
    } else {
      console.log('Message sent: ' +  info.response);
    }
});
}

class login {
  

    static forgot(req, res){

      User.checkUserEmail( req.body.email ,function(error_code, result){
        if(error_code == 0){
            console.log(result);
            res.status(400).send({status: "Lỗi hệ thống."})
        }else{
            if(Number(result.length) > 0){

              let data = {
                'id': result[0]['ID'],
                'email': result[0]['email'],
                'type': 'forgot'
              }

              try {
                sendEmail(req.body, 
                  "Xác thực Email - Khôi phục mật khẩu cho tài khoản của bạn",
                  `<div>
                    <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Chúng tôi nhận thấy rằng bạn đã quên mật khẩu của mình. Vui lòng nhấp vào liên kết bên dưới để tiến hành đặt lại mật khẩu mới.</p>
                    <p><a href="`+process.env.HOST_SEND_FORGOT+`?token=`+Auth.generateTokenOpt(data, process.env.ACCESS_TOKEN_FORGOT_ACCOUNT, process.env.ACCESS_TOKEN_FORGOT_TIME).accessToken+`&email=`+data.email+`">Xác thực Email</a></p>
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua thông báo này.</p>
                  </div>`
                  )
              } catch (error) {
                console.log(error)
              }

              setTimeout(() => {
                res.status(200).send('Status: EMAIL SENDED')
              }, 1500)
      
            }else{
              res.status(400).send({status: "Email không tồn tại."})
            }
        }
      });

    }





    static verify(req, res){

      User.checkUserEmail( req.body.email ,function(error_code, result){
        if(error_code == 0){
            console.log(result);
            res.status(400).send({status: "Lỗi hệ thống."})
        }else{
            if(Number(result.length) > 0 && Number(result[0].verified) == 0){

              let data = {
                'id': result[0]['ID'],
                'email': result[0]['email'],
                'type': 'verify'
              }

              try {
                sendEmail(req.body, 
                  "Xác thực Email - Hãy nhấp vào liên kết để xác minh tài khoản",

                  `<div>
                    <p>Cảm ơn bạn đã sử dụng tài khoản của VnThread. Chúng tôi muốn xác minh rằng đó là tài khoản của bạn. Vui lòng nhấp vào liên kết bên dưới để hoàn tất quá trình xác minh.</p>
                    <p><a href="`+process.env.HOST_SEND_VERIFY+`?token=`+Auth.generateTokenOpt(data, process.env.ACCESS_TOKEN_VERIFY_ACCOUNT, process.env.ACCESS_TOKEN_VERIFY_TIME).accessToken+`">Xác thực Email</a></p>
                    <p>Nếu bạn không muốn xác minh tài khoản, bạn có thể bỏ qua thông báo này.</p>
                  </div>`
                  )
              } catch (error) {
                console.log(error)
              }

              setTimeout(() => {
                res.status(200).send('Status: EMAIL SENDED')
              }, 1500)
      
            }else{
              res.status(400).send({status: "Email không tồn tại hoặc đã được xác minh."})
            }
        }
      });

    }



}

module.exports = login;