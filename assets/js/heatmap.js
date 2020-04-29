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

// size of svg image
const width = 600, height = 400;
const margin = {top: 60, right: 30, bottom: 30, left: 30};

// svg element
var s = d3.select("#canvas-body")
            .append("svg");

// range of (x, y)
var xmin = -3, xmax = 3;
var ymin = -2, ymax = 2;

// heatmap segmentation parameter (default settings)
var d = 100;
var xd = width>height? d : Math.round(d * width / height);
var yd = width>height? Math.round(d * height / width) : d;
var dx = (xmax - xmin) / xd, dy = (ymax - ymin) / yd;
var dw = width / xd, dh = height / yd;

// axis parameter
var xticknum = 5, yticknum = 5;

// minimum and maximum of data
var mindata = Infinity, maxdata = -Infinity;

// (deprecated) functions to transform geometric coordinates to svg coordinates 
// function gtosx(x){ return width * (x - xmin) / (xmax - xmin); }
// function gtosy(y){ return height + (-height) * (y - ymin) / (ymax - ymin); }

// (deprecated) functions to transform svg coordinates to geometric coordinates
// function stogx(x){ return xmin + (xmax - xmin) * x / width; }
// function stogy(y){ return ymin + (ymax - ymin) * (y - height) / (-height); }

// scale from geometric coordinates to svg coordinates
var gtosx = d3.scaleLinear().domain([xmin, xmax]).range([0, width]);
var gtosy = d3.scaleLinear().domain([ymin, ymax]).range([height, 0]);

// scale from svg coordinates to geometric coordinates
var stogx = d3.scaleLinear().domain([0, width]).range([xmin, xmax]);
var stogy = d3.scaleLinear().domain([height, 0]).range([ymin, ymax]);

// generate height matrix for function f
function generate_data(f, d){
    xd = width>height? d : Math.round(d * width / height);
    yd = width>height? Math.round(d * height / width) : d;
    dx = (xmax - xmin) / xd, dy = (ymax - ymin) / yd;
    dw = width / xd, dh = height / yd;
    var data = new Array();
    mindata = Infinity; 
    maxdata = -Infinity;
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
    var dataf = new Array(xd * yd);
    for(var i = 0; i < xd; i++){
        for(var j = 0; j < yd; j++){
            dataf[i * yd + j] = data[i][j];
        }
    }
    return dataf;
}

// data palette function
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

// function to draw heatmap
function draw_heatmap(data){
    g.selectAll()
        .data(data)
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
        });
    
    // set mouseover function
    g.on("mouseover", function(){
        var mousepos = d3.mouse(this);
        var mousex = stogx(mousepos[0]);
        var mousey = stogy(mousepos[1]);
        d3.select("#curx")
            .text(mousex.toFixed(4).toString());
        d3.select("#cury")
            .text(mousey.toFixed(4).toString());
        d3.select("#curf")
            .text(f(mousex, mousey).toFixed(6).toString());
    })
}

// function to clear heatmap
function clear_heatmap(){
    g.selectAll("rect").remove();
}

// function to draw x axis and y axis
function draw_axis(xticks, yticks){
    var xaxis = d3.axisBottom(gtosx).ticks(xticks);
    gs.append("g")
        .attr("id", "axis-x")
        .attr("transform", "translate(0," + height + ")")
        .call(xaxis);
    var yaxis = d3.axisLeft(gtosy).ticks(yticks);
    gs.append("g")
        .attr("id", "axis-y")
        .attr("transform", "translate(0,0)")
        .call(yaxis);
}

// function to clear axis
function clear_axis(){
    gs.selectAll("#axis-x").remove();
    gs.selectAll("#axis-y").remove();
}

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

// cursor type
var cursor_type = null;

// optmization trajectory
var traj = new Array();

// drag parameters
var drag_pos = [0, 0];

// function to set cursor type (click or move)
function set_cursor_type(type){
    if (type == "Click" || type.innerHTML == "Click"){
        console.log("Setting cursor type to \"Click\"");

        // if cursor type is "Click" already, then quit
        if (cursor_type == "Click")
            return;
        
        // set cursor type to "Click"
        cursor_type = "Click";

        // set selection image
        d3.select("#cursor-move").selectAll("img").remove();
        d3.select("#cursor-click")
            .append("img")
            .attr("src", "assets/images/selection.png")
            .attr("width", "30px")
            .attr("height", "30px")
            .style("float", "right")
            .style("padding", "11px 10px 8px 0px");

        // set onclick function
        g.on("click", function(){
            // get coordinate of clicked point
            var clickpos = d3.mouse(this);
            var clickx = stogx(clickpos[0]), clicky = stogy(clickpos[1]);

            // run optimization algorithms and get optimization paths
            var traj1 = steepest_descent(clickx, clicky);
            var traj2 = newton(clickx, clicky);
            
            // clean former paths
            g.selectAll("path").remove();
            
            // draw optimization paths
            draw_path(traj1, traj1.length * 100, "black", 2);
            draw_path(traj2, traj2.length * 40, "white", 2);

            // store optimization trajectories
            traj = new Array();
            traj.push(traj1);
            traj.push(traj2);
        
            // re-draw axises
            clear_axis();
            draw_axis(xticknum, yticknum);
        });

        // set drag function
        var drag = d3.drag().on("start", function(){
            // drag start function
            console.log("dragstart-click");
        }).on("end", function(){
            // drag end function
            console.log("dragend-click");
        }); 
        g.call(drag);

    }else if (type == "Move" || type.innerHTML == "Move"){
        console.log("Setting cursor type to \"Move\"");

        // if cursor type is "Move" already, then quit
        if (cursor_type == "Move")
            return;

        // set cursor type to "Move"
        cursor_type = "Move";

        // set selection image
        d3.select("#cursor-click").selectAll("img").remove();
        d3.select("#cursor-move")
            .append("img")
            .attr("src", "assets/images/selection.png")
            .attr("width", "30px")
            .attr("height", "30px")
            .style("float", "right")
            .style("padding", "11px 10px 8px 0px");
        
        // set onclick function
        g.on("click", function(){
            console.log("move");
        })

        // set drag function
        var drag = d3.drag().on("start", function(){
            // drag start function
            console.log("dragstart-move");
            var clickpos = d3.mouse(this);
            drag_pos[0] = clickpos[0];
            drag_pos[1] = clickpos[1];
        }).on("end", function(){
            console.log("dragend-move");
            // get mouse move coordinate
            var mousepos = d3.mouse(this);
            var delta_mousex = mousepos[0] - drag_pos[0];
            var delta_mousey = mousepos[1] - drag_pos[1];

            // calculate delta x, y coordinates
            var deltax = (xmax - xmin) * delta_mousex / width;
            var deltay = (ymax - ymin) * delta_mousey / height;

            // shift window
            var movespeed = 0.8;
            xmax -= deltax * movespeed;
            xmin -= deltax * movespeed;
            ymax += deltay * movespeed;
            ymin += deltay * movespeed;

            // update axis
            gtosx = d3.scaleLinear().domain([xmin, xmax]).range([0, width]);
            gtosy = d3.scaleLinear().domain([ymin, ymax]).range([height, 0]);
            stogx = d3.scaleLinear().domain([0, width]).range([xmin, xmax]);
            stogy = d3.scaleLinear().domain([height, 0]).range([ymin, ymax]);

            // re-draw axis
            clear_axis();
            draw_axis(xticknum, yticknum);

            // re-draw heatmap
            clear_heatmap();
            dataf = generate_data(f, d);
            draw_heatmap(dataf);

            // if there are paths on heatmap, then clear and re-draw them
            var paths = g.selectAll("path");
            if (!paths.empty()){
                paths.remove();
                draw_path(traj[0], 0, "black", 2);
                draw_path(traj[1], 0, "white", 2);
            }
        })
        g.call(drag);
    }
}

// function to draw optimization path
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
    path.attr("stroke-dasharray", pathlength + " " + pathlength)
        .attr("stroke-dashoffset", pathlength)
        .transition(transition) 
        .attr("stroke-dashoffset", 0);
}

// set height and width 
s.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

// svg element group
var gs = s.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

// graph element group
var g = gs.append("svg").attr("width", width + "px").attr("height", height + "px").style("overflow", "hidden");

// generate data
var dataf = generate_data(f, 100);

// calculate minimum and maximum value of data
for(var i = 0; i < xd * yd; i++){
    mindata = Math.min(mindata, dataf[i]);
    maxdata = Math.max(maxdata, dataf[i]);
}

// draw visualization
draw_heatmap(dataf);
draw_axis(xticknum, yticknum);
set_cursor_type("Click");

