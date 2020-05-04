// the function in tutorial 7
function t7f(x, y){
    var gamma = 2;
    return 0.5 * (x * x + gamma * y * y);
}

// gradient of the function in tutorial 7
function t7f_grad(x, y){
    var gamma = 2;
    return [x, gamma * y];
}

// Hessian of the function in tutorial 7
function t7f_hessian(x, y){
    var gamma = 2;
    return [[1, 0], [0, gamma]];
}

// quandratic bowl function
function qb(x, y){
    var a = 16, b = 20, c = 1.2, d = 2;
    return x*x+y*y-a*Math.exp(-((x-3)*(x-3)+y*y)/c)-b*Math.exp(-((x+3)*(x+3)+y*y)/d);
}

// gradient of quandratic bowl function 
function qb_grad(x, y){
    var a = 16, b = 20, c = 1.2, d = 2;
    var px = 2*x-a*(-2/c*(x-3))*Math.exp(-((x-3)*(x-3)+y*y)/c)-b*(-2/d*(x+3))*Math.exp(-((x+3)*(x+3)+y*y)/d);
    var py = 2*y-a*(-2/c*y)*Math.exp(-((x-3)*(x-3)+y*y)/c)-b*(-2/d*y)*Math.exp(-((x+3)*(x+3)+y*y)/d);
    return [px, py];
}

// Hessian of quadratic bowl function 
function qb_hessian(x, y){
    var a = 16, b = 20, c = 1.2, d = 2;
    var pxx = 2-a*(-2/c)*Math.exp(-((x-3)*(x-3)+y*y)/c)-a*(-2/c*(x-3))*(-2/c*(x-3))*Math.exp(-((x-3)*(x-3)+y*y)/c)-b*(-2/d)*Math.exp(-((x+3)*(x+3)+y*y)/d)-b*(-2/d*(x+3))*(-2/d*(x+3))*Math.exp(-((x+3)*(x+3)+y*y)/d);
    var pxy = -a*(-2/c*(x-3))*(-2/c*y)*Math.exp(-((x-3)*(x-3)+y*y)/c)-b*(-2/d*(x+3))*(-2/d*y)*Math.exp(-((x+3)*(x+3)+y*y)/d);
    var pyx = -a*(-2/c*(x-3))*(-2/c*y)*Math.exp(-((x-3)*(x-3)+y*y)/c)-b*(-2/d*(x+3))*(-2/d*y)*Math.exp(-((x+3)*(x+3)+y*y)/d);
    var pyy = 2-a*(-2/c)*Math.exp(-((x-3)*(x-3)+y*y)/c)-a*(-2/c*y)*(-2/c*y)*Math.exp(-((x-3)*(x-3)+y*y)/c)-b*(-2/d)*Math.exp(-((x+3)*(x+3)+y*y)/d)-b*(-2/d*y)*(-2/d*y)*Math.exp(-((x+3)*(x+3)+y*y)/d);
    return [[pxx, pxy], [pyx, pyy]];
}

// Himmelblau's function
function Himmelblau(x, y){
    return (x * x + y - 11) * (x * x + y -11) + (x + y * y - 7) * (x + y * y - 7);
}

// gradient of Himmelblau's function
function Himmelblau_grad(x, y){
    var px = 4 * (x * x + y - 11) * x + 2 * (x + y * y - 7);
    var py = 2 * (x * x + y - 11) + 4 * (x + y * y - 7) * y;
    return [px, py]
}

// Hessian of Himmelblau's function
function Himmelblau_hessian(x, y){
    var pxx = 12 * x * x + 4 * y - 42;
    var pxy = 4 * x + 4 * y;
    var pyx = 4 * x + 4 * y;
    var pyy = 12 * y * y + 4 * x - 26;
    return [[pxx, pxy], [pyx, pyy]];
}

// optimization objective function
var f = t7f;
var f_grad = t7f_grad;
var f_hessian = t7f_hessian;

// Steepest descent method
function steepest_descent(x, y){
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
        var t = bt_line_search(curx, cury, deltax, deltay, 0.49, 0.95);
        curx += t * deltax;
        cury += t * deltay;
        traj.push([curx, cury]);
        if(Math.abs(t7f(curx, cury) - f_prev) < epsilon){
            break;
        }
        f_prev = t7f(curx, cury);
        numiter++;
    }
    return traj;
}

// Newton method
function newton(x, y){
    var epsilon = 0.0001;
    var maxiter = 1000;
    var numiter = 1;
    var curx = x, cury = y;
    var traj = new Array(); 
    traj.push([curx, cury]);
    while(numiter < maxiter){
        var H_inv = inverse(f_hessian(curx, cury));
        var g = f_grad(curx, cury);
        var deltax = -H_inv[0][0] * g[0] - H_inv[0][1] * g[1];
        var deltay = -H_inv[1][0] * g[0] - H_inv[1][1] * g[1];
        var t = 0.2;
        var search_times = 99;
        var minf = Infinity;
        var t, deltat = 0.01;
        for (var i = 0, tmp = deltat; i < search_times; i++, tmp += deltat){
            if (f(curx + tmp * deltax, cury + tmp * deltay) < minf){
                minf = f(curx + tmp * deltax, cury + tmp * deltay);
                t = tmp;
            }
        }
        curx += t * deltax;
        cury += t * deltay;
        traj.push([curx, cury]);
        var lambda = (H_inv[0][0] * g[0] * g[0] + (H_inv[0][1] + H_inv[1][0]) * g[0] * g[1] + H_inv[1][1] * g[1] * g[1]) / 2;
        if(lambda <= epsilon){
            break;
        }
        numiter++;
    }
    return traj;
}

// backtracking line search
function bt_line_search(x, y, dx, dy, alpha, beta){
    var t = 1;
    while(f(x, y) - f(x + t * dx, y + t * dy) < alpha * Math.abs(f_grad(x, y)[0] * t * dx + f_grad(x, y)[1] * t * dy)){
        t = beta * t;
    }
    return t;
}

// calculate matrix H's determinant
function det(H){
    return H[0][0] * H[1][1] - H[0][1] * H[1][0];
}

// calculate matrix H's adjugate matrix
function adjugate(H){
    return [[H[1][1], -H[1][0]], [-H[0][1], H[0][0]]];
}

// calculate matrix H's inverse
function inverse(H){
    return [[adjugate(H)[0][0]/det(H), adjugate(H)[0][1]/det(H)], [adjugate(H)[1][0]/det(H), adjugate(H)[1][1]/det(H)]];
}