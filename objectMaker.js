// setting up some basic functions

const canvas = document.getElementById('main');
const ctx = canvas.getContext('2d');

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// matrix object
// just a fancy array lol

class matrix {
    constructor(array, m, n) {
        this.mtx = array;
        this.m = m;
        this.n = n;
    }
}

// vector3 object is a vector in R3
// okay, technically in R4 but it's homogenous :') 
// it allows for translations, okay? hmph 
// (x, y, z, 1)^T, m x n matrix 
// inherited from matrix object

class vector3 extends matrix { 
    constructor(x, y, z) {
        super(new Array(x, y, z, 1), 4, 1); 
    }
}

// vector operations (vector addition & scalar multiplication)
// only column vectors!

function scalarVector(c, vectorA) {
    var newVector = vectorA; 
    if(vectorA.n != 1) {
        for(let i = 0; i < vectorA.m; i++) {
            newVector.mtx[i] = c * vectorA[i];
        }
        return newVector;
    }
    else {
        console.log("This is not a vector!");
        return;
    }
}

function addVector(vectorA, vectorB) {
    if(vectorA.m == vectorB.m && vectorA.n == 1 && vectorB.n == 1) {
        var newVector = new matrix(new Array(vectorA.m), vectorA.m, 1);
        for(let i = 0; i < vectorA.m; i++) {
            newVector.mtx[i] = vectorA.mtx[i] + vectorB.mtx[i];
        }
        return newVector;
    }
    else {
        console.log("Invalid transformation!");
        return;
    }
}

// using matrix multiplication (Av)
// mtx: m x n
// vector: n x 1 

function mtxmult(vectorA, matrixA) {
    // must be valid matrix multiplication
    if(vectorA.m == matrixA.n && vectorA.n == 1) {
        var tempVector = new matrix(new Array(matrixA.m).fill(0), matrixA.m, vectorA.n);
        for(let i = 0; i < matrixA.m; i++) {
            for(let j = 0; j < matrixA.n; j++) {
                tempVector.mtx[i] += vectorA.mtx[j] * matrixA.mtx[j][i];
            }
        }
        return tempVector;
    }
    else {
        console.log("Invalid transformation!");
        return;
    }
}

// points are represented as circles xd 
// all points are projected onto R2 orthogonally 
function drawPoint(v) {
    var vR2 = mtxmult(v, orth_mtx);
    var x0 = vR2.mtx[0];
    var y0 = vR2.mtx[1];
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.arc(x0 , y0, 5, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.closePath();
}

function drawTriangle(dim, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(dim[0].mtx[0], dim[0].mtx[1]);
    ctx.lineTo(dim[1].mtx[0], dim[1].mtx[1]);
    ctx.lineTo(dim[2].mtx[0], dim[2].mtx[1]);
    ctx.lineTo(dim[0].mtx[0], dim[0].mtx[1]);
    ctx.stroke();
    ctx.closePath();
}

// draws the cartesian plane of projection
// (x, y) - point of origin
function drawPlane(x, y) {
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    ctx.closePath();
}

// transformation matrix - R3 => R2, orthogonol view
// 45 degree rotations to debug 
const theta = Math.PI / 100;
const orth_mtx = new matrix([[1, 0], [0, 1], [0, 0], [0, 0]], 2, 4);
const rotX_mtx = new matrix([[1, 0, 0, 0], [0, Math.cos(theta), Math.sin(theta), 0], [0, -1 * Math.sin(theta), Math.cos(theta), 0], [0, 0, 0, 1]], 4, 4);
const rotY_mtx = new matrix([[Math.cos(theta), 0, -1 * Math.sin(theta), 0], [0, 1, 0, 0], [Math.sin(theta), 0, Math.cos(theta), 0], [0, 0, 0, 1]], 4, 4);
const rotZ_mtx = new matrix([[Math.cos(theta), Math.sin(theta), 0, 0], [-1 * Math.sin(theta), Math.cos(theta), 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], 4, 4);
var bool_X = false;
var bool_Y = false;
var bool_Z = false;
var rotX = (b, i, j) => { if(b) tri_list[i][j] = mtxmult(tri_list[i][j], rotX_mtx); };
var rotY = (b, i, j) => { if(b) tri_list[i][j] = mtxmult(tri_list[i][j], rotY_mtx); };
var rotZ = (b, i, j) => { if(b) tri_list[i][j] = mtxmult(tri_list[i][j], rotZ_mtx); };
var inputRotX = document.getElementById("rotX");
var inputRotY = document.getElementById("rotY");
var inputRotZ = document.getElementById("rotZ");
inputRotX.addEventListener('change', (e) => bool_X = !bool_X);
inputRotY.addEventListener('change', (e) => bool_Y = !bool_Y);
inputRotZ.addEventListener('change', (e) => bool_Z = !bool_Z);

// default triangle
// assumes origin is (0, 0, 0)
const x0 = 100;
const y0 = 100;
const z0 = 50;
const length = 50;
const og1 = new vector3(x0, y0, z0);
const og2 = new vector3(x0 + length, y0, z0 + length);
const og3 = new vector3(x0 + length, y0 + length, z0);
const og4 = new vector3(x0, y0 + length, z0 + length);

// probably really redudant but ill fix it later lmao
var v1 = og1;
var v2 = og2;
var v3 = og3;
var v4 = og4;

var tri = [v1, v2, v3];
var tri2 = [v1, v2, v4];
var tri3 = [v2, v3, v4];
var tri4 = [v2, v1, v4];

let tri_list = [tri, tri2, tri3, tri4];

// direction of "camera" should be a normal vector on 3d space
const norm_camera = new vector3(0, 0, 1);

// transforming coordinate system to conform to origin
// only R2 translations :') 
let originX = 250;
let originY = 150;
let originZ = 0; // orthogonal perspective so Z doesn't really matter lol 
var transform_mtx = new matrix([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [originX, originY, originZ, 1]], 4, 4);
var a_transform_mtx = new matrix([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [-1 * originX, -1 * originY, -1 * originZ, 1]], 4, 4);

var out = document.getElementById("outputOri");
var inputX = document.getElementById("x");
var inputY = document.getElementById("y");
var inputZ = document.getElementById("z");
var inputApply = document.getElementById("apply");
inputX.addEventListener('input', (e) => originX = e.target.value);
inputY.addEventListener('input', (e) => originY = e.target.value);
inputZ.addEventListener('input', (e) => originZ = e.target.value);
inputApply.addEventListener('click', (e) => { 
    tri_list[0] = [og1, og2, og3];
    tri_list[1] = [og1, og2, og4];
    tri_list[2] = [og2, og3, og4];
    tri_list[3] = [og2, og1, og4];
    transform_mtx = new matrix([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [originX, originY, originZ, 1]], 4, 4);
    a_transform_mtx = new matrix([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [-1 * originX, -1 * originY, -1 * originZ, 1]], 4, 4);
});


/*
    MAIN LOOPING ANIMATION
    THERE IS CODE TO REGULATE FPS IF ONE SO DESIRES
    SHOULD OPTIMIZE PERFORMANCE AS WELL!
*/

// beginning of loop (controlling fps)
var fpsInterval, startTime, then;
function startLoop(fps) {
    // converting fps to ms / frame
    // note: dates are in terms of ms so we need this interval 
    fpsInterval = 1000 / fps;
    // getting initial time
    then = Date.now();
    startTime = then;
    loop();
}

// main loop body (initiating animations)
var frameCount = 0; 
var elapsed, now;

function loop() {
    // recursion nonsense
    requestAnimationFrame(loop);

    // finding time that has elapsed
    now = Date.now();
    elapsed = now - then;

    // only do something if elapsed just so happens to 
    // coincide with max fps interval :) 
    if(elapsed > fpsInterval) {
        // calculating fps
        then = now - (elapsed % fpsInterval);
        var sinceStart = now - startTime;
        var currentFPS = Math.round(1000 / (sinceStart / ++frameCount) * 100) / 100;

        clear();
        drawPlane(originX, originY);
        for(let i = 0; i < tri_list.length; i++) {
            for(let j = 0; j < 3; j++) {
                tri_list[i][j] = mtxmult(tri_list[i][j], a_transform_mtx);
                rotX(bool_X, i, j);
                rotY(bool_Y, i, j);
                rotZ(bool_Z, i, j);
                tri_list[i][j] = mtxmult(tri_list[i][j], transform_mtx);
            }
            if(i == 0)
                drawTriangle(tri_list[i], 'white');
            if(i == 1)
                drawTriangle(tri_list[i], 'blue');
            if(i == 2)
                drawTriangle(tri_list[i], 'red');
            if(i == 3)
                drawTriangle(tri_list[i], 'green');
        }
        out.textContent = `(${originX}, ${originY}, ${originZ})`;
    }
}

// Goal: 
// implement keyboard events where:
// W = move direction that is being faced
// S = move direction opposite of what is being faced
// A = move direction to the left of faced
// D = move direction to the right of faced 


// VERY IMPORANT: 
// begins the loop!!!
startLoop(60);