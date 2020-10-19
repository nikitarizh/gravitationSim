class Body {
    mass;
    radius;
    x;
    y;
    xSpeed;
    ySpeed;
    xVelocity;
    yVelocity;

    constructor(mass, radius, x, y, xs = 0, ys = 0, xv = 0, yv = 0) {
        this.mass = mass;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.xSpeed = xs;
        this.ySpeed = ys;
        this.xVelocity = xv;
        this.yVelocity = yv;
    }
}