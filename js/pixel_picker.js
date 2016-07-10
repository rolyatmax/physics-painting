import fit from 'objectfit/cover';

export default function makePixelPicker(img, canvas) {
    let imgCanvas = getImageCanvas(img, canvas);
    let imageData = imgCanvas.getContext('2d').getImageData(
        0, 0, canvas.width, canvas.height
    );
    return (x, y) => {
        let i = 4 * (x + y * imageData.width);
        return {
            r: imageData.data[i],
            g: imageData.data[i + 1],
            b: imageData.data[i + 2],
            a: imageData.data[i + 3]
        };
    };
}

function getImageCanvas(img, container) {
    let newCanvas = document.createElement('canvas');
    newCanvas.width = container.width;
    newCanvas.height = container.height;
    let ctx = newCanvas.getContext('2d');
    let imgWidth = img.naturalWidth || img.width;
    let imgHeight = img.naturalHeight || img.height;
    let bounds = fit(
        [0, 0, container.width, container.height],
        [0, 0, imgWidth, imgHeight]
    );
    ctx.drawImage.apply(ctx, [img].concat(bounds));
    return newCanvas;
}
