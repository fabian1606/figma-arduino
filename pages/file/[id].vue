<template>
    <div class="dev-container" v-if="devmode">
        currentframe: {{ currentframe }}
        <button @click="navigateToPage(devNavigateTo)">Navigate to Page <input v-model="devNavigateTo"
                type="text"></button>
        <button @click="nextPage()">NextPage</button>
        <button @click="previousPage()">PreviousPage</button>
        <button @click="restart()">Restart</button>
        <button @click="resetScreenDistortion()">Reset Screen Distortion</button>
        show Overflow: <input type="checkbox" v-model="showUi">
        <button @click="connect()">connect Serial</button>
        <select name="selectFrame" v-model="selectedFrameId" @change="changeStartingNode(selectedFrameId)">
            <option v-for="page in pages" :value="page.nodeId" :key="page.id">{{ page.name }}</option>
        </select>
    </div>
    <transformDiv @enterFigmaEmbedded="enterFigmaIdPage = true" :devmode="devmode"
        @cornerPosUpdate="(event) => $contentDataService.setScreenDistortion(event)">
        <div :class="{ 'figma-container': true, hide: !showUi }">
            <iframe class="figma" ref="figma" style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450"
                :src="`https://www.figma.com/embed?embed_host=example&embed_origin=${origin}&url=https%3A%2F%2Fwww.figma.com%2Fproto%2F${url}%26hide-ui%3D1%26content-scaling%3Dfixed%26scaling%3Dcontain%26content-scaling%3Dfixed`"></iframe>
                <!-- <iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FzzpqkQpao2Xv6YKWxVjuKL%2FUntitled%3Fpage-id%3D13%253A25%26node-id%3D13-26%26viewport%3D514%252C626%252C0.35%26t%3Dt0gxLncfCKigtFz2-1%26scaling%3Dmin-zoom%26content-scaling%3Dfixed" allowfullscreen></iframe> -->
            <!-- :src="`https://www.figma.com/embed?embed_host=share&embed_origin=${origin}&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FdUY2K63pS7K212BmXc9feR%2FScreens%3D0%253A1%26node-id%3D647-3353`"></iframe> -->
            <!-- src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FdUY2K63pS7K212BmXc9feR%2FScreens%3F
             page-id%3D0%253A1%26node-id%3D647-3353%26viewport%3D-4322%252C-1525%252C0.09%26t%3Di2EoB1EZalKWrxRn-1%26scaling%3Dcontain%26content-scaling%3Dfixed%26starting-point-node-id%3D647%253A3353%26show-proto-sidebar%3D1" allowfullscreen></iframe> -->
        </div>
    </transformDiv>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
// import ContentDataService from '~/utils/ContentDataService.js'
// import { connect, frameChanged, setCallbackFunction } from '~/utils/serial.js'
// import { connectMqtt, publishFrameId } from '../../utils/mqtt.js'
import { useRoute } from 'vue-router'
// import figmaervice from '~/utils/figmaService.js'
import { userStore } from '~/stores/auth.js';

const { $contentDataService } = useNuxtApp();

const authStore = userStore();

const route = useRoute()
const selectedFrameId = ref("");

const figma = ref(null);
const url = ref("");
const origin = ref("");
const devNavigateTo = ref("");
const showUi = ref(true);
const fileId = ref("");

const enterFigmaIdPage = ref(false);

const currentframe = ref(null);

const devmode = ref(false);
const canvases = ref([]);

const navigationCommands = {
    toFrame: 'NAVIGATE_TO_FRAME_AND_CLOSE_OVERLAYS',
    forward: 'NAVIGATE_FORWARD',
    backwards: 'NAVIGATE_BACKWARD',
    componentState: 'CHANGE_COMPONENT_STATE',
    restart: 'RESTART'
}

const changeStartingNode = (nodeId) => {
    console.log(nodeId);
    navigateToPage(nodeId);
    // const oldRoute = route.params.id;
    // make new route until %3D
    // const newRoute = url.value.substring(0, url.value.indexOf('%3D')+3) + encodeURIComponent(nodeId);
    // console.log(newRoute,url.value);
    // route.id = newRoute;
    // router.push(`/file/${newRoute}`);
}

const useFigmaApi = async () => {
    await authStore.checkAuth();
    figmaService.getFile(authStore.authInfo.token, fileId.value)
        .then((res) => {
            const document = res.document;
            canvases.value = document.children.filter((child) => child.type === 'CANVAS');
            if (canvases.value.length > 0) {
                console.log(canvases.value[0].id, canvases.value[0].name);

            }
            else {
            }
            console.log('No canvas found', document.children);
        })
        .catch((error) => {
            console.log(error);
        });
}

const pages = computed(() => {
    const pages = [];
    canvases.value.forEach((canvas) => {
        canvas.nodeId = canvas.prototypeStartNodeID || canvas.children[0].id;
        pages.push(canvas);

        canvas.flowStartingPoints.forEach((flow) => {
            pages.push({ ...flow, name: canvas.name + " " + flow.name, id: canvas.id + flow.nodeId });
        });
    });
    return pages;
}
)


// on Mounted
onMounted(() => {
    origin.value = useRequestURL().protocol+"//"+useRequestURL().host;
    url.value = useRoute().params.id;
    url.value = url.value.replace("%253A", "-");
    fileId.value = route.params.id.substring(0, 22);
    connectMqtt();
    useFigmaApi();
    var css = '<style type="text/css">' +
        'body{background-color:red;} ' +
        '</style>';
    figma.value.append(css);
    console.log(origin.value);
    setCallbackFunction(navigateToPage);
    window.addEventListener("message", (event) => {
        console.log(`Received message ${JSON.stringify(event.data)}`);
        if (event.data.type === 'PRESENTED_NODE_CHANGED') {
            console.log(`Presented Node Changed to ${event.data.data.presentedNodeId}`);
            if (event.data.data.presentedNodeId !== currentframe.value) {
                currentframe.value = event.data.data.presentedNodeId;
                frameChanged(event.data.data.presentedNodeId);
                publishFrameId("test", event.data.data.presentedNodeId);
            }
        }
    });

    window.addEventListener('keydown', function (evnt) {
        if (evnt.key === 'd') {
            devmode.value = !devmode.value;
        }
        else if (evnt.key === 'f') {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }

        }
    });
});

function triggerEvent(type, nodeId) {
    figma.value.contentWindow.postMessage(
        {
            type,
            data: {
                nodeId,
            },
        },
        "*" // recipient orWigin
    );
}
const nextPage = (nodeId) => triggerEvent(navigationCommands.forward, nodeId);
const previousPage = (nodeId) => triggerEvent(navigationCommands.backwards, nodeId);
const restart = (nodeId) => triggerEvent(navigationCommands.restart, nodeId);
const navigateToPage = (nodeId) => triggerEvent(navigationCommands.toFrame, nodeId);

const resetScreenDistortion = () => {
    $contentDataService.setScreenDistortion([])
        .then(() => {
            console.log('Screen distortion reset');
            window.location.reload();
        })
        .catch((error) => {
            console.log('Error resetting screen distortion', error);
        });
};
</script>

<style lang="scss" scoped>
.dev-container {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 4;
    height: fit-content;
}

.figma-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: show;
}
</style>