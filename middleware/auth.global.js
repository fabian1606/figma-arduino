import { userStore } from '~/stores/auth.js';

export default defineNuxtRouteMiddleware
    ((to, from) => {
        const runtimeConfig = useRuntimeConfig();
        const authStore = userStore();
        const redirectUrl = useRequestURL().protocol+"//"+useRequestURL().host;
        console.log(redirectUrl);
        if (!authStore.loggedIn) {
            authStore.checkAuth(to.query.code)
                .then((res) => {
                    console.log('checkAuth', res);
                    if (res) {
                        return(true);
                    } else {
                        console.log('auth redirect');
                        const authUrl = `https://www.figma.com/oauth?redirect_uri=${redirectUrl}&response_type=code&state=8TCNJE36S3MyBee5wFLxvwVL&scope=file_read&client_id=${runtimeConfig.public.FIGMA_CLIENT_ID}`;
                        // window.location.href = authUrl;
                        //redirect to figma auth
                        authStore.loggedIn = false;
                        return navigateTo(authUrl, { external: true });
                    }
                });
        }
        return (true);
    })