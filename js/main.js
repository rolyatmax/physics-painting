import {random, easeIn} from 'utils';
import InfoBox from './info_box';
import makePixelPicker from './pixel_picker';

const IMAGE_COUNT = 14;
const PARTICLE_COUNT = 500;

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

function drawLines(image, canvas) {
    let pixelPicker = makePixelPicker(image, canvas);
    let ctx = canvas.getContext('2d');

    let particles = createParticles(PARTICLE_COUNT);
    let gravity = [random(-0.005, 0.005), random(0.005)];
    let friction = 1; // 0.99;
    let origin = [canvas.width / 2, canvas.height / 2];

    document.addEventListener('click', ({clientX, clientY}) => origin = [clientX, clientY]);

    function createParticles(count) {
        let ps = [];
        while (count--) {
            ps.push(new Particle({
                position: [random(canvas.width), random(canvas.height)],
                velocity: [0, 0] // [random(-4, 4), random(-4, 4)]
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

    function render(t) {
        let step = Math.min(1, easeIn(t / 5000, 0, 1));
        requestAnimationFrame(render);
        let positions = particles.map(p => {
            let {position} = p;
            let distance = dist(position, origin);
            let attraction = origin.map((coord, i) =>
                (coord - position[i]) / (distance * distance) * 10);
            let acceleration = attraction.map((coord, i) => coord + gravity[i]);
            return p.update(acceleration, friction);
        });
        positions.forEach(p => {
            let ran = Math.max(100 * (1 - step), 1);
            let radius = random(ran, ran * 2);
            let {r, g, b} = pixelPicker(p[0] | 0, p[1] | 0);
            let a = random(0.15, 0.25) * Math.pow(step, 11);
            drawCircle(p[0], p[1], radius, `rgba(${r}, ${g}, ${b}, ${a})`);
        });
    }
    requestAnimationFrame(render);
}

function loadImage(path, cb) {
    let image = document.createElement('img');
    image.src = path;
    image.onload = () => cb(image);
}

let imgPath = `img/${Math.round(random(1, IMAGE_COUNT))}.jpg`;
loadImage(imgPath, main);

function main(image) {
    let container = document.querySelector('.container');
    let canvas = document.createElement('canvas');

    let {innerHeight: height, innerWidth: width} = window;
    canvas.height = height;
    canvas.width = width;
    container.appendChild(canvas);

    drawLines(image, canvas);
    let info = new InfoBox(document.querySelector('.info'));
    setTimeout(() => info.show(), 5000);
}
