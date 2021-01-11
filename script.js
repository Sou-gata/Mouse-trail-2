let canvas = document.querySelector("#myCanvas");
let context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let active = true;

let mode = 5; // 1.arc 2.line 3.squre 4.circle 5.star
let pathMode = 1;
let spread = 2;

let lineColor = "rgb(237, 184, 131)";
let lineDuration = 2;
let lineFadeLinger = 1;
let lineWidthStart = 5;
let fadeDuration = 50;
let drawEveryFrame = 1; // Only adds a Point after these many 'mousemove' events
let frame = 0;
let flipNext = false;
let duration = (lineDuration * 1000) / 60;

let points = [];

document.addEventListener("keypress", (e) => {
    if (e.key === "1") mode = 1;
    else if (e.key === "2") mode = 2;
    else if (e.key === "3") mode = 3;
    else if (e.key === "4") mode = 4;
    else if (e.key === "5") mode = 5;

    if (e.key == "q") spread = 1;
    if (e.key == "w") spread = 2;

    if (e.key == "a") pathMode = 1;
    if (e.key == "s") pathMode = 2;

    if (e.key == "z") {
        if (lineWidthStart < 100) lineWidthStart++;
    }
    if (e.key == "x") {
        if (lineWidthStart > 1) lineWidthStart--;
    }
});
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function draw() {
    if (active) {
        animatePoints();
        requestAnimationFrame(draw);
    }
}
draw();
// Update mouse positions

function animatePoints() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    let point, lastPoint;

    if (pathMode === 2) {
        context.beginPath();
    }

    for (let i = 0; i < points.length; i++) {
        point = points[i];
        if (points[i - 1] !== undefined) {
            lastPoint = points[i - 1];
        } else {
            lastPoint = points[i];
        }

        point.lifetime += 1;

        if (point.lifetime > duration) {
            points.splice(i, 1);
            continue;
        }

        // Begin drawing stuff!
        let inc = point.lifetime / duration; // 0 to 1 over lineDuration
        let dec = 1 - inc;

        let spreadRate;
        if (spread === 1) {
            spreadRate = lineWidthStart / (point.lifetime * 2);
        } // Lerp Decrease
        if (spread === 2) {
            spreadRate = lineWidthStart * (1 - inc);
        } // Linear Decrease

        context.lineJoin = "round";
        context.lineWidth = spreadRate;
        context.strokeStyle =
            "rgb(255," +
            Math.floor(200 - 255 * dec) +
            "," +
            Math.floor(200 - 255 * inc) +
            ")";

        let distance = pointDistance(lastPoint, point);
        let midpoint = midPoint(lastPoint, point);
        let angle = pointAngle(lastPoint, point);

        if (pathMode === 1) {
            context.beginPath();
        }

        if (mode === 1) {
            context.arc(
                midpoint.x,
                midpoint.y,
                distance / 2,
                angle,
                angle + Math.PI,
                point.flip
            );
        } else if (mode === 2) {
            context.moveTo(lastPoint.x, lastPoint.y);
            context.lineTo(point.x, point.y);
        } else if (mode === 3) {
            context.strokeRect(
                midpoint.x,
                midpoint.y,
                (2 * distance) / 3,
                (2 * distance) / 3
            );
        } else if (mode === 4) {
            context.arc(midpoint.x, midpoint.y, distance / 2, 0, Math.PI * 2);
        } else if (mode === 5) {
            drawStar(midpoint.x, midpoint.y, distance/4, distance / 2, 5);
        }

        if (pathMode === 1) {
            context.stroke();
            context.closePath();
        }
    }

    if (pathMode === 2) {
        context.stroke();
        context.closePath();
    }
}

function addPoint(x, y) {
    flipNext = !flipNext;
    let point = new Point(x, y, 0, flipNext);
    points.push(point);
}

canvas.addEventListener("mousemove", function (e) {
    if (frame === drawEveryFrame) {
        addPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
        frame = 0;
    }
    frame++;
});
canvas.addEventListener("touchmove", (e) => {
    if (frame === drawEveryFrame) {
        addPoint(
            e.changedTouches[0].clientX - this.offsetLeft,
            e.changedTouches[0].clientY - this.offsetTop
        );
        frame = 0;
    }
    frame++;
});

class Point {
    // Define class constructor
    constructor(x, y, lifetime, flip) {
        this.x = x;
        this.y = y;
        this.lifetime = lifetime;
        this.flip = flip;
    }
}
function pointDistance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);
}
function pointAngle(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.atan2(dy, dx);
}
function midPoint(a, b) {
    const mx = a.x + (b.x - a.x) * 0.5;
    const my = a.y + (b.y - a.y) * 0.5;

    return new Point(mx, my);
}

function drawStar(positionX, positionY, innerRadious, outerRadious, spikes) {
    let rotation = (Math.PI / 2) * 3;
    let x = positionX;
    let y = positionY;
    let step = Math.PI / spikes;

    context.beginPath();
    context.moveTo(positionX, positionY - outerRadious);
    for (let i = 0; i < spikes; i++) {
        x = positionX + Math.cos(rotation) * outerRadious;
        y = positionY + Math.sin(rotation) * outerRadious;
        context.lineTo(x, y);
        rotation += step;

        x = positionX + Math.cos(rotation) * innerRadious;
        y = positionY + Math.sin(rotation) * innerRadious;
        context.lineTo(x, y);
        rotation += step;
    }
    context.lineTo(positionX, positionY - outerRadious);
    context.closePath();
}