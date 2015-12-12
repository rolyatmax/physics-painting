export default function makePixelPicker(img, canvas) {
    let dimensions = scaleToFill(
        img.width, img.height, canvas.width, canvas.height
    );
    let imgCanvas = getImageCanvas(img, dimensions);
    let imageData = imgCanvas.getContext('2d').getImageData(
        0, 0, canvas.width, canvas.height
    );
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
    let imgWidth = img.naturalWidth || img.width;
    let imgHeight = img.naturalHeight || img.height;
    ctx.drawImage(
        img, -dim.x, -dim.y, imgWidth,
        imgHeight, 0, 0, dim.width, dim.height
    );
    return newCanvas;
}
