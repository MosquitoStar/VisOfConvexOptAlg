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

// function to visualize and optimize
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
    // return [curx, cury];
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
    // return [curx, cury];
    return traj;
}

// svg element
var s = d3.select("#canvas-body")
            .append("svg");

// size of svg image
const width = 600, height = 400;
const margin = {top: 30, right: 30, bottom: 30, left: 30};

// range of (x, y)
var xmin = -3, xmax = 3;
var ymin = -2, ymax = 2;

// svg element group
var gs = s.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

// graph element group
var g = gs.append("g");

// heatmap segmentation parameter
var d = 100;
var xd = width>height? d : Math.round(d * width / height);
var yd = width>height? Math.round(d * height / width) : d;
var dx = (xmax - xmin) / xd, dy = (ymax - ymin) / yd;
var dw = width / xd, dh = height / yd;

// data (stored in row-major order)
var data = new Array();
var mindata = Infinity, maxdata = -Infinity;
for(var i = 0; i < xd; i++){
    data[i] = new Array();
    for(var j = 0; j < yd; j++){
        var x = xmin + dx * i;
        var y = ymin + dy * j;
        data[i][j] = f(x, y);
        mindata = Math.min(mindata, data[i][j]);
        maxdata = Math.max(maxdata, data[i][j]);
    }
}

// flatten data
var dataf = new Array(xd * yd);
for(var i = 0; i < xd; i++){
    for(var j = 0; j < yd; j++){
        dataf[i * yd + j] = data[i][j];
    }
}

// heatmap function
function palette_color(v, minv, maxv){
    var palette = [
        [35, 35, 220],
        [55, 200, 55],
        [200, 200, 55],
        [200, 55, 55],
    ];
    var r, g, b;
    var valueweight = (v - minv) / (maxv - minv);
    for(var i = 0; i < palette.length - 1; i++){
        if(valueweight >= i / (palette.length - 1) && valueweight <= (i + 1) / (palette.length - 1)){
            r = palette[i][0] + (palette[i + 1][0] - palette[i][0]) * (valueweight - i / (palette.length - 1)) * (palette.length - 1);
            g = palette[i][1] + (palette[i + 1][1] - palette[i][1]) * (valueweight - i / (palette.length - 1)) * (palette.length - 1);
            b = palette[i][2] + (palette[i + 1][2] - palette[i][2]) * (valueweight - i / (palette.length - 1)) * (palette.length - 1);
        }
    } 
    return {red: r, green: g, blue: b};
}

// set height and width 
s.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

// draw heatmap
g.selectAll()
    .data(dataf)
    .enter()
    .append("rect")
    .attr("x", function(d, k){
        var i = Math.floor(k / yd);
        return i * dw;
    })
    .attr("y", function(d, k){
        var j = k % yd;
        return height - (j + 1) * dh;
    })
    .attr("width", function(d, k){ return dw; })
    .attr("height", function(d, k){ return dh; })
    .attr("fill", function(d, k){ 
        var c = palette_color(d, mindata, maxdata);
        return "rgb(" + c.red + "," + c.green + "," + c.blue + ")"; 
    })
    .on("mouseover", function(d, k){
        fvalue = d;
        var i = Math.floor(k / yd);
        var j = k % yd;
        d3.select("#curx")
            .text((xmin + i * dx).toFixed(6).toString());
        d3.select("#cury")
            .text((ymin + j * dy).toFixed(6).toString());
        d3.select("#curf")
            .text(d.toFixed(6).toString());
    });

// (deprecated) functions to transform geometric coordinates to svg coordinates 
function gtosx(x){ return width * (x - xmin) / (xmax - xmin); }
function gtosy(y){ return height + (-height) * (y - ymin) / (ymax - ymin); }

// (deprecated) functions to transform svg coordinates to geometric coordinates
function stogx(x){ return xmin + (xmax - xmin) * x / width; }
function stogy(y){ return ymin + (ymax - ymin) * (y - height) / (-height); }

// scale from geometric coordinates to svg coordinates
var gtosx = d3.scaleLinear().domain([xmin, xmax]).range([0, width]);
var gtosy = d3.scaleLinear().domain([ymin, ymax]).range([height, 0]);

// scale from svg coordinates to geometric coordinates
var stogx = d3.scaleLinear().domain([0, width]).range([xmin, xmax]);
var stogy = d3.scaleLinear().domain([height, 0]).range([ymin, ymax]);

// draw x axis and y axis
var xaxis = d3.axisBottom(gtosx).ticks(5);
gs.append("g")
    .attr("id", "axis-x")
    .attr("transform", "translate(0," + height + ")")
    .call(xaxis);
var yaxis = d3.axisLeft(gtosy).ticks(5);
gs.append("g")
    .attr("id", "axis-y")
    .attr("transform", "translate(0,0)")
    .call(yaxis);

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

// set onclick function
g.on("click", function(){
    console.log(d3.mouse(this));
    var clickpos = d3.mouse(this);
    var clickx = stogx(clickpos[0]);
    var clicky = stogy(clickpos[1]);
    console.log(clickx, clicky);

    var timer = new Date();
    var start, end;

    start = timer.getTime();
    var traj1 = steepest_descent(clickx, clicky);
    end = timer.getTime();
    var runtime_steepest = start - end;

    start = timer.getTime();
    var traj2 = newton(clickx, clicky);
    end = timer.getTime();
    var runtime_newton = start - end;
    console.log(runtime_newton, runtime_steepest);

    console.log("steepest");
    console.log(traj1);
    console.log("newton");
    console.log(traj2);
    
    // clean former paths
    s.selectAll("path").remove();

    // line generator function
    var linefunc = d3.line()
                    .x(function(d){ return gtosx(d[0]); })
                    .y(function(d){ return gtosy(d[1]); })
                    .curve(d3.curveLinear);
    
    // draw steepest descent optimization path
    draw_path(traj1, traj1.length * 100, "black", 2);
    
    // draw Newton method optimization path
    draw_path(traj2, traj2.length * 40, "white", 2);

    // re-draw axis
    gs.selectAll("#axis-x").remove();
    gs.selectAll("#axis-y").remove();
    var xaxis = d3.axisBottom(gtosx).ticks(5);
    gs.append("g")
        .attr("id", "axis-x")
        .attr("transform", "translate(0," + height + ")")
        .call(xaxis);
    var yaxis = d3.axisLeft(gtosy).ticks(5);
    gs.append("g")
        .attr("id", "axis-y")
        .attr("transform", "translate(0,0)")
        .call(yaxis);

    console.log("draw finish");
})

function draw_path(traj, duration, color, stroke_width){
    var transition = d3.transition()
                        .duration(duration)
                        .ease(d3.easeLinear);
    var linefunc = d3.line()
                        .x(function(d){ return gtosx(d[0]); })
                        .y(function(d){ return gtosy(d[1]); })
                        .curve(d3.curveLinear);
    var path = g.append("path")
                .attr("d", linefunc(traj))
                .attr("stroke", color)
                .attr("stroke-width", stroke_width)
                .attr("fill", "none");
    var pathlength = path.node().getTotalLength();
    path.attr('stroke-dasharray', pathlength + ' ' + pathlength)
        .attr('stroke-dashoffset', pathlength)
        .transition(transition) 
        .attr('stroke-dashoffset', 0);
}