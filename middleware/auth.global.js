import { userStore } from '~/stores/auth.js';

export default defineNuxtRouteMiddleware(async (to, from) => {
    const runtimeConfig = useRuntimeConfig();
    const authStore = userStore();
    const redirectUrl = useRequestURL().protocol + "//" + useRequestURL().host;

    if (!authStore.loggedIn) {
        const res = await authStore.checkAuth(to.query.code);
        if (res) {
            const cookie = useCookie('figmaAuth');
            cookie.value = res;
            return true;
        } else {
            const authUrl = `https://www.figma.com/oauth?redirect_uri=${redirectUrl}&response_type=code&state=8TCNJE36S3MyBee5wFLxvwVL&scope=file_read&client_id=${runtimeConfig.public.FIGMA_CLIENT_ID}`;
            authStore.loggedIn = false;
            return navigateTo(authUrl, { external: true });
        }
    }
    return true;
});
