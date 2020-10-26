class Physics {
    interval;
    performing;

    PRECISION = 7;

    FORCE_THRESHOLD = 10; // 0.5 by default
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

                let dist = this.calculateDistance(body.x, body.y, bodies[i].x, bodies[i].y);

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
                let rSum = bodies[i].radius + bodies[j].radius;
                let dist = this.calculateDistance(bodies[i].x, bodies[i].y, bodies[j].x, bodies[j].y);
                if (Math.floor(dist) < rSum) {
                    let m1 = bodies[i].mass;
                    let m2 = bodies[j].mass;
                    let m3 = m1 + m2;
                    
                    if (bodies[i].mass > bodies[j].mass) {
                        bodies[i].mass = m3;
                        bodies[i].radius = Math.max(bodies[i].radius, bodies[j].radius);
                        bodies[i].xSpeed = (m1 * bodies[i].xSpeed + m2 * bodies[j].xSpeed) / m3;
                        bodies[i].ySpeed = (m1 * bodies[i].ySpeed + m2 * bodies[j].ySpeed) / m3;
                    }
                    else {
                        bodies[j].mass = m3;
                        bodies[j].radius = Math.max(bodies[i].radius, bodies[j].radius);
                        bodies[j].xSpeed = (m1 * bodies[i].xSpeed + m2 * bodies[j].xSpeed) / m3;
                        bodies[j].ySpeed = (m1 * bodies[i].ySpeed + m2 * bodies[j].ySpeed) / m3;
                        
                        let temp = bodies[i];
                        bodies[i] = bodies[j];
                        bodies[j] = temp;
                    }
                    bodies.splice(j, 1);
                }
                else {
                    j++;
                }
            }
            i++;
        }
    }
    
    calculateDistance(x1, y1, x2, y2) {
        let xDiff = x1 - x2;
        let yDiff = y1 - y2;
        return +Math.sqrt(xDiff * xDiff + yDiff * yDiff).toFixed(this.PRECISION);
    }

    getClosestBody(x, y) {
        if (bodies.length == 0) {
            return null;
        }

        let minDistSquare = 1e20;
        let closestBody = null;
        for (let i = 0; i < bodies.length; i++) {
            let xDist = x - bodies[i].x;
            let yDist = y - bodies[i].y;
            let distSquare = xDist * xDist + yDist * yDist;
            if (distSquare < minDistSquare && !(x == bodies[i].x && y == bodies[i].y)) {
                minDistSquare = distSquare;
                closestBody = bodies[i];
            }
        }

        return closestBody;
    }

    calculateOrbitalSpeed(body, dist) {
        return Math.sqrt(this.FORCE_COEFFICIENT * body.mass / dist);
    }

    calculateSpawnSpeed(x1, y1, x2, y2) {
        let dist = this.calculateDistance(x1, y1, x2, y2);

        let speed = dist * dist / (1000);

        return speed;
    }

    calculateRadius(mass) {
        let mult = 149.5 / (1e9 - 1);
        return mass * mult + 0.5 - mult;
    }
}