import {random, startAnimation, easeIn} from 'utils';

let imgPath = `img/${Math.round(random(1, 14))}.jpg`;

let image = document.createElement('img');
image.src = imgPath;
image.onload = main;

let container = document.querySelector('.container');
let canvas = document.createElement('canvas');

let {innerHeight: height, innerWidth: width} = window;

canvas.height = height;
canvas.width = width;

container.appendChild(canvas);

function scaleToFill(imgWidth, imgHeight, containerWidth, containerHeight) {
    if (arguments.length === 2) {
        containerHeight = imgHeight.height;
        containerWidth = imgHeight.width;
        imgHeight = imgWidth.height;
        imgWidth = imgWidth.width;
    }
    let w = Math.max(containerWidth, imgWidth * (containerHeight / imgHeight));
    let h = Math.max(containerHeight, imgHeight * (containerWidth / imgWidth));
    return {
        x: -((w - containerWidth) / 2),
        y: -((h - containerHeight) / 2),
        width: w,
        height: h
    };
}

function getImageCanvas(img, dim, newCanvas) {
    newCanvas = newCanvas || document.createElement('canvas');
    newCanvas.width = dim.width;
    newCanvas.height = dim.height;
    let ctx = newCanvas.getContext('2d');
    ctx.drawImage(img, -dim.x, -dim.y, img.naturalWidth || img.width, img.naturalHeight || img.height, 0, 0, dim.width, dim.height);
    return newCanvas;
}

function makePixelPicker(img, canvas) {
    let dimensions = scaleToFill(img.width, img.height, width, height);
    let imgCanvas = getImageCanvas(img, dimensions);
    let imageData = imgCanvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    return function(x, y) {
        let color = {};
        let i = 4 * (x + y * imageData.width);
        color.r = imageData.data[i];
        color.g = imageData.data[i + 1];
        color.b = imageData.data[i + 2];
        color.a = imageData.data[i + 3];
        return color;
    };
}

class Particle {
    constructor({position, velocity, acceleration}) {
        this.position = position;
        this.velocity = velocity;
    }

    update(acceleration, friction) {
        this.velocity = this.velocity.map((coord, i) => friction * (coord + acceleration[i]));
        this.position = this.position.map((coord, i) => coord + this.velocity[i]);
        return this.position;
    }
}

function createParticles(count) {
    let particles = [];
    while (count--) {
        particles.push(new Particle({
            position: [random(canvas.width), random(canvas.height)],
            velocity: [0, 0] // [random(-4, 4), random(-4, 4)]
        }));
    }
    return particles;
}

function dist([startX, startY], [endX, endY]) {
    let diffX = startX - endX;
    let diffY = startY - endY;
    return Math.sqrt(diffX * diffX + diffY * diffY);
}

function drawLines() {
    let pixelPicker = makePixelPicker(image, canvas);
    let ctx = canvas.getContext('2d');

    let count = 500;
    let particles = createParticles(count);
    let gravity = [random(-0.005, 0.005), random(0.005)];
    let friction = 1; // 0.99;
    let origin = [canvas.width / 2, canvas.height / 2];

    document.addEventListener('click', ({clientX, clientY}) => origin = [clientX, clientY]);

    function render(t) {
        let step = Math.min(1, easeIn(t / 5000, 0, 1));
        requestAnimationFrame(render);
        let positions = particles.map(p => {
            let {position} = p;
            let distance = dist(position, origin);
            let attraction = origin.map((coord, i) => (coord - position[i]) / (distance * distance) * 10);
            let acceleration = attraction.map((coord, i) => coord + gravity[i]);
            return p.update(acceleration, friction);
        });
        positions.forEach(p => {
            let ran = Math.max(100 * (1 - step), 1);
            let radius = random(ran, ran * 2);
            let {r, g, b} = pixelPicker(p[0] | 0, p[1] | 0);
            let a = random(0.15, 0.25) * Math.pow(step, 11);
            drawCircle(ctx, p[0], p[1], radius, `rgba(${r}, ${g}, ${b}, ${a})`);
        });
    }
    requestAnimationFrame(render);
}

function drawCircle(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.closePath();
    ctx.fill();
}


let title = document.querySelector('.info h1');
let titleText = title.textContent.trim();
title.textContent = '';

let letters = [];

while (titleText.length) {
    let span = document.createElement('span');
    span.textContent = titleText[0];
    titleText = titleText.slice(1);
    title.appendChild(span);
    letters.push(span);
}

function fadeInBg(div) {
    let {height, width, top, left} = div.getBoundingClientRect();
    let c = document.createElement('canvas');
    let ctx = c.getContext('2d');
    c.height = height;
    c.width = width;
    c.style.height = `${height}px`;
    c.style.width = `${width}px`;
    let divStyle = window.getComputedStyle(div);
    c.style.bottom = divStyle.bottom;
    c.style.left = divStyle.left;
    c.style.position = 'absolute';
    c.style.zIndex = div.style.zIndex || 0;
    div.style.zIndex = div.style.zIndex ? div.style.zIndex + 1 : 1;
    container.appendChild(c);

    let hue = random(360) | 0;

    return startAnimation(step => {
        step = Math.pow(step, 3);
        let radius = step * width | 0;
        let lightness = step * 50 + 30 | 0;
        ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${hue}, ${5}%, ${lightness}%)`;
        ctx.fill();
    }, 350);
}

function fadeInText(letters, info) {
    letters.forEach((span, i) => {
        let delay = (letters.length - i) * 15;
        span.style.transition = `all 400ms cubic-bezier(.15,.62,.38,.94) ${delay}ms`;
    });
    info.classList.add('show');
}

function main() {
    let info = document.querySelector('.info');
    drawLines();
    setTimeout(() => {
        fadeInBg(info)
            .then(fadeInText.bind(null, letters, info));
    }, 5000);
}
