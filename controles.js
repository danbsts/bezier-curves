allWorkspaces = [];
wkNum = 0;
corPonto = 'lightblue';
tamanhoPonto = 10;
poligono = true;
modo = "add";
ponto = true;
curva = true;
numAvaliacoes = 50;
workspaceAtual = {
    pontos : [],
    poligonos : [],
    curvas : []
};
function bernstein(p1, p2, numAvaliacoes){
    let point = new Point((((1-numAvaliacoes)*p1.x) + (numAvaliacoes*p2.x)), (((1-numAvaliacoes)*p1.y) + (numAvaliacoes*p2.y)));
	return point;
}
function makeCurve(){

    let c_points = [];
    for(let i = 0; i < numAvaliacoes; i++){
        let aux = [];
        let aux2 = [];
        workspaceAtual.pontos.forEach(elem => {
            aux.push(new Point(elem.attr('x'), elem.attr('y')));
        });
        while(aux.length > 1){
			for(var k = 0; k<aux.length-1;k++){
				point = bernstein(aux[k], aux[k+1], i/numAvaliacoes);
				aux2.push(point);
			}
			aux = aux2;
			aux2 = [];
		}
		c_points.push(aux[0]);
    }
    tracecurve(c_points);
}
function tracecurve(c_points){
    workspaceAtual.curvas = [];
    for (let i = 0; i < c_points.length -1; i++)
    {
        let x1 = c_points[i].x , y1 = c_points[i].y , x2 = c_points[i+1].x, y2 = c_points[i+1].y;
        workspaceAtual.curvas.push(new Path()
        .moveTo(x1, y1)
        .lineTo(x2, y2)
        .stroke('cyan', 2));
    }
}
function tracepoly(){
    workspaceAtual.poligonos = []
    for (let i = 0; i < workspaceAtual.pontos.length -1; i++) {
        let x1 = workspaceAtual.pontos[i].attr('x'), 
        x2 = workspaceAtual.pontos[i + 1].attr('x') ,
        y1 = workspaceAtual.pontos[i].attr('y'), 
        y2 = workspaceAtual.pontos[i + 1].attr('y');
        workspaceAtual.poligonos.push(new Path()
            .moveTo(x1, y1)
            .lineTo(x2, y2)
            .stroke('#000', 2));
    }
}
stage.on('message:adicionarCurva', function(){
    if(allWorkspaces[wkNum]) {
        allWorkspaces[wkNum] = copy(workspaceAtual);
        wkNum += 1;
        console.log(allWorkspaces)
    }
    workspaceAtual.pontos = [];
    workspaceAtual.poligonos = [];
    workspaceAtual.curvas = [];
});
console.log(allWorkspaces)
stage.on('message:atualizarInfo', function(a) {
    poligono = a.p;
    ponto = a.pt;
    curva = a.c;
    numAvaliacoes = a.av;
    preencherEspaco();
});

stage.on('message:atualizarModo', function(s) {
    modo = s;
})

function pointaction(ponto){
    
    ponto.on('drag', function(p){
        if(pontoExistente(p))
        this.attr({x: p.x, y: p.y});
    });

	ponto.on('dblclick', function(p){
            var aux = [];
            index = workspaceAtual.pontos.indexOf(p.target);
            workspaceAtual.pontos.splice(index, 1);			
            workspaceAtual.poligonos = [];
            workspaceAtual.curvas = [];
            desenhe();
});
}

function pontoExistente(ponto){
    ans = false;
    workspaceAtual.pontos.forEach(a => {
        if(ponto.target == a) ans= true;
    });
    return ans;
}

stage.on('click', function(ponto){
    console.log(allWorkspaces)
    console.log(wkNum)
    if (modo == "add") {
        console.log("ADD")
        if(!pontoExistente(ponto)){
            p = new Circle(ponto.x, ponto.y, tamanhoPonto).fill(corPonto);
            workspaceAtual.pontos.push(p);
            pointaction(p); 
        }
        desenhe();
    } else if(modo == "del") {
        console.log("DEL")
        for(var i = 0; i < allWorkspaces.length; i++) {
            elem = allWorkspaces[i];
            elem.pontos.forEach(pt => {
                console.log(ponto.target == pt)
                if(ponto.target == pt) {
                    console.log(allWorkspaces)
                    console.log(i);
                    aux = [];
                    for(var w = 0; w < allWorkspaces.length; w++) {
                        if(w != i) {
                            console.log(w)
                            aux.push(allWorkspaces[w]);
                        }
                    }
                    allWorkspaces = aux;
                    console.log(allWorkspaces)
                    wkNum = aux.length;
                    workspaceAtual = aux[0];
                    desenhe();
                }
            })
        }
    } else if(modo = "change") {
        console.log("CHG")
        allWorkspaces.forEach(elem => {
            elem.pontos.forEach(pt => {
                if(ponto.target == pt) workspaceAtual = elem;
            })
        });
    }
})

function desenhe() {
    if(workspaceAtual.pontos.length > 1) tracepoly();
    if(workspaceAtual.pontos.length > 2) makeCurve(); 
    preencherEspaco();
}

function preencherEspaco(){
    var elementos = [];
    if(!allWorkspaces[wkNum])
        allWorkspaces.push(copy(workspaceAtual));
    else
        allWorkspaces[wkNum] = copy(workspaceAtual);
    allWorkspaces.forEach( e =>  {
        copyFromTo(e.curvas, elementos, curva);
        copyFromTo(e.poligonos, elementos, poligono);
        copyFromTo(e.pontos, elementos, ponto);
    });
    stage.children(elementos);
}

function copyFromTo(array, newArray, cond) {
    if (!cond) return;
    array.forEach(elem => {
        newArray.push(elem);
    });
}

function copy(array) {
    aux = {
        pontos : [],
        poligonos : [],
        curvas : []
    };
    array.pontos.forEach(e => aux.pontos.push(e));
    array.poligonos.forEach(e => aux.poligonos.push(e));
    array.curvas.forEach(e => aux.curvas.push(e));
    return aux;
}