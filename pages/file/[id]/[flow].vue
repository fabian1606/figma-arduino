<template>
    <div>
        <div class="dev-container" v-if="devmode">
            currentframe: {{ currentframe + " " + computedFrameName }}
            <button @click="navigateToPage(devNavigateTo)">Navigate to Page <input v-model="devNavigateTo"
                    type="text"></button>
            <button @click="nextPage()">NextPage</button>
            <button @click="previousPage()">PreviousPage</button>
            <button @click="restart()">Restart</button>
            <button @click="resetScreenDistortion()">Reset Screen Distortion</button>
            <button @click="connect()">connect Serial</button>
            <label for="show-settings">show settings</label>
            <input type="checkbox" id="show-settings" v-model="showSettings">
            <div class="settings" v-if="showSettings">
                <label for="flow">flow to show:</label>
                <select name="selectFrame" id="flow" v-model="selectedFrameId"
                    @change="changeStartingNode(selectedFrameId)">
                    <option value="0:1" selected>default</option>
                    <option v-for="page in pages" :value="page.nodeId" :key="page.id">{{ page.name }}</option>
                </select>
                <label for="allow-mqtt">send mqtt messages on event:</label>
                <input type="checkbox" id="allow-mqtt" v-model="config.allowMqtt" @change="setConfig()">
                <label for="sync-events">sync events between windows:</label>
                <input type="checkbox" id="sync-events" v-model="config.syncEvents" @change="setConfig()">
                <label for="allow-flowchange">allow changes between flows</label>
                <input type="checkbox" id="sync-events" v-model="config.allowFlowchange" @change="setConfig()">
                <label for="precence-detector">activate precence Detector</label>
                <input type="checkbox" id="precence-detector" v-model="connectObjectDetection" @change="setConfig()">
                <button v-if="connectObjectDetection" @click="hideObjectDetectionPreview = false">
                    PrecenceDetectorPreview
                </button>
            </div>
            <div class="precenceSettings" v-if="showSettings  && connectObjectDetection">
                <div>
                    <label for="on-precence">event on Precence</label>
                    <input type="text" id="on-precence" placeholder="enter frame Name" v-model="precence">
                    <input type="text" placeholder="(enter the flow name)" v-model="precenceFlow">
                    <button
                        @click="addPrecenceEvent()">add</button>
                    <div v-for="(events, index) in config.precenceDetectorEvents?.precenceEvents || []">
                        <p>{{ events }}<button @click="removePrecenceEvent(index)">remove</button></p>
                    </div>
                </div>
                <div>
                    <label for="on-no-precence">event without Precence</label>
                    <input type="text" id="on-no-precence" placeholder="enter frame Name" v-model="noPrecence">
                    <input type="text" placeholder="(enter the flow name)" v-model="noPrecenceFlow">
                    <button
                    @click="addNoPrecenceEvent()">add</button>
                    <div v-for="(events, index) in config.precenceDetectorEvents?.noPrecenceEvents || []">
                        <p>{{ events }}<button @click="removeNoPrecenceEvent(index)">remove</button></p>
                    </div>
                </div>
            </div>
        </div>
        <objectDetector v-if="connectObjectDetection" @precence="triggerPrecenceEvents()"  @noPrecence="triggerNoPrecenceEvents()" :hide="hideObjectDetectionPreview"
            @close="hideObjectDetectionPreview = true" />
        <transformDiv @enterFigmaEmbedded="enterFigmaIdPage = true" :devmode="devmode" :projectId="fileId"
            :flowId="currentFlow" :size="windowSize"
            @cornerPosUpdate="(event) => $contentDataService.setScreenDistortion(event)">
            <div :class="{ 'figma-container': true, hide: !showUi }">
                <iframe v-if="url" class="figma" ref="figma" style="border: 1px solid rgba(0, 0, 0, 0.1);"
                    :width="windowSize.x" :height="windowSize.y"
                    :src="`https://www.figma.com/embed?embed_host=example&embed_origin=${origin}&url=https%3A%2F%2Fwww.figma.com%2Fproto%2F${url}%26hide-ui%3D1%26content-scaling%3Dfixed%26scaling%3Dcontain%26content-scaling%3Dfixed`"></iframe>
                <!-- h                     dUY2K63pS7K212BmXc9feR%2FScreens%3Fpage-id%3D817%3A3%26node-id%3D850-218 -->
                <!-- https://www.figma.com/proto/dUY2K63pS7K212BmXc9feR/Screens?node-id=647-3353&t=wUS2De4WjqDyVKDl-0&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=647%3A3353&show-proto-sidebar=1 -->
                <!-- src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FdUY2K63pS7K212BmXc9feR%2FScreens%3Fpage-id%3D817%253A3%26node-id%3D850-399%26viewport%3D701%252C1238%252C0.14%26t%3DeYKwhHCV9PKc4Onr-1%26scaling%3Dcontain%26content-scaling%3Dfixed%26starting-point-node-id%3D850%253A399%26show-proto-sidebar%3D1" allowfullscreen></iframe> -->
                <!-- <iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FzzpqkQpao2Xv6YKWxVjuKL%2FUntitled%3Fpage-id%3D13%253A25%26node-id%3D13-26%26viewport%3D514%252C626%252C0.35%26t%3Dt0gxLncfCKigtFz2-1%26scaling%3Dmin-zoom%26content-scaling%3Dfixed" allowfullscreen></iframe> -->
                <!-- :src="`https://www.figma.com/embed?embed_host=share&embed_origin=${origin}&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FdUY2K63pS7K212BmXc9feR%2FScreens%3D0%253A1%26node-id%3D647-3353`"></iframe> -->
                <!-- src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FdUY2K63pS7K212BmXc9feR%2FScreens%3F
        page-id%3D0%253A1%26node-id%3D647-3353%26viewport%3D-4322%252C-1525%252C0.09%26t%3Di2EoB1EZalKWrxRn-1%26scaling%3Dcontain%26content-scaling%3Dfixed%26starting-point-node-id%3D647%253A3353%26show-proto-sidebar%3D1" allowfullscreen></iframe> -->
            </div>
        </transformDiv>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
// import figmaervice from '~/utils/figmaService.js'
import { userStore } from '~/stores/auth.js';

const { $contentDataService } = useNuxtApp();

const noPrecence = ref("");
const noPrecenceFlow = ref("");
const precence = ref("");
const precenceFlow = ref("");

const authStore = userStore();

const hideObjectDetectionPreview = ref(true);
const showSettings = ref(false);
const connectObjectDetection = ref(false);

const route = useRoute()
const router = useRouter();
const selectedFrameId = ref("0:1");

const figma = ref(null);
const url = ref("");
const origin = ref("");
const devNavigateTo = ref("");
const showUi = ref(true);
const fileId = ref("");

const enterFigmaIdPage = ref(false);

const currentframe = ref(null);
const currentFlow = ref(null);

const devmode = ref(false);
const canvases = ref([]);
const frames = ref([]);

const windowSize = ref({ x: 800, y: 450 });

const config = ref({
    allowMqtt: false,
    syncEvents: false,
    allowFlowchange: false,
});

const navigationCommands = {
    toFrame: 'NAVIGATE_TO_FRAME_AND_CLOSE_OVERLAYS',
    forward: 'NAVIGATE_FORWARD',
    backwards: 'NAVIGATE_BACKWARD',
    componentState: 'CHANGE_COMPONENT_STATE',
    restart: 'RESTART'
}

const triggerPrecenceEvents = () => {
    if (config.value.precenceDetectorEvents.precenceEvents) {
        config.value.precenceDetectorEvents.precenceEvents.forEach((event) => {
                const frame = frames.value.find((fr) => fr.name == event.frameName);
                if (frame) {
                    navigateToPage(frame.id, event.flowId);
                    console.log(event);
                }
                else {
                    console.warn("Frame not found", event.frameName);
                }

                // frameId = frames.value.find((fr) => fr.name == event.frameName);
                // triggerEvent(navigationCommands.toFrame, event.flowId);
        });
    }
}
const triggerNoPrecenceEvents = () => {
    if (config.value.precenceDetectorEvents.noPrecenceEvents) {
        config.value.precenceDetectorEvents.noPrecenceEvents.forEach((event) => {
            const frame = frames.value.find((fr) => fr.name == event.frameName);
            if (frame) {
                navigateToPage(frame.id, event.flowId);
            }
            else {
                console.warn("Frame not found", event.frameName);
            }
        });
    }
}

const addNoPrecenceEvent = () => {
    if (!noPrecence.value) return;
    if (!config.value.precenceDetectorEvents?.noPrecenceEvents) config.value.precenceDetectorEvents = { precenceEvents: [], noPrecenceEvents: [] };
    config.value.precenceDetectorEvents.noPrecenceEvents.push({frameName: noPrecence.value, flowId: noPrecenceFlow.value || "*"});
    setConfig();
    noPrecence.value = "";
}
const addPrecenceEvent = () => {
    if (!precence.value) return;
    if (!config.value.precenceDetectorEvents?.precenceEvents) config.value.precenceDetectorEvents = { precenceEvents: [], noPrecenceEvents: [] };
    config.value.precenceDetectorEvents.precenceEvents.push({frameName: precence.value, flowId: precenceFlow.value || "*"});
    setConfig();
    precence.value = "";
}
const removeNoPrecenceEvent = (index) => {
    config.value.precenceDetectorEvents.noPrecenceEvents.splice(index, 1);
    setConfig();
}
const removePrecenceEvent = (index) => {
    config.value.precenceDetectorEvents.precenceEvents.splice(index, 1);
    setConfig();
}

const changeStartingNode = (nodeId) => {
    const urlEncodedUrl = encodeURIComponent(url.value)
    // remove %26page-id
    const pageId = encodeURIComponent(frames.value.find((fr) => fr.id == nodeId).ParentFlow);
    const urlSplit = urlEncodedUrl.split("node-id");
    router.push(`/file/${urlSplit[0]}node-id%3D${nodeId.replace(":", "-")}/${nodeId}`);
    console.log(`/file/${urlEncodedUrl}page-id%3D${pageId}/${nodeId}`);
    navigateToPage(nodeId);
}

const computeFigmaFrames = (canvas, flow = '') => {
    if (canvas.type === 'FRAME') {
        const frame = canvas;
        frame.ParentFlow = flow;
        frames.value.push(frame);
    }
    else if (!canvas.children) return;
    else if (canvas.type === 'CANVAS') {
        canvas.children.forEach((child) => {
            computeFigmaFrames(child, canvas.id);
        });
    }
    else {
        canvas.children.forEach((child) => {
            computeFigmaFrames(child, flow);
        });
    }
    return;

};

const useFigmaApi = async () => {
    await authStore.checkAuth();
    figmaService.getFile(authStore.authInfo.token, fileId.value)
        .then((res) => {
            const document = res.document;
            console.log(document);
            canvases.value = document.children.filter((child) => child.type === 'CANVAS');
            if (canvases.value.length > 0) {
                computeFigmaFrames(document);
                serialSendFrames(frames.value);
                let currentframeOb = frames.value.find((fr) => fr.id == currentFlow.value);
                if (currentFlow.value === "0:1") {
                    const frames = canvases.value[0].children.filter((child) => child.type === 'FRAME');
                    currentframe.value = canvases.value[0].prototypeStartNodeID || frames.children[0].id;
                    currentframeOb = frames.find((fr) => fr.id == currentframe.value);
                }
                windowSize.value = { x: currentframeOb.absoluteRenderBounds.width, y: currentframeOb.absoluteRenderBounds.height };
                // console.log(currentframeOb);

            }
            else {
                console.error('No canvas found', document.children);
            }
        })
        .catch((error) => {
            console.error("error fetching figma document file:", error);
        });
}

const pages = computed(() => {
    const pages = [];
    canvases.value.forEach((canvas) => {
        // get all canvase children of type frame
        const frames = canvas.children.filter((child) => child.type === 'FRAME');
        canvas.nodeId = canvas.prototypeStartNodeID || frames[0].id;
        pages.push(canvas);

        canvas.flowStartingPoints.forEach((flow) => {
            pages.push({ ...flow, name: canvas.name + " " + flow.name, id: canvas.id + flow.nodeId });
        });
    });
    return pages;
}
)

const computedFrameName = computed(() => {
    if (!frames.value[0]) return "";
    const frame = frames.value.find((fr) => fr.id == currentframe.value);
    return frame ? frame.name : "";
});

const computedFrameObject = computed(() => {
    if (!frames.value[0]) return {};
    const frame = frames.value.find((fr) => fr.id == currentframe.value);
    return frame ? frame : {};
});

const getConfig = () => {
    $contentDataService.getConfig(fileId.value)
        .then((response) => {
            config.value = response;
        })
}
const setConfig = () => {
    $contentDataService.setConfig(fileId.value, config.value)
        .then((response) => {
            console.log(response);
        })
}

const onEvent = (msg) => {
    if (config.value.syncEvents) {
        if (config.value.allowFlowchange || msg.data.flowId === currentFlow.value || msg.data.flowId === "*") {
            triggerEvent(msg.type, msg.data.presentedNodeId);
        }
        else {
            console.warn("Flow change not allowed or target frame not found.", config.value);
        }
    }
    else {
        console.warn("Event sync disabled");
    }
}


// on Mounted
onMounted(() => {
    origin.value = useRequestURL().protocol + "//" + useRequestURL().host;
    url.value = useRoute().params.id;
    url.value = url.value.replace("%253A", "-");
    fileId.value = route.params.id.substring(0, 22);
    currentFlow.value = useRoute().params.flow;
    getConfig();
    useFigmaApi();
    console.log(origin.value);
    setCallbackFunction(navigateToPage);
    $contentDataService.onEvent(fileId.value, onEvent);
    window.addEventListener("message", (event) => {
        // console.log(`Received message ${JSON.stringify(event.data)}`);
        if (event.data.type === 'PRESENTED_NODE_CHANGED') {
            // $contentDataService.triggerEvent(fileId.value,event.data);
            if (event.data.data.presentedNodeId !== currentframe.value) {
                currentframe.value = event.data.data.presentedNodeId;
                frameChanged(event.data.data.presentedNodeId);
                if (config.value.allowMqtt) {
                    useFetch('/api/mqtt/sendMessage', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            topic: `figma:${fileId.value}`,
                            client: 'mqtt://mqtt.hfg.design',
                            message: event.data.data.presentedNodeId,
                        }),
                    })
                        .catch((error) => {
                            console.error('Error sending mqtt message', error);
                        });
                }
            }
        }
        else if (event.data.type === 'INITIAL_LOAD') {
            if (currentFlow.value !== "0:1")
                triggerEvent(navigationCommands.toFrame, currentFlow.value);
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
const nextPage = (nodeId) => triggerEvent(navigationCommands.forward, flowId);
const previousPage = (nodeId) => triggerEvent(navigationCommands.backwards, nodeId);
const restart = (nodeId) => triggerEvent(navigationCommands.restart, nodeId);

const navigateToPage = (nodeId, flowId) => {
    console.log(flowId, currentFlow.value, nodeId);

    if (!flowId) {
        console.warn("No flowId provided", flowId);
        flowId = currentFlow.value;
    }

    $contentDataService.triggerEvent(fileId.value, { type: 'NAVIGATE_TO_FRAME_AND_CLOSE_OVERLAYS', data: { presentedNodeId: nodeId, flowId } })
    if (config.value.allowFlowchange || (currentFlow.value === flowId || flowId === "*")) {
        triggerEvent(navigationCommands.toFrame, nodeId);
    } else {
        console.warn("Flow change not allowed or target frame not found. flowId:");
    }
};

const resetScreenDistortion = () => {
    $contentDataService.setScreenDistortion(`${fileId.value}/${currentFlow.value}`, [
        { x: 0, y: 0 },
        { x: windowSize.value.x, y: 0 },
        { x: 0, y: windowSize.value.y },
        { x: windowSize.value.x, y: windowSize.value.y }
    ])
        .then(() => {
            console.log('Screen distortion reset');
            window.location.reload();
        })
        .catch((error) => {
            console.error('Error resetting screen distortion', error);
        });
};
</script>

<style lang="scss">
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
.figma{
    transform: scale(1.1);
}

.precence-settings {
    display: inline;
}
::-webkit-scrollbar {
    display: none;
}

* {
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
}
</style>