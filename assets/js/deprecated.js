// (deprecated) function to regulate scale
function regulate(minv, maxv, numscale){
    if(numscale < 1 || maxv < minv){
        return;
    }
    var delta = maxv - minv;
    var exp = Math.floor(Math.log(delta) / Math.log(10)) - 2;
    var multiplier = Math.pow(10, exp);
    var solutions = [1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500];
    var i;
    for(i = 0; i < solutions.length; i++){
        var multical = multiplier * solutions[i];
        if(Math.floor(delta / multical) + 1 <= numscale){
            break;
        }
    }
    var interval = multiplier * solutions[i];
    var startpoint = (Math.ceil(minv / interval) - 1) * interval;
    var scale = new Array()
    var idx;
    for(idx = 0; ; idx++)
    {
        scale.push(startpoint + interval * idx);
        if(startpoint + interval * idx > maxv){
            break;
        }
    }
    return scale;
}

// (deprecated) functions to transform geometric coordinates to svg coordinates 
function gtosx(x){ return width * (x - xmin) / (xmax - xmin); }
function gtosy(y){ return height + (-height) * (y - ymin) / (ymax - ymin); }

// (deprecated) functions to transform svg coordinates to geometric coordinates
function stogx(x){ return xmin + (xmax - xmin) * x / width; }
function stogy(y){ return ymin + (ymax - ymin) * (y - height) / (-height); }

// steepest descent method
function steepest_descent_t7f(x, y){
    var gamma = 2;
    var epsilon = 0.0001;
    var maxiter = 1000;
    var numiter = 1;
    var curx = x, cury = y;
    var f_prev = t7f(curx, cury);
    var traj = new Array();
    traj.push([curx, cury]);
    while (numiter < maxiter) {
        var gradient = t7f_grad(curx, cury);
        var deltax = -gradient[0];
        var deltay = -gradient[1];
        var t = (curx * curx + gamma * gamma * y * y) / (curx * curx + gamma * gamma * gamma * y * y);
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
function newton_t7f(x, y){
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