import axios from "axios";
export default {
    getFiles(token) {
        return new Promise((resolve, reject) => {
            axios.get('https://api.figma.com/v1/files', {
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
            axios.get(`https://api.figma.com/v1/files/${key}`,
                {
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
    })
}
}