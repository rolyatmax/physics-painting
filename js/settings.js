import createEncoder from 'encode-object';
import createRandom from './create_random';
import {GUI} from 'dat-gui';


export default function createSettings(onChange) {
    const random = createRandom();
    const gui = new GUI();
    const generateSeed = () => (Math.random() * 99999) | 0;

    const images = ['flatiron', 'blossoms', 'coffee', 'mountains', 'empire', 'palms',
        'fruit', 'mosque', 'snowday', 'skyline', 'whitehouse'];
    const maxSize = Math.max(window.innerHeight, window.innerWidth) / 2 | 0;

    const encoder = createEncoder({
        seed: ['int', 5],
        // update encode-object to accept list of strings in config
        // this is drastically increasing the length of the hash
        image: ['int', 2],
        particles: ['int', 3],
        friction: ['float', 3],
        area: ['int', 4],
        lifespan: ['int', 3],
        size: ['int', 3],
        noiseSize: ['int', 5],
        speed: ['int', 2],
        fade: ['float', 2]
    });

    const encodeObject = function(obj) {
        obj = {...obj};
        obj.image = images.indexOf(obj.image);
        return encoder.encodeObject(obj);
    };

    const decodeObject = function(hash) {
        let obj = encoder.decodeObject(hash);
        obj.image = images[obj.image];
        return obj;
    };

    const config = {};
    const hash = location.hash.slice(1);
    updateConfig(hash ? decodeObject(hash) : randomConfig());

    function updateHash(cfg) {
        location.hash = encodeObject(cfg);
        for (let key in gui.__controllers) {
            gui.__controllers[key].updateDisplay();
        }
    }

    function randomConfig() {
        return {
            seed: generateSeed(),
            image: images[random(images.length)],
            particles: random(100, 600),
            friction: 0.99,
            area: random(maxSize / 10, maxSize / 1.5),
            lifespan: random(5, 60),
            size: random(1, 15),
            noiseSize: random(10, 9999),
            speed: random(1, 50),
            fade: 0.0
        };
    }

    function updateConfig(newConfig) {
        Object.keys(newConfig).forEach((key) => {
            config[key] = newConfig[key];
        });
        updateHash(config);
        onChange(config);
    }

     // update manually, otherwise always use updateConfig()
    const configChangeHandler = () => updateConfig(config);
    const randomize = () => updateConfig(randomConfig());
    const reseed = () => updateConfig({ seed: generateSeed() });

    function setupGUI(fns) {
        gui.add(config, 'area', 10, maxSize).step(1).onFinishChange(configChangeHandler);
        gui.add(config, 'particles', 1, 999).step(1).onFinishChange(configChangeHandler);
        gui.add(config, 'friction', 0.5, 0.99).step(0.01).onFinishChange(configChangeHandler);
        gui.add(config, 'lifespan', 1, 120).step(1).onFinishChange(configChangeHandler);
        gui.add(config, 'size', 1, 20).step(1).onFinishChange(configChangeHandler);
        gui.add(config, 'noiseSize', 10, 99990).step(10).onFinishChange(configChangeHandler);
        gui.add(config, 'speed', 1, 50).step(1).onFinishChange(configChangeHandler);
        gui.add(config, 'fade', 0, 0.3).step(0.01).onFinishChange(configChangeHandler);
        gui.add(config, 'image', images).onFinishChange(configChangeHandler);
        gui.add({ reseed }, 'reseed');
        gui.add({ randomize }, 'randomize');
        Object.keys(fns).forEach(fnName => {
            const fn = () => fns[fnName](config);
            gui.add({ [fnName]: fn }, fnName);
        });
        return gui;
    }
    return { setupGUI };
}
