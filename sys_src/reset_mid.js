const axios = require('axios');

function sendResetRequest() {
  try {
    const url = 'http://localhost:1100/user/system/23122000/reset/data';
    axios.get(url)
      .then(response => {
        console.log('Request sent successfully!');
      })
      .catch(error => {
        console.error('Error sending request:', error.message);
      });
  } catch (error) {
    console.error('Error sending request:', error.message);
  }
}

sendResetRequest();
// Set the interval to 24 hours (in milliseconds)
const intervalTime = 24 * 60 * 60 * 1000;
setInterval(sendResetRequest, intervalTime);