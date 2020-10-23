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
    initClickEvent(Drawer, Physician);


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
    // bodies.push(new Body(1e8, 20, 150, 100));

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

    document.addEventListener('keydown', function(e) {
        if (e.code == 'Space') {
            e.preventDefault();
            if (!Physician.performing) {
                Physician.start();
            }
            else {
                Physician.stop();
            }
        }
        else if (e.code == 'KeyD') {
            Drawer.toggleDebugDrawing();
        }
        else if (e.code == 'KeyT') {
            Drawer.toggleTrajectoriesDrawing();
        }
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

function initClickEvent(Drawer, Physician) {
    let x1 = -1, y1 = -1;
    let x2 = -1, y2 = -1;
    let mousedown = false;
    canv.addEventListener('mousedown', function(e) {

        if (e.button != 0) {
            return;
        }

        if (mousedown == false) {
            x1 = e.offsetX / u;
            y1 = e.offsetY / u;
            x2 = e.offsetX / u;
            y2 = e.offsetY / u;

            let closestBody = Physician.getClosestBody(x1, y1);
            
            if (closestBody != null) {
                let radius = +document.getElementById('radius').value;
                let dist = Physician.calculateDistance(x1, y1, closestBody.x, closestBody.y);
                let orbitalSpeed = Physician.calculateOrbitalSpeed(closestBody, dist);
                Notification.new('OK', 'Orbital speed for closest body: ' + orbitalSpeed);
                
                console.log(radius + closestBody.radius);
                console.log(dist);
                if (dist <= radius + closestBody.radius) {
                    Notification.new('WARNING', 'WARNING: new body will collide with closest body');
                }
            }
        }

        mousedown = true;
    });

    canv.addEventListener('mouseup', function(e) {

        if (!mousedown) {
            return;
        }

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
        let speed = Physician.calculateSpawnSpeed(x1, y1, x2, y2);

        let angle = Math.atan2(x2 - x1, y2 - y1) - Math.PI / 2;

        let xSpeed = speed * Math.cos(angle);
        
        let ySpeed = -speed * Math.sin(angle);

        if (isNaN(xSpeed)) {
            xSpeed = 0;
        }
        if (isNaN(ySpeed)) {
            ySpeed = 0;
        }

        bodies.push(new Body(+mass, +radius, x1, y1, xSpeed, ySpeed));

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
            Drawer.drawText('speed: ' + Physician.calculateSpawnSpeed(x1, y1, x2, y2), x1, y1, COLOR_YELLOW);
        }
    }, 1000 / FPS);

    canv.addEventListener('contextmenu', function(e) {
        if (bodies.length == 0) {
            return;
        }
        e.preventDefault();
        x1 = e.offsetX / u;
        y1 = e.offsetY / u;
        let mass = +document.getElementById('mass').value;
        let radius = +document.getElementById('radius').value;

        if (!mass || mass < 0 || isNaN(+mass)) {
            Notification.new('ERROR', 'Enter correct mass');
            return;
        }
        if (!radius || radius < 0 || isNaN(+radius)) {
            Notification.new('ERROR', 'Enter correct radius');
            return;
        }

        let closestBody = Physician.getClosestBody(x1, y1);
        x1 = closestBody.x;
        let dist = Physician.calculateDistance(x1, y1, closestBody.x, closestBody.y);
        let speed = Physician.calculateOrbitalSpeed(closestBody, dist);

        let xSpeed = speed;
        let ySpeed = 0;

        bodies.push(new Body(mass, radius, closestBody.x, y1, xSpeed, ySpeed));
    });
}