// import {easeIn} from 'utils';
import Alea from 'alea';
import InfoBox from './info_box';
import makePixelPicker from './pixel_picker';
import createImageLoader from './image_loader';
import createRandom from './create_random';
import SimplexNoise from 'simplex-noise';
import Particle from './particle';
import createSettings from './settings';


const loadImage = createImageLoader();
const info = new InfoBox(document.querySelector('.info'));
setTimeout(() => info.show(), 5000);

const SPACEBAR = 32;

let prng;
let random;
let simplex;

function setupPRNG(seed) {
    prng = new Alea(seed);
    random = createRandom(prng);
    simplex = window.simplex = new SimplexNoise(prng);
}

const { setupGUI } = createSettings(redraw);

let running = true;
let animationToken;
const container = document.querySelector('.container');
const canvas = document.createElement('canvas');

const { innerHeight: height, innerWidth: width } = window;
canvas.height = height;
canvas.width = width;
container.appendChild(canvas);

window.addEventListener('keyup', (e) => running = e.which !== SPACEBAR);

function drawLines(image, ctx, config) {
    // ctx.globalCompositeOperation = 'darker';
    let z = 0;
    let pixelPicker = makePixelPicker(image, ctx.canvas);
    let particles = createParticles(config.particles);
    // let gravity = [random(-0.005, 0.005), random(0.005)];
    // let origin = [ctx.canvas.width / 2, ctx.canvas.height / 2];

    // document.addEventListener('click', (e) => origin = [e.clientX, e.clientY]);

    function vectorLength([x, y]) {
        return Math.sqrt(x * x + y * y);
    }

    function randomPointWithinDist(center, radius) {
        const angleX = prng() * Math.PI * 2;
        const angleY = prng() * Math.PI * 2;
        const vector = [Math.sin(angleX), Math.cos(angleY)];
        const vecLength = vectorLength(vector);
        const x = vector[0] / vecLength * random(radius) + center[0];
        const y = vector[1] / vecLength * random(radius) + center[1];
        return [x, y];
    }

    function createParticles(count) {
        let ps = [];
        let center = [ctx.canvas.width / 2, ctx.canvas.height / 2];
        while (count--) {
            ps.push(new Particle({
                position: randomPointWithinDist(center, config.area),
                velocity: [0, 0]
            }));
        }
        return ps;
    }

    // function dist([startX, startY], [endX, endY]) {
    //     let diffX = startX - endX;
    //     let diffY = startY - endY;
    //     return Math.sqrt(diffX * diffX + diffY * diffY);
    // }

    function drawCircle(x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.closePath();
        ctx.fill();
    }

    function render() {
        z += 1;
        // let step = Math.min(1, easeIn(z, 0, 1));
        if (running) animationToken = requestAnimationFrame(render);
        let positions = particles.map(p => {
            let {position} = p;
            // let distance = dist(position, origin);
            // let attraction = origin.map((coord, i) =>
            //     (coord - position[i]) / (distance * distance));
            let noise = simplex.noise3D(
                position[0] / config.noiseSize,
                position[1] / config.noiseSize,
                z / config.noiseSize
            );
            let angle = noise * 360;
            let x = Math.sin(angle);
            let y = Math.cos(angle);
            // add attractor?: .map((c, i) => c + attraction[i]);
            let acceleration = [x / config.speed, y / config.speed];
            return p.update(acceleration, config.friction);
        });
        let a = Math.max(0.01, (1 - Math.pow(z / (config.lifespan * 16), 2)) / config.size);
        positions.forEach((p, i) => {
            if (p[0] < 0 || p[1] < 0 || p[0] > ctx.canvas.width || p[1] > ctx.canvas.height) {
                return;
            }
            let noise = simplex.noise2D(i, z / 5000);
            let radius = (noise + 1) * config.size / 2;
            let {r, g, b} = pixelPicker(p[0] | 0, p[1] | 0);
            drawCircle(p[0], p[1], radius, `rgba(${r}, ${g}, ${b}, ${a})`);
        });
        ctx.fillStyle = `rgba(255, 255, 255, ${config.fade})`;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    animationToken = requestAnimationFrame(render);
}

function redraw(config) {
    setupPRNG(config.seed);
    let imgPath = `img/${config.image}.jpg`;
    loadImage(imgPath, (image) => {
        running = true;
        cancelAnimationFrame(animationToken);
        const ctx = window.ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawLines(image, ctx, config);
    });
}

setupGUI({ redraw });
