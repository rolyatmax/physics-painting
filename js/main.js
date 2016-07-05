import {easeIn} from 'utils';
import Alea from 'alea';
import InfoBox from './info_box';
import makePixelPicker from './pixel_picker';
import SimplexNoise from 'simplex-noise';
import {GUI} from 'dat-gui';


function createRandom(randNumGenerator) {
    return (low, high) => {
        if (high === undefined) {
            high = low;
            low = 0;
        }
        return randNumGenerator() * (high - low) + low | 0;
    };
}

let prng;
let random;
let simplex;

seed();

const SPACEBAR = 32;
const images = ['flatiron', 'blossoms', 'coffee', 'mountains', 'empire', 'palms',
    'fruit', 'mosque', 'snowday', 'skyline', 'whitehouse'];
const maxSize = Math.max(window.innerHeight, window.innerWidth) / 2 | 0;
const config = {
    image: images[random(images.length)],
    particles: random(100, 600),
    friction: 0.99,
    area: random(maxSize / 10, maxSize / 1.5),
    lifespan: random(5, 60),
    size: random(1, 20),
    noiseSize: 1000,
    speed: 40,
    fade: 0.1
};

let running = true;
let animationToken;
let container = document.querySelector('.container');
let canvas = document.createElement('canvas');

let {innerHeight: height, innerWidth: width} = window;
canvas.height = height;
canvas.width = width;
container.appendChild(canvas);

window.addEventListener('keyup', (e) => running = e.which !== SPACEBAR);

class Particle {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
    }

    update(acceleration, friction) {
        this.velocity = this.velocity.map((coord, i) => friction * (coord + acceleration[i]));
        this.position = this.position.map((coord, i) => coord + this.velocity[i]);
        return this.position;
    }
}

function drawLines(image, ctx) {
    // ctx.globalCompositeOperation = 'darker';
    let z = 0;
    let pixelPicker = makePixelPicker(image, ctx.canvas);
    let particles = createParticles(config.particles);
    // let gravity = [random(-0.005, 0.005), random(0.005)];
    let origin = [ctx.canvas.width / 2, ctx.canvas.height / 2];

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

    function dist([startX, startY], [endX, endY]) {
        let diffX = startX - endX;
        let diffY = startY - endY;
        return Math.sqrt(diffX * diffX + diffY * diffY);
    }

    function drawCircle(x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.closePath();
        ctx.fill();
    }

    function render() {
        z += 1;
        let step = Math.min(1, easeIn(z, 0, 1));
        if (running) animationToken = requestAnimationFrame(render);
        let positions = particles.map(p => {
            let {position} = p;
            // let distance = dist(position, origin);
            // let attraction = origin.map((coord, i) =>
            //     (coord - position[i]) / (distance * distance));
            let noise = simplex.noise3D(position[0] / config.noiseSize, position[1] / config.noiseSize, z / config.noiseSize);
            let angle = noise * 360;
            let x = Math.sin(angle);
            let y = Math.cos(angle);
            let acceleration = [x / config.speed, y / config.speed]; //.map((c, i) => c + attraction[i]);
            return p.update(acceleration, config.friction);
        });
        let a = Math.max(0.01, (1 - Math.pow(z / (config.lifespan * 16), 2)) / config.size );
        positions.forEach((p, i) => {
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

function loadImage(path, cb) {
    let image = document.createElement('img');
    image.src = path;
    image.onload = () => cb(image);
}

function redraw() {
    let imgPath = `img/${config.image}.jpg`;
    loadImage(imgPath, (image) => {
        running = true;
        cancelAnimationFrame(animationToken);
        const ctx = window.ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawLines(image, ctx);
    });
}

function seed() {
    let s = location.hash.slice(1) ?
        parseInt(location.hash.slice(1), 10) :
        (Math.random() * 99999) | 0;
    location.hash = `#${s}`;
    prng = new Alea(s);
    random = createRandom(prng);
    simplex = window.simplex = new SimplexNoise(prng);
}

function reseed() {
    location.hash = '';
    seed();
    redraw();
}

function onConfigChange() {
    location.hash = '';
    redraw();
}

let info = new InfoBox(document.querySelector('.info'));
setTimeout(() => info.show(), 5000);
redraw();

const gui = window.gui = new GUI();
gui.add(config, 'area', 10, maxSize).step(1).onFinishChange(onConfigChange);
gui.add(config, 'particles', 1, 1000).step(1).onFinishChange(onConfigChange);
gui.add(config, 'friction', 0.5, 0.99).step(0.01).onFinishChange(onConfigChange);
gui.add(config, 'lifespan', 1, 120).step(1).onFinishChange(onConfigChange);
gui.add(config, 'size', 1, 200).step(1);
gui.add(config, 'noiseSize', 10, 10000).step(10).onFinishChange(onConfigChange);
gui.add(config, 'speed', 1, 100).step(1).onFinishChange(onConfigChange);
gui.add(config, 'fade', 0, 0.3).step(0.01);
gui.add(config, 'image', images).onFinishChange(onConfigChange);
gui.add({ redraw }, 'redraw');
gui.add({ reseed }, 'reseed');
