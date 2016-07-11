import loadImg from 'load-img';


const noop = () => {};

export default function createImageLoader() {
    let imageCache = {};

    return function loadImage(imgPath, opts, cb = noop) {
        if (typeof opts === 'function') {
            cb = opts;
            opts = {};
        }

        let { crossOrigin } = opts;
        if (imageCache[imgPath]) {
            cb(imageCache[imgPath]);
            return;
        }

        loadImg(imgPath, { crossOrigin }, (err, image) => {
            if (err) throw err;
            imageCache[imgPath] = image;
            cb(image);
        });
    };
}
