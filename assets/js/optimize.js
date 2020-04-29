// quandratic bowl function
function quad_bowl(x, y){
    var a = 3, b = 5, c = 0.1, d = 0.4;
    return x * x + y * y - a * Math.exp(-((x - 1) * (x - 1) + y * y) / c) - b * Math.exp(-((x + 1) * (x + 1) + y * y) / d);
    return Math.sqrt(x * x + y * y);
}

// gradient of quandratic bowl function 
function quad_bowl_grad(x, y){
    var a = 3, b = 5, c = 0.1, d = 0.4;
    var px = 2 * x - a * (-2 / c * (x - 1)) * Math.exp(-((x - 1) * (x - 1) + y * y) / c) - b * (-2 / d * (x + 1)) * Math.exp(-((x + 1) * (x + 1) + y * y) / d);
    var py = 2 * y - a * (-2 / c * y) * Math.exp(-((x - 1) * (x - 1) + y * y) / c) - b * (-2 / d * y) * Math.exp(-((x + 1) * (x + 1) + y * y) / d);
    return [px, py];
}

// the function in tutorial 7
function t7f(x, y){
    var gamma = 2;
    return 0.5 * (x * x + 2 * y * y);
}

// gradient of the function in tutorial 7
function t7f_grad(x, y){
    var gamma = 2;
    return [x, gamma * y];
}

// optimization objective function
var f = t7f;
var f_grad = t7f_grad;

// steepest descent method
function steepest_descent(x, y){
    var gamma = 2;
    var epsilon = 0.0001;
    var maxiter = 1000;
    var numiter = 1;
    var curx = x, cury = y;
    var f_prev = f(curx, cury);
    var traj = new Array();
    traj.push([curx, cury]);
    while (numiter < maxiter) {
        var gradient = f_grad(curx, cury);
        var deltax = -gradient[0];
        var deltay = -gradient[1];
        var t = (curx * curx + gamma * gamma * y * y) / (curx * curx + gamma * gamma * gamma * y * y);
        curx += t * deltax;
        cury += t * deltay;
        traj.push([curx, cury]);
        if(Math.abs(f(curx, cury) - f_prev) < epsilon){
            break;
        }
        f_prev = f(curx, cury);
        numiter++;
    }
    return traj;
}

// Newton method
function newton(x, y){
    var gamma = 2;
    var epsilon = 0.0001;
    var maxiter = 1000;
    var numiter = 1;
    var curx = x, cury = y;
    var traj = new Array();
    traj.push([curx, cury]);
    while(numiter < maxiter){
        var deltax = -curx;
        var deltay = -gamma * gamma * cury;
        var t = 0.1;
        curx += t * deltax;
        cury += t * deltay;
        traj.push([curx, cury]);
        if(curx * curx + gamma * gamma * gamma * cury * cury <= epsilon){
            break;
        }
        numiter++;
    }
    return traj;
}