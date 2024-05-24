import axios from 'axios';
import fs from 'fs';
const cyberLink = "https://web-production-5ee8.up.railway.app";
let currUser = null;
import FormData from 'form-data';

//function to check if user is configured
function checkConfig(){
    if(currUser == null){
        throw new Error("Cyberlake user is not configured.");
    }
}

//configuring the user
export const userConfig = async(params) => {
    try{
        const response = await axios.post(`${cyberLink}/userConfig`,{
            cyberlakeKey:params.cyberlakeKey,
            email:params.email
        });
        currUser = response.data.user;
    }catch(err){
        throw new Error("Failed to configure the Cyberlake user.");
    }
}

//uploading the Cyberlake file
export const uploadFile = async(params) => {
    checkConfig();
    try{
        const filePath = params.filePath;
        const form = new FormData();
        const fileData = fs.readFileSync(filePath);
        form.append('cyberlakeFile', fileData); 
        form.append('user',JSON.stringify(currUser));
        form.append('passcode',params.passcode);
        form.append('fileName',params.fileName);
        const response = await axios.post(`${cyberLink}/upload`,{
            form
        },{
        headers:{
            'Content-Type': form.getHeaders()
        }});
        return { 
            fileName:response.data.fileName,
            fileUrl:`http://${response.data.fileUrl}`,
            cyberUrl:response.data.cyberUrl,
            dataAfterUpload:response.data.dataAfterUpload
        }
    }catch(err){
        throw new Error(err);
    }
}

//downloading the Cyberlake file
export const downloadFile = async(params) => {
    checkConfig();
    try{
        const res = await axios.post(`${cyberLink}/upload`,{
            fileName:params.fileName,
            passcode:params.passcode,
            user:currUser
        });
        const downloadUrl = res.data.fileUrl;

        const response = await axios.get(downloadUrl, { responseType: 'stream' }); 
        const filename = downloadUrl.split('/').pop();
        const writeStream = fs.createWriteStream(filename);
        
        response.data.pipe(writeStream);
        
        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => resolve({ message: 'Cyberlake file successfully downloaded.' }));
            writeStream.on('error', reject);
        });
    }catch(err){
        throw new Error("Failed to download the Cyberlake file.");
    }
}

export const optimizeCSV = async(params) => {
    checkConfig();
    try{
        const response = await axios.post(`${cyberLink}/csv`,{
            fileName:params.fileName,
            passcode:params.passcode,
            user:currUser
        });
        return {
            fileUrl:response.data.fileUrl,
            fileName:response.data.fileName,
            fileSizeInGB:response.data.fileSizeInGB,
            cyberUrl: response.data.cyberUrl,
        }
    }catch(err){
        throw new Error("Failed to optimize the CSV file.");
    }
}


