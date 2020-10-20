class Physics {
    interval;
    performing;

    PRECISION = 10;

    FORCE_THRESHOLD = 100; // 0.5 by default
    FORCE_COEFFICIENT = 5e-6; // 5e-8 by default
    SPEED_THRESHOLD = 20; // 5 by default
    SLOWING_COEFF = 0.000; // 0.0000 by default

    start() {
        if (!this.performing) {
            this.performing = true;
            this.interval = setInterval(function(t) {
                t.processFrame();
            }, 1000 / FPS, this);

            Notification.new('OK', 'Physician started');
            physicsStatus.style.color = COLOR_GREEN;
        }
    }

    stop() {
        if (this.performing) {
            clearInterval(this.interval);
            this.performing = false;

            Notification.new('OK', 'Physician stopped');
            physicsStatus.style.color = COLOR_RED;
        }
    }

    processFrame() {
        for (let i = 0; i < bodies.length; i++) {
            this.calculateForce(bodies[i]);
        }

        this.calculateResistance();

        this.moveBodies();

        this.checkCollisions();
    }

    calculateForce(body) {
        let xVelocity = 0;
        let yVelocity = 0;
        for (let i = 0; i < bodies.length; i++) {
            if (body != bodies[i]) {
                let yDiff = Math.abs(body.y - bodies[i].y);
                let xDiff = Math.abs(body.x - bodies[i].x);

                let dist = +Math.sqrt(xDiff * xDiff + yDiff * yDiff).toFixed(this.PRECISION);

                if (dist < body.radius + bodies[i].radius) {
                    dist = body.radius + bodies[i].radius;
                }

                let force = this.FORCE_COEFFICIENT * bodies[i].mass / (dist * dist);
                force = +force.toFixed(this.PRECISION);

                if (force > this.FORCE_THRESHOLD) {
                    force = this.FORCE_THRESHOLD;
                }

                if (body.x >= bodies[i].x) {
                    xVelocity -= force * Math.cos(Math.atan(yDiff / xDiff));
                } 
                else {
                    xVelocity += force * Math.cos(Math.atan(yDiff / xDiff));
                }

                if (body.y >= bodies[i].y) {
                    yVelocity -= force * Math.sin(Math.atan(yDiff / xDiff));
                } 
                else {
                    yVelocity += force * Math.sin(Math.atan(yDiff / xDiff));
                }
            }
        }

        xVelocity = +xVelocity.toFixed(this.PRECISION);
        yVelocity = +yVelocity.toFixed(this.PRECISION);

        body.xVelocity = xVelocity;
        body.yVelocity = yVelocity;
    }

    calculateResistance() {
        for (let i = 0; i < bodies.length; i++) {
            bodies[i].xVelocity = this.moveToZero(bodies[i].xVelocity);
            bodies[i].yVelocity = this.moveToZero(bodies[i].yVelocity);
        }
    }

    moveToZero(a) {

        if (a < 0) {
            if (a + this.SLOWING_COEFF < 0) {
                a += this.SLOWING_COEFF;
            }
            else {
                a = 0;
            }
        } 
        else if (a > 0) {
            if (a - this.SLOWING_COEFF > 0) {
                a -= this.SLOWING_COEFF;
            }
            else {
                a = 0;
            }
        }

        return a;
    }

    moveBodies() {
        for (let i = 0; i < bodies.length; i++) {
            bodies[i].xSpeed += bodies[i].xVelocity;
            bodies[i].ySpeed += bodies[i].yVelocity;

            bodies[i].xSpeed = +bodies[i].xSpeed.toFixed(this.PRECISION);
            bodies[i].ySpeed = +bodies[i].ySpeed.toFixed(this.PRECISION);

            let speed = Math.sqrt(bodies[i].xSpeed * bodies[i].xSpeed + bodies[i].ySpeed * bodies[i].ySpeed);
            if (Math.abs(speed) > this.SPEED_THRESHOLD) {
                let rel = Math.abs(speed / this.SPEED_THRESHOLD);
                bodies[i].xSpeed /= rel;
                bodies[i].ySpeed /= rel;
            }

            bodies[i].x += bodies[i].xSpeed;
            bodies[i].y += bodies[i].ySpeed;
        }
    }

    checkCollisions() {
        let i = 0;
        let j = 1;
        while (i < bodies.length - 1) {
            j = i + 1;
            while (j < bodies.length) {
                if (Math.abs(bodies[i].x - bodies[j].x) <= (bodies[i].radius + bodies[j].radius) 
                    && Math.abs(bodies[i].y - bodies[j].y) <= (bodies[i].radius + bodies[j].radius)) {
                    let m1 = bodies[i].mass;
                    let m2 = bodies[j].mass;
                    let m3 = m1 + m2;

                    bodies[i].mass = m3;
                    bodies[i].radius = Math.max(bodies[i].radius, bodies[j].radius);
                    console.log('m1: ' + m1);
                    console.log('m2: ' + m2);
                    console.log('m3: ' + m3);
                    console.log('xs1: ' + bodies[i].xSpeed);
                    console.log('ys1: ' + bodies[i].ySpeed);
                    console.log('xs2: ' + bodies[j].xSpeed);
                    console.log('ys2: ' + bodies[j].ySpeed);
                    bodies[i].xSpeed = (m1 * bodies[i].xSpeed + m2 * bodies[j].xSpeed) / m3;
                    bodies[i].ySpeed = (m1 * bodies[i].ySpeed + m2 * bodies[j].ySpeed) / m3;


                    bodies.splice(j, 1);
                }
                else {
                    j++;
                }
            }
            i++;
        }
    }
}