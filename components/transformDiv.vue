<template>
  <div id="container"  :class="{ dev: props.devmode }">
    <div id="box" ref="box" :class="{ 'invissible-box': !props.devmode }">
      <slot></slot>
    </div>
    <div v-for="(corner, index) in corners" :key="index" :id="'marker' + index"
      :class="{ invissible: !props.devmode, corner: true }" :style="{ left: corner.x + 'px', top: corner.y + 'px' }"
      @mousedown="startDrag($event, index)"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits } from 'vue';
// import ContentDataService from '../utils/ContentDataService.js';
import { useRoute } from 'vue-router'

const { $contentDataService } = useNuxtApp();

const route = useRoute()

const props = defineProps(['devmode','projectId']);
const emits = defineEmits(['enterFigmaEmbedded']);

const box = ref(null);
const corners = ref([
  { x: 100, y: 100 },
  { x: 900, y: 100 },
  { x: 100, y: 550 },
  { x: 900, y: 550 }
]);

function adj(m) {
  return [
    m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
    m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
    m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]
  ];
}

function multmm(a, b) {
  const c = Array(9).fill(0);
  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < 3; ++j) {
      for (let k = 0; k < 3; ++k) {
        c[3 * i + j] += a[3 * i + k] * b[3 * k + j];
      }
    }
  }
  return c;
}

function multmv(m, v) {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
  ];
}

function basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
  const m = [
    x1, x2, x3,
    y1, y2, y3,
    1, 1, 1
  ];
  const v = multmv(adj(m), [x4, y4, 1]);
  return multmm(m, [
    v[0], 0, 0,
    0, v[1], 0,
    0, 0, v[2]
  ]);
}

function general2DProjection(x1s, y1s, x1d, y1d, x2s, y2s, x2d, y2d, x3s, y3s, x3d, y3d, x4s, y4s, x4d, y4d) {
  const s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
  const d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
  return multmm(d, adj(s));
}

function project(m, x, y) {
  const v = multmv(m, [x, y, 1]);
  return [v[0] / v[2], v[1] / v[2]];
}

function transform2d(elt, x1, y1, x2, y2, x3, y3, x4, y4) {
  const w = elt.offsetWidth, h = elt.offsetHeight;
  let t = general2DProjection(0, 0, x1, y1, w, 0, x2, y2, 0, h, x3, y3, w, h, x4, y4);
  for (let i = 0; i < 9; ++i) t[i] = t[i] / t[8];
  t = [
    t[0], t[3], 0, t[6],
    t[1], t[4], 0, t[7],
    0, 0, 1, 0,
    t[2], t[5], 0, t[8]
  ];
  t = "matrix3d(" + t.join(", ") + ")";
  elt.style.transform = t;
}

function update() {
  const boxEl = box.value;
  if (boxEl) {
    transform2d(boxEl, corners.value[0].x, corners.value[0].y, corners.value[1].x, corners.value[1].y, corners.value[2].x, corners.value[2].y, corners.value[3].x, corners.value[3].y);
  }
}

function move(evnt) {
  if (currentcorner < 0) return;
  if (corners.value[0] && corners.value[1] && corners.value[2] && corners.value[3])
  // console.log(props.projectId);
    $contentDataService.setScreenDistortion(props.projectId,corners.value);
  corners.value[currentcorner] = { x: evnt.pageX, y: evnt.pageY };
  update();
}

let currentcorner = -1;

// window.addEventListener('load', function () {
//   document.documentElement.style.margin = "0px";
//   document.documentElement.style.padding = "0px";
//   document.body.style.margin = "0px";
//   document.body.style.padding = "0px";
//   update();
// });

const startDrag = (evnt, corner) => {
  currentcorner = corner;
};

const loadCorners = () => {
  if(props.projectId.length<22) return;

  $contentDataService.getScreenDistortion(props.projectId)
    .then((response) => {
      corners.value = response;
      // console.log(response, corners.value);
      update();
    })
    .catch((error) => {
      if (error === "NO_UUID_PROVIDED") {
        console.log('No UUID provided');
        emits("enterFigmaEmbedded");
      } else {
        console.log('Error getting screen distortion', error);
      }
    });
};

onMounted(() => {
  loadCorners();

  setInterval(() => {
    if (currentcorner < 0) {
      window.addEventListener('mouseup', function () {
        currentcorner = -1;
      });
      
      window.addEventListener('mousemove', move);
      loadCorners();
    }
  }, 1000);
});


</script>

<style scoped>
#container {
  position: relative;
  width: 100%;
  height: 100%;
}

#container.dev #box * {
  background-color: red;
  pointer-events: none;
}

.invissible {
  display: none !important;
}

.invissible-box {
  outline: none !important;
}

#box {
  position: absolute;
  top: 0px;
  left: 0px;
  width: auto;
  height: auto;
  outline: 0.5px solid red;
  transform-origin: 0 0;
}

.corner {
  display: block;
  position: absolute;
  background-color: red;
  cursor: pointer;
  user-select: none;
  width: 10px;
  height: 10px;
  transform: translate(-5px, -5px);
  border-radius: 10px;
}
</style>
