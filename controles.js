allWorkspaces = [];
select_ctrl = 0;
point_color = 'lightblue';
point_size = 10;
poligono = true;
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

        //transformando todos os circulos(pontos de controle) em pontos.
        workspaceAtual.pontos.forEach(elem => {
            aux.push(new Point(elem.attr('x'), elem.attr('y')));
        });
        // for (let j = 0; j < workspaceAtual.pontos.length; j++) {
        //     aux.push(new Point(workspaceAtual.pontos[j].attr('x'), workspaceAtual.pontos[j].attr('y')));
        // }
        //* /Interpolar todos os pontos até um só, usando o polinomio de bernstein */
        //* /Fazendo isso percorrendo a quantidade de avaliações para a interpolação e formação da curva.*/
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
//Função que traça o poligono de controle
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
//função de adicionar nova curva
stage.on('message:adicionarCurva', function(){
    
    workspaceAtual.pontos = [];
    workspaceAtual.poligonos = [];
    workspaceAtual.curvas = [];
    if(allWorkspaces[allWorkspaces.length -1]) //curva sem nada - 2 clicks
        select_ctrl = allWorkspaces.length;
});

stage.on('message:atualizarInfo', function(a) {
    poligono = a.p;
    ponto = a.pt;
    curva = a.c;
    numAvaliacoes = a.av;
    preencherEspaco();
});
// stage.on('message:mostrarPoligono', function(pol){
//     poligono = pol;
//     preencherEspaco();
// }
// );

// stage.on('message:mostrarPonto', function(pon){
//     ponto = pon;
//     preencherEspaco();
// }
// );

// stage.on('message:mostrarCurva', function(cur){
//     curva = cur;
//     preencherEspaco();
// }
// );
// stage.on('message:mudarT', function(newAvaliacoes){
//     numAvaliacoes = newAvaliacoes;
// }

// );
//ação de edição e chamada dos pontos.
function pointaction(ponto){
    
    ponto.on('drag', function(p){
        if(pontoExistente(p))
        this.attr({x: p.x, y: p.y});
    });

	ponto.on('dblclick', function(p){
            var aux = [];
            index = workspaceAtual.pontos.indexOf(p.target);
            workspaceAtual.pontos.splice(index, 1);
            // workspaceAtual.pontos.forEach(elem => {
            //     if(p.target == elem) index = workspaceAtual.pontos.indexOf(elem);
            // });


			// for(var i = 0; i<workspaceAtual.pontos.length;i++){
			// 	if(p.target != workspaceAtual.pontos[i])
			// 		aux.push(workspaceAtual.pontos[i]);
			// }
			// workspaceAtual.pontos = aux;
			
            workspaceAtual.poligonos = [];
            workspaceAtual.curvas = [];
			
            desenhe();
});
    
}




//Click de criação de novos pontos

function pontoExistente(ponto){
    ans = false;
    workspaceAtual.pontos.forEach(a => {
        if(ponto.target == a) ans= true;
    });
    return ans;
}

stage.on('click', function(ponto){

    if(!pontoExistente(ponto)){
        p = new Circle(ponto.x, ponto.y, point_size).fill(point_color);
        // points.push(p);
        workspaceAtual.pontos.push(p);
        pointaction(p); 
    }
    desenhe();
})

function desenhe() {
    // if(points.length > 1)
    //     ctrlpoly = tracepoly();
    // if(points.length > 2)
    if(workspaceAtual.pontos.length > 1) tracepoly();
    if(workspaceAtual.pontos.length > 2) makeCurve(); 
    preencherEspaco();
}

function preencherEspaco(){
    var elementos = [];
    // workspaceAtual = {
    //     pontos : [],
    //     poligonos : [],
    //     curva : []
    // };
    // copyFromTo(curve, workspaceAtual.curva, true);
    // copyFromTo(ctrlpoly, workspaceAtual.poligonos, true);
    // copyFromTo(points, workspaceAtual.pontos, true);
    // curve.forEach(c => workspaceAtual.curva.push(c));
    // ctrlpoly.forEach(l => workspaceAtual.poligonos.push(l));
    // points.forEach(p => workspaceAtual.pontos.push(p));
    
    if(!allWorkspaces[select_ctrl])
        allWorkspaces.push(workspaceAtual);
    else
        allWorkspaces[select_ctrl] = workspaceAtual;

    allWorkspaces.forEach( e =>  {
        copyFromTo(e.curvas, elementos, curva);
        copyFromTo(e.poligonos, elementos, poligono);
        copyFromTo(e.pontos, elementos, ponto);
        // if(curva)
        // e.curvas.forEach(d => stageObjects.push(d))
        // if(poligono)
        // e.poligonos.forEach(d => stageObjects.push(d))
        // if(ponto)
        // e.pontos.forEach(d => stageObjects.push(d))
    });
    stage.children(elementos);
}

function copyFromTo(array, newArray, cond) {
    if (!cond) return;
    array.forEach(elem => {
        newArray.push(elem);
    });
}