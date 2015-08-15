import {startAnimation, random} from 'utils';

export default class InfoBox {
    constructor(el) {
        this.el = el;
        let title = el.querySelector('h1');
        let titleText = title.textContent.trim();
        this.letters = this.buildLetterEls(titleText);
        title.textContent = '';
        this.letters.forEach(title.appendChild.bind(title));
    }

    buildLetterEls(text) {
        let letters = [];
        while (text.length) {
            let span = document.createElement('span');
            span.textContent = text[0];
            text = text.slice(1);
            letters.push(span);
        }
        return letters;
    }

    fadeInBg() {
        let {height, width} = this.el.getBoundingClientRect();
        let c = document.createElement('canvas');
        let ctx = c.getContext('2d');
        c.height = height;
        c.width = width;
        c.style.height = `${height}px`;
        c.style.width = `${width}px`;
        let divStyle = window.getComputedStyle(this.el);
        c.style.bottom = divStyle.bottom;
        c.style.left = divStyle.left;
        c.style.position = 'absolute';
        c.style.zIndex = this.el.style.zIndex || 0;
        this.el.style.zIndex = this.el.style.zIndex ? this.el.style.zIndex + 1 : 1;
        this.el.parentElement.appendChild(c);

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


    fadeInText() {
        this.letters.forEach((span, i) => {
            let delay = (this.letters.length - i) * 15;
            span.style.transition = `all 400ms cubic-bezier(.15,.62,.38,.94) ${delay}ms`;
        });
        this.el.classList.add('show');
    }

    show() {
        this.fadeInBg().then(this.fadeInText.bind(this));
    }
}
