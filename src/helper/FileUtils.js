const fs = require('fs');

class FileUtils {


    static saveDataToFile = (data, filePath) => {
        if (Object.keys(data).length === 0) {
          fs.writeFileSync(filePath, '');
          console.log(`File ${filePath} emptied as data is empty.`);
          return;
        }
    
        const dataToSave = JSON.stringify(data, null, 2);
    
        fs.writeFile(filePath, dataToSave, (err) => {
          if (err) {
            console.error(`Error saving data to ${filePath}:`, err);
          } else {
            console.log(`Data saved to ${filePath} successfully.`);
          }
        });
      };
    
    
    static loadDataFromFile = (filePath) => {
        try {
          if (!fs.existsSync(filePath)) {
            console.log(`File ${filePath} does not exist. Returning empty object.`);
            return {};
          }
    
          const data = fs.readFileSync(filePath, 'utf8');
          if (!data) {
            console.log(`File ${filePath} is empty. Returning empty object.`);
            return {};
          }
    
          return JSON.parse(data);
        } catch (err) {
          console.error(`Error loading data from ${filePath}:`, err);
          return {};
        }
      };


}

module.exports = FileUtils;