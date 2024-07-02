import axios from 'axios';

export default defineEventHandler(async (event) => {
        const body = await readBody(event)
        const redirect = body.redirect;
        if(!redirect) return {error: 'missing redirect'}
        const code = getRouterParam(event, 'code')
        const runtimeConfig = useRuntimeConfig();
        console.log({
            client_id: runtimeConfig.public.FIGMA_CLIENT_ID,
                    client_secret: runtimeConfig.FIGMA_CLIENT_SECRET,
                    redirect_uri: 'http://localhost:3000/',
                    code: code,
                    grant_type: 'authorization_code'
        });
    
        return new Promise((resolve, reject) => {
            axios.post('https://www.figma.com/api/oauth/token',
                new URLSearchParams({
                    client_id: runtimeConfig.public.FIGMA_CLIENT_ID,
                    client_secret: runtimeConfig.FIGMA_CLIENT_SECRET,
                    redirect_uri: redirect,
                    code: code,
                    grant_type: 'authorization_code'

                }).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            )
                .then((response) => {
                    if (response.status === 200 && response.data) {
                        console.log('##################################### response 200 ok');
                        resolve(response.data);
                    }
                    else {
                        alert('Authentication failed');
                        reject(false);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching token:', error);
                    reject("Error fetching token" + error);
                });
        });
    })
