import axios from "axios";
export default {
    getFiles(token) {
        return new Promise((resolve, reject) => {
            axios.get('/api/figma/v1/files', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                });
            });
        },
        getFile(token, key) {
            return new Promise((resolve, reject) => {
            console.log('hello',key,token);
            axios.get(`/api/figma/v1/files/${key}`,
                {
                    headers: {

                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => {
                    console.log("response ##############");
                resolve(response.data);
            })
            .catch(error => {
                console.log("error", error);
                reject(error);
            });
    })
}
}