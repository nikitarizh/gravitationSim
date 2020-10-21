class Draw {
    interval;
    drawing;

    drawDebug = false;
    drawTrajectories = false;

    BKG_COLOR = '#000000';

    BODY_MIN_R = 1;
    BODY_MAX_R = 4;

    DEBUG_FONT_SIZE = 4 * u;

    start() {
        if (!this.drawing) {
            this.drawing = true;
            this.interval = setInterval(function(t) {
                t.drawFrame();
            }, 1000 / FPS, this);

            Notification.new('OK', 'Drawing started');
            drawStatus.style.color = COLOR_GREEN;
        }
    }

    stop() {
        if (this.drawing) {
            clearInterval(this.interval);
            this.drawing = false;

            Notification.new('OK', 'Drawing stopped');
            drawStatus.style.color = COLOR_RED;
        }
    }

    toggleDebugDrawing() {
        if (this.drawDebug) {
            this.drawDebug = false;
            Notification.new('OK', 'Disabled drawing debug');
            debugStatus.style.color = COLOR_RED;
        }
        else {
            this.drawDebug = true;
            Notification.new('OK', 'Enabled drawing debug');
            debugStatus.style.color = COLOR_GREEN;
        }
    }

    toggleTrajectoriesDrawing() {
        if (this.drawTrajectories) {
            this.drawTrajectories = false;
            Notification.new('OK', 'Disabled drawing trajectories');
            trajectoriesStatus.style.color = COLOR_RED;
        }
        else {
            this.drawTrajectories = true;
            Notification.new('OK', 'Enabled drawing trajectories');
            trajectoriesStatus.style.color = COLOR_GREEN;
        }
    }

    drawFrame() {
        ctx.clearRect(0, 0, FIELD_WIDTH * u, FIELD_HEIGHT * u);
        // bkg
        this.drawRectangle(0, 0, FIELD_WIDTH, FIELD_HEIGHT, this.BKG_COLOR);

        // drawing bodies and characteristics
        for (let i = 0; i < bodies.length; i++) {
            this.drawCircle(bodies[i].x, bodies[i].y, bodies[i].radius, 'rgb(100, 100, 255)');

            if (this.drawDebug) {
                this.drawDebugInfo(bodies[i]);
            }
            
            if(this.drawTrajectories) {
                this.drawTrajectory(bodies[i]);
            }
        }

    }

    drawDebugInfo(body) {
        this.drawText('mass: ' + body.mass, body.x - body.radius, body.y - body.radius - 5 * this.DEBUG_FONT_SIZE / u, 'green');
        this.drawText('xSpeed: ' + body.xSpeed, body.x - body.radius, body.y - body.radius - 4 * this.DEBUG_FONT_SIZE / u, 'green');
        this.drawText('ySpeed: ' + body.ySpeed, body.x - body.radius, body.y - body.radius - 3 * this.DEBUG_FONT_SIZE / u, 'green');
        this.drawText('xVelocity: ' + body.xVelocity, body.x - body.radius, body.y - body.radius - 2 * this.DEBUG_FONT_SIZE / u, 'green');
        this.drawText('yVelocity: ' + body.yVelocity, body.x - body.radius, body.y - body.radius - this.DEBUG_FONT_SIZE / u, 'green');
    }

    drawTrajectory(body) {
        let x2 = body.x + body.xSpeed * 10;
        let y2 = body.y + body.ySpeed * 10;
        this.drawLine(body.x, body.y, x2, y2, 'white');
    }

    drawLine(x1, y1, x2, y2, color, width = 1) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1 * u, y1 * u);
        ctx.lineTo(x2 * u, y2 * u);
        ctx.lineWidth = width;
        ctx.stroke();
    }

    drawRectangle(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * u, y * u, w * u, h * u);
    }

    drawCircle(x, y, r, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x * u, y * u, r * u, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }

    drawText(text, x, y, color) {
        ctx.font = this.DEBUG_FONT_SIZE + "px Arial";
        ctx.fillStyle = color;
        ctx.fillText(text, x * u, y * u);
    }
}