const requestIp = require('request-ip');
const axios = require('axios');

class ReCaptchaMiddleWare{

    static async checkValidReCaptcha(req,res,next){
        const clientIp = requestIp.getClientIp(req); 
        try {
          const response = await axios.post("https://www.google.com/recaptcha/api/siteverify", null, {
            params: {
              secret: "6LcccwsoAAAAAPUB9ENhbKL1l0leV5A2s8_ggm_M",
              response: req.body.recaptcha,
              remoteip: clientIp,
            },
          });
      
          const { success } = response.data;
      
          if (success) {
            console.log('reCAPTCHA success')
            next();
          } else {
            // reCAPTCHA verification failed
            res.status(403).json({ status: 'Xác nhận Captcha thất bại' });
          }
        } catch (error) {
            console.error('reCAPTCHA verification error:', error);
            res.status(500).json({ status: 'Lỗi hệ thống' });
        }
    }

}

module.exports = ReCaptchaMiddleWare;