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