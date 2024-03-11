const characters ='abcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = 'u';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

module.exports = generateString;