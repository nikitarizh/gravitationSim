var canv;
var ctx;

var bodies = [];
var forces = [];

const u = 3;
const FIELD_WIDTH = 600;
const FIELD_HEIGHT = 300;

const FPS = 30;

const Notification = new NotificationsHelper();

const drawStatus = document.getElementById('drawStatus');
const physicsStatus = document.getElementById('physicsStatus');
const debugStatus = document.getElementById('drawDebug');
const trajectoriesStatus = document.getElementById('drawTrajectories');

const COLOR_GREEN = '#03fc73';
const COLOR_RED = '#bd1300';
const COLOR_YELLOW = '#eaff00';

function main() {
    init();

    const Drawer = new Draw();
    Drawer.start();

    const Physician = new Physics();
    Physician.start();

    initButtons(Drawer, Physician);
    initClickEvent(Drawer);


    // bodies.push(new Body(100, 0.1, 7.5, 5));
    // bodies.push(new Body(100, 0.2, 15, 15.5));
    // bodies.push(new Body(200, 0.3, 35, 10));

    // bodies.push(new Body(500, 0.3, 40, 25));
    // bodies.push(new Body(500, 0.3, 20, 25));
    // bodies.push(new Body(1000, 0.3, 30, 20));

    // bodies.push(new Body(1e6, 3, 100, 100));
    // bodies.push(new Body(1e6, 3, 150, 150));
    // bodies.push(new Body(1e6, 3, 100, 150));
    // bodies.push(new Body(1e6, 3, 150, 100));

    // bodies.push(new Body(1e1, 3, 100, 200));
    // bodies.push(new Body(1e1, 3, 200, 200));
    // bodies.push(new Body(1e1, 3, 150, 120));
    // bodies.push(new Body(1e9, 5, 300, 160));

    // for (let i = 0; i < 5; i++) {
    //     let mass = Math.random() * 500;
    //     let radius = Math.random();
    //     let x = Math.trunc(Math.random() * FIELD_WIDTH);
    //     let y = Math.trunc(Math.random() * FIELD_HEIGHT);

    //     bodies.push(new Body(mass, radius, x, y));
    // }
}


function init() {
    canv = document.getElementById('canv');
    ctx = canv.getContext('2d');

    this.canv.width = FIELD_WIDTH * u;
    this.canv.height = FIELD_HEIGHT * u;
}

function initButtons(Drawer, Physician) {
    debugStatus.style.color = Drawer.drawDebug ? COLOR_GREEN : COLOR_RED;
    trajectoriesStatus.style.color = Drawer.drawTrajectories ? COLOR_GREEN : COLOR_RED;

    let startButton = document.getElementById('start');
    let stopButton = document.getElementById('stop');
    let clearButton = document.getElementById('clear');

    startButton.addEventListener('click', function() {
        Drawer.start();
        Physician.start();
    });

    stopButton.addEventListener('click', function() {
        Drawer.stop();
        Physician.stop();
    });

    clearButton.addEventListener('click', function() {
        bodies = [];
        Notification.new('OK', 'Field cleared')
    });

    drawStatus.addEventListener('click', function() {
        if (Drawer.drawing) {
            Drawer.stop();
        }
        else {
            Drawer.start();
        }
    });

    physicsStatus.addEventListener('click', function() {
        if (Physician.performing) {
            Physician.stop();
        }
        else {
            Physician.start();
        }
    });

    debugStatus.addEventListener('click', function() {
        Drawer.toggleDebugDrawing();
    });

    trajectoriesStatus.addEventListener('click', function() {
        Drawer.toggleTrajectoriesDrawing();
    });
}

function initClickEvent(Drawer) {
    let x1 = -1, y1 = -1;
    let x2 = -1, y2 = -1;
    let mousedown = false;
    canv.addEventListener('mousedown', function(e) {

        if (mousedown == false) {
            x1 = e.offsetX / u;
            y1 = e.offsetY / u;
            x2 = e.offsetX / u;
            y2 = e.offsetY / u;
        }

        mousedown = true;
    });

    canv.addEventListener('mouseup', function(e) {
        let mass = document.getElementById('mass').value;
        let radius = document.getElementById('radius').value;

        if (!mass || mass < 0 || isNaN(+mass)) {
            Notification.new('ERROR', 'Enter correct mass');
            return;
        }
        if (!radius || radius < 0 || isNaN(+radius)) {
            Notification.new('ERROR', 'Enter correct radius');
            return;
        }

        //calculating distance and speed
        let xDist = x1 - x2;
        let yDist = y1 - y2;
        let dist = xDist * xDist + yDist * yDist;

        let speed = dist / (1000);

        let angle = Math.atan2(x2 - x1, y2 - y1) - Math.PI / 2;

        let xSpeed = speed * Math.cos(angle);
        
        let ySpeed = -speed * Math.sin(angle);


        if (isNaN(xSpeed)) {
            xSpeed = 0;
        }
        if (isNaN(ySpeed)) {
            ySpeed = 0;
        }

        bodies.push( { mass: +mass, radius: +radius, x: x1, y: y1, xSpeed, ySpeed } );

        x1 = -1;
        y1 = -1;
        x2 = -1;
        y2 = -1;
        mousedown = false;
    });

    canv.addEventListener('mousemove', function(e) {
        if (mousedown) {
            x2 = e.offsetX / u;
            y2 = e.offsetY / u;
        }
    });
    
    setInterval(function() {
        if (mousedown) {
            Drawer.drawLine(x1, y1, x2, y2, '#fff', 1);
        }
    }, 1000 / FPS);

}