// size of svg image
const width = 600, height = 400;
const margin = {top: 10, right: 30, bottom: 30, left: 30};

// svg element
var s = d3.select("#canvas-body").append("svg");

// range of (x, y)
var xmin = -4.5, xmax = 4.5;
var ymin = -3, ymax = 3;

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

// cursor type
var cursor_type = null;

// objective function id
var obj_func_id = null;

// desciption for optimization functions
const des_img = ["assets/images/tutorial7_func.png", "assets/images/quadratic_bowl.png", "assets/images/Himmelblau.png"];
const des_title = ["Function 1", "Function 2", "Function 3"];
const des_cap = [" The function in tutorial 7", " Quadratic bowl function", " Himmelblau's function"];
const des_func = ["$$f(x,y)=\\frac{1}{2}(x^2+2y^2)$$", "$$f(x,y)=x^2+y^2-16e^{-\\frac{(x-3)^2+y^2}{1.2}}-20e^{-\\frac{(x+3)^2+y^2}{2}}$$", "$$f(x,y)=(x^2+y-11)^2+(x+y^2-7)^2$$"];
const des_text = ["\tFunction 1 is the objective function from Tutorial 7. It is a very simple one with only one optimal: $$f(0,0)=0$$", 
                  "\tFunction 2 is basically a quadratic \"bowl\" subtracting two gaussians. It has two local minimas, the one on the left is also the global minima.", 
                  "\tFunction 3 is Himmelblau's function, a common function for testing optimization algorithms. It has 1 local maximum at x=-0.270845 and y=-0.923039 and 4 local minimas: $$f(3,2)=0,$$ $$f(-2.81,3.13)=0,$$ $$f(-3.78,-3.28)=0,$$ $$f(3.58,-1.85)=0$$"];

// number of optimization algorithms
var num_opt = 2;

// optmization trajectory
var traj = new Array(num_opt).fill(null);

// optimization trajectory color
var color = ["Aquamarine", "AntiqueWhite", "LightPink", "LightCoral", "LightBlue"]

// show or hide optimization trajectory
var traj_show = new Array(num_opt).fill(true);

// drag parameters
var drag_pos = [0, 0];

// zoom parameters
var zoom_scale = 1;

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

// function to set cursor type (click or move)
function set_cursor_type(type){
    if (type == "Click" || type.innerHTML == "Click"){
        console.log("Setting cursor type to \"Click\"");

        // if cursor type is "Click" already, then quit, otherwise set it to "Click"
        if (cursor_type == "Click")
            return;
        cursor_type = "Click";

        // set selection icon
        set_selection_icon(["#cursor-move", "#cursor-click"], ["#cursor-click"]);

        // set onclick function
        g.on("click", click_func);

        // set drag function to null
        g.on(".drag", null);

        // set zoom function
        g.on(".zoom", null);

    }else if (type == "Move" || type.innerHTML == "Move"){
        console.log("Setting cursor type to \"Move\"");

        // if cursor type is "Move" already, then quit, otherwise set it to "Move"
        if (cursor_type == "Move")
            return;
        cursor_type = "Move";

        // set selection icon
        set_selection_icon(["#cursor-move", "#cursor-click"], ["#cursor-move"]);
        
        // set onclick function to null
        g.on(".click", null);

        // set drag function
        var drag = d3.drag().on("start", dragstart_func).on("end", dragend_func);
        g.call(drag);

        // set zoom function
        var zoom = d3.zoom().scaleExtent([0.01, 100]).on("zoom", zoom_func);
        g.call(zoom);
    }
}

// click function to start optimization on the clicked point
function click_func(){
    // get coordinate of clicked point
    var clickpos = d3.mouse(document.getElementById("heatmap"));
    var clickx = stogx(clickpos[0]), clicky = stogy(clickpos[1]);

    // run optimization algorithms and get optimization paths
    var traj1 = steepest_descent(clickx, clicky);
    var traj2 = newton(clickx, clicky);
    
    // clean former paths
    clear_paths();
    
    // draw optimization paths
    draw_path(traj1, "traj0", traj1.length * 100, color[0], 2, traj_show[0]);
    draw_path(traj2, "traj1", traj2.length * 100, color[1], 2, traj_show[1]);

    // store optimization trajectories
    traj[0] = traj1;
    traj[1] = traj2;
}

// drag start function
function dragstart_func(){
    drag_pos[0] = d3.event.x;
    drag_pos[1] = d3.event.y;
}

// drag function (test)
function drag_func(){
    console.log(d3.event.dx, d3.event.dy);
    console.log(d3.event.subject);
    console.log(d3.event.x, d3.event.y);
}

// drag end function
function dragend_func(){
    // get mouse move coordinate
    var delta_mousex = d3.event.x - drag_pos[0];
    var delta_mousey = d3.event.y - drag_pos[1];

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

    // refresh heatmap
    refresh_heatmap();

    // if the window has been moved, then set reset button
    if (deltax != 0 || deltay != 0){
        set_reset_btn("to_origin");
    }
}

// zoom function
function zoom_func(){
    // get zoom scale
    var prev_scale = zoom_scale;
    zoom_scale = 1 / d3.event.transform.k;

    // get mouse position, regard it as zoom center
    var mousepos = d3.mouse(document.getElementById("heatmap"));
    var zoom_center_x = stogx(mousepos[0]), zoom_center_y = stogy(mousepos[1]);

    // scale window
    xmax = zoom_center_x + zoom_scale / prev_scale * (xmax - zoom_center_x);
    ymax = zoom_center_y + zoom_scale / prev_scale * (ymax - zoom_center_y);
    xmin = zoom_center_x + zoom_scale / prev_scale * (xmin - zoom_center_x);
    ymin = zoom_center_y + zoom_scale / prev_scale * (ymin - zoom_center_y);

    // update axis
    gtosx = d3.scaleLinear().domain([xmin, xmax]).range([0, width]);
    gtosy = d3.scaleLinear().domain([ymin, ymax]).range([height, 0]);
    stogx = d3.scaleLinear().domain([0, width]).range([xmin, xmax]);
    stogy = d3.scaleLinear().domain([height, 0]).range([ymin, ymax]);

    // refresh heatmap
    refresh_heatmap();

    // if the window has been scaled, then set reset button
    if (zoom_scale != 1){
        set_reset_btn("to_origin");
    }
}

// function to set selection icon
function set_selection_icon(choice_ids, selection_ids){
    choice_ids.forEach(id => {
        d3.select(id).selectAll("img").remove();
    });
    selection_ids.forEach(id => {
        d3.select(id).append("img")
            .attr("src", "assets/images/selection.png")
            .attr("width", "30px")
            .attr("height", "30px")
            .style("float", "right")
            .style("padding", "11px 10px 8px 0px");
    })
}

// function to draw optimization path
function draw_path(traj, path_id, duration, color, stroke_width, visible){
    var transition = d3.transition()
                        .duration(duration)
                        .ease(d3.easeLinear);
    var linefunc = d3.line()
                        .x(function(d){ return gtosx(d[0]); })
                        .y(function(d){ return gtosy(d[1]); })
                        .curve(d3.curveLinear);
    var path = g.append("path")
                .attr("id", path_id)
                .attr("d", linefunc(traj))
                .attr("stroke", color)
                .attr("stroke-width", stroke_width)
                .attr("fill", "none")
                .style("visibility", visible? "visible" : "hidden");
    var pathlength = path.node().getTotalLength();
    path.attr("stroke-dasharray", pathlength + " " + pathlength)
        .attr("stroke-dashoffset", pathlength)
        .transition(transition) 
        .attr("stroke-dashoffset", 0);
}

// function to clear paths
function clear_paths(){
    g.selectAll("path").remove();
}

// function to show or hide optimization trajectory
function show_hide_traj(idx){
    traj_show[idx] = !traj_show[idx];
    d3.select("#traj" + idx.toString())
        .style("visibility", traj_show[idx]? "visible" : "hidden");
    d3.select("#toggle" + idx.toString()).select("circle")
        .attr("fill", traj_show[idx]? color[idx] : "white");
}

// function to reset all parameters
function reset_params(){
    // range of (x, y)
    xmin = -4.5, xmax = 4.5;
    ymin = -3, ymax = 3;
    
    // update axis
    gtosx = d3.scaleLinear().domain([xmin, xmax]).range([0, width]);
    gtosy = d3.scaleLinear().domain([ymin, ymax]).range([height, 0]);
    stogx = d3.scaleLinear().domain([0, width]).range([xmin, xmax]);
    stogy = d3.scaleLinear().domain([height, 0]).range([ymin, ymax]);

    // heatmap segmentation parameter (default settings)
    d = 100;

    // axis parameter
    xticknum = 5, yticknum = 5;

    // minimum and maximum of data
    mindata = Infinity, maxdata = -Infinity;

    // drag parameters
    drag_pos = [0, 0];

    // zoom parameters
    zoom_scale = 1;

    // if cursor type is "Move", then reset zoom scale
    if (cursor_type == "Move"){
        var zoom = d3.zoom().scaleExtent([0.01, 100]).on("zoom", zoom_func);
        g.call(zoom);
        g.call(zoom.transform, d3.zoomIdentity);
    }
}

// function to refresh heatmap
function refresh_heatmap(){
    // refresh axis
    clear_axis();
    draw_axis(xticknum, yticknum);

    // refresh heatmap
    clear_heatmap();
    dataf = generate_data(f, d);
    draw_heatmap(dataf);

    // if there are paths on heatmap, then refresh them
    var paths = g.selectAll("path");
    if (!paths.empty()){
        paths.remove();
        for (var i = 0; i < num_opt; i++){
            draw_path(traj[i], "traj" + i.toString(), 0, color[i], 2, traj_show[i]);
        }
    }

    // set default cursor type to "Click"
    if (cursor_type == null)
        set_cursor_type("Click");

    // set default objective function to function 1
    if (obj_func_id == null)
        set_obj_func(1);
}

// function to set reset button
function set_reset_btn(status){
    var gto_btn = d3.select("#reset-btn");
    var transition = d3.transition().duration(100).ease(d3.easeLinear);
    if (status == "at_origin"){
        gto_btn.attr("src", "assets/images/to-origin.png").transition(transition).attr("src", "assets/images/at-origin.png");
    }
    else if (status == "to_origin"){
        gto_btn.attr("src", "assets/images/at-origin.png").transition(transition).attr("src", "assets/images/to-origin.png");
    }
}

// function to set desciption
function set_description(func_id){
    var func_idx = func_id - 1;
    d3.select("#description-title").html(des_title[func_idx]);
    d3.select("#desciption-image-cap").text(des_cap[func_idx]);
    d3.select("#description-func").text(des_func[func_idx]);
    d3.select("#description-text").text(des_text[func_idx]);
    d3.select("#description-image").attr("src", des_img[func_idx]);
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}

// function to change optimization objective function
function set_obj_func(func_id){
    if (obj_func_id == func_id)
        return;
    obj_func_id = func_id;
    if (func_id == 1){
        f = t7f;
        f_grad = t7f_grad;
        f_hessian = t7f_hessian;
        set_selection_icon(["#function1", "#function2", "#function3"], ["#function1"]);
    }
    else if (func_id == 2){
        f = qb;
        f_grad = qb_grad;
        f_hessian = qb_hessian;
        set_selection_icon(["#function1", "#function2", "#function3"], ["#function2"]);
    }
    else if (func_id == 3){
        f = Himmelblau;
        f_grad = Himmelblau_grad;
        f_hessian = Himmelblau_hessian;
        set_selection_icon(["#function1", "#function2", "#function3"], ["#function3"]);
    }
    set_description(func_id);
    refresh_heatmap();
    clear_paths();
}

// set height and width of svg image
s.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

// svg element group
var gs = s.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

// graph element group
var g = gs.append("svg").attr("id", "heatmap").attr("width", width + "px").attr("height", height + "px").style("overflow", "hidden");

// create reset button
d3.select("#canvas-body").append("embed")
    .attr("id", "reset-btn")
    .attr("src", "assets/images/at-origin.png")
    .attr("title", "Reset")
    .style("position", "relative")
    .style("right", "72px")
    .style("bottom", "36px")
    .style("width", "36px")
    .style("height", "36px")
    .on("click", function(){ reset_params(); refresh_heatmap(); set_reset_btn("at_origin"); })

// draw visualization
refresh_heatmap();