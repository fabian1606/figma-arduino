<template>
    <div :class="{ overlay: true, hidden: props.hide }">
        <div>
            <div class="close" @click="$emit('close')">&#x2715;</div>
            <h2>Object detection preview</h2>
            <video class="hidden" ref="webcam" width="640" height="480" autoplay></video>
            <div v-if="isLoadingModel">Loading Model ...</div>
            <img id="img_to_detect" class="hidden">
            <canvas id="detect_result"></canvas>
        </div>
    </div>
</template> 

<script setup>
import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { ref, onMounted, defineEmits, defineProps } from 'vue'

const props = defineProps(['hide'])
const emits = defineEmits(['precence', 'noPrecence','close'])

const isLoadingModel = ref(false)   
const evendSend = ref(false)
let cocoSsdModel = null
const webcam = ref(null)
const framesWithoutPerson = ref(0)

onMounted(async () => {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                console.log("Webcam stream started.");
                webcam.value.srcObject = stream;
                webcam.value.addEventListener("loadedmetadata", () => {
                    webcam.value.play();
                });
            })
            .catch((error) => {
                console.error('Error accessing webcam:', error);
            });
    } else {
        console.error('getUserMedia not supported in this browser.');
    }

    isLoadingModel.value = true;
    cocoSsdModel = await cocoSsd.load()
    isLoadingModel.value = false;

    setInterval(async () => {
        await getDetect(webcam.value);
    }, 500);
});

const getDetect = async (img) => {
    const result = await cocoSsdModel.detect(img);
    const canvas = document.getElementById('detect_result');
    const colors = ["red", "green", "blue"];
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, img.width, img.height);
    context.font = '40px Arial';
    let personDetected = false;

    for (let i = 0; i < result.length; i++) {
        if (result[i].class === "person") {
            personDetected = true;
            context.beginPath();
            context.rect(...result[i].bbox);
            context.lineWidth = 5;
            context.strokeStyle = colors[i % 3];
            context.fillStyle = colors[i % 3];
            context.stroke();
            context.fillText(
                `${result[i].score.toFixed(3)} ${result[i].class}`,
                result[i].bbox[0],
                result[i].bbox[1] - 5
            );
        }
    }

    if (personDetected) {
        if (framesWithoutPerson.value > 2) {
            framesWithoutPerson.value = 0;
            console.log("Person detected");
            emits('precence');
            evendSend.value = true;
        }
    } else {
        framesWithoutPerson.value++;
    }

    if (framesWithoutPerson.value > 5 && evendSend.value) {
        emits('noPrecence');
        console.log("No person detected for 20 frames");
        evendSend.value = false;
    }

};
</script>

<style lang="scss" scoped>
.overlay {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}
.overlay > div {
    position: relative;
}
.close {
    position: absolute;
    right: 10px;
    top: 10px;
    font-size: 30px;
    cursor: pointer;
    color: white;
}
.hidden {
    visibility: hidden;
    display: none;
}
</style>
