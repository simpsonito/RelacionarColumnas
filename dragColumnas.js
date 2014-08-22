/**
 * Created by adib on 31/07/14.
 */
var oDragTargets = [];

//Sólo se crean las variables, se asigna en iniciar() el valor.
var oDragTarget;
var oDragItem;
var iClickOffsetX;
var iClickOffsetY;

var buenas;
var contestadas;
var total;

var bodyOriginal;

function OnLoad(){
    bodyOriginal = document.getElementsByTagName("body")[0].innerHTML;
    iniciar();
}

function iniciar(){
    oDragTarget = null;
    oDragItem = null;
    iClickOffsetX = 0;
    iClickOffsetY = 0;

    buenas = 0;
    contestadas = 0;
    total = 5;

    revolver();
    SetupDragDrop();
}
function reiniciar(){
    document.getElementsByTagName("body")[0].innerHTML = bodyOriginal;
    iniciar();
}

function revolver(){
    var respuestas = document.getElementsByClassName("celdaIzquierda");
    var interior = [];
    for(var i = 0; i<respuestas.length; i++){
        interior.push(respuestas[i].innerHTML);
    }
    var revueltas = shuffle(interior);

    for (var nodo in respuestas) {
        respuestas[nodo].innerHTML = revueltas[nodo];
        //console.log(respuestas[nodo] + ", " + nodo + ", " + respuestas);
    }
}
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function SetupDragDrop(){
    oDragTargets = [];

    var oList = document.getElementsByTagName("div");
    for(var i=0; i<oList.length; i++){
        var o = oList[i];
        if (o.className == "DropTarget"){
            oDragTargets[oDragTargets.length] = GetObjPos(o);
        }else if (o.className == "Dragable"){
            MakeDragable(o);
            o.padreOriginal = o.parentNode;
            o.intentos = 0;
            mensajear(o.parentNode + " - " + o.padreOriginal);
        }
    }
}

function MakeDragable(oBox){
    //if (navigator.platform=="iPad" || navigator.platform =="iPhone"){
    if (is_touch_device()){
        oBox.ontouchstart= function(e){TouchStart(e)};
        oBox.ontouchmove=function(e){TouchMove(e)};
        oBox.ontouchend=function(e){TouchEnd(e)};
    }else{
        oBox.onmousemove= function(e){DragMove(oBox,e)};
        oBox.onmouseup=function(e){DragStop(oBox,e)};
        oBox.onmousedown=function(e){DragStart(oBox,e);return false};
    }
}
//Extra para deshabilitar
function UnmakeDragable(oBox){
    if (is_touch_device()){
        oBox.ontouchstart = null;
        oBox.ontouchmove = null;
        oBox.ontouchend = null;
    }else{
        oBox.onmousemove = null;
        oBox.onmouseup = null;
        oBox.onmousedown = null;
    }
    oBox.style.cursor = "auto";
}

function is_touch_device() {
    return 'ontouchstart' in window; // works on most browsers
    //|| 'onmsgesturechange' in window; // funciona en ie10, no en 11
}
function TouchStart(e){
    var oPos = GetObjPos(e.target);
    iClickOffsetX = e.targetTouches[0].pageX - oPos.x;
    iClickOffsetY = e.targetTouches[0].pageY - oPos.y;
}
function DragStart(o,e){
    if(!e) e = window.event;
    oDragItem = o;

    if (e.offsetX){
        iClickOffsetX = e.offsetX;
        iClickOffsetY = e.offsetY;
    }else{
        var oPos = GetObjPos(o);
        iClickOffsetX = e.clientX - oPos.x;
        iClickOffsetY = e.clientY - oPos.y;
    }

    if (o.setCapture){
        o.setCapture();
    }else{
        window.addEventListener ("mousemove", DragMove2, true);
        window.addEventListener ("mouseup",   DragStop2, true);
    }
}

function DragMove2(e){
    DragMove(oDragItem,e);
}

function DragStop2(e){
    DragStop(oDragItem,e);
}

function DragMove(o,e){
    if (oDragItem==null) return;

    if(!e) e = window.event;
    var x = e.clientX + document.body.scrollLeft - document.body.clientLeft - iClickOffsetX;
    var y = e.clientY + document.body.scrollTop  - document.body.clientTop - iClickOffsetY;

    HandleDragMove(x,y);
}

function HandleDragMove(x,y){
    with(oDragItem.style){
        zIndex = 1000;
        position="absolute";
        left=x+"px";
        top=y+"px";
    }

    for (var i=0; i< oDragTargets.length; i++){
        var oTarget = oDragTargets[i];
        if (oTarget.x < x && oTarget.y < y && (oTarget.x + oTarget.w) > x && (oTarget.y + oTarget.h) > y){
            if (oDragTarget!=null && oDragTarget != oTarget.o) OnTargetOut();
            oDragTarget = oTarget.o;
            OnTargetOver();
            return;
        }
    }

    if (oDragTarget){
        OnTargetOut();
        oDragTarget = null;
    }
}

function TouchMove(e){
    e.preventDefault();
    var x = e.targetTouches[0].pageX - iClickOffsetX;
    var y = e.targetTouches[0].pageY - iClickOffsetY;
    oDragItem = e.targetTouches[0].target;
    HandleDragMove(x,y);
}

function DragStop(o,e){
    if (o.releaseCapture){
        o.releaseCapture();
    }else if (oDragItem){
        window.removeEventListener ("mousemove", DragMove2, true);
        window.removeEventListener ("mouseup",   DragStop2, true);
    }

    HandleDragStop();
}

function HandleDragStop(){
    if (oDragItem==null) {
        return;
    }
    if (oDragTarget){
        mensajear("oDragTarget true: "+ oDragItem.getAttribute("data-tipo") + " - " + oDragTarget.getAttribute("data-destino"));
        if(oDragItem.getAttribute("data-tipo") == oDragTarget.getAttribute("data-destino")){
			oDragTarget.getElementsByClassName('palomita').item(0).style.display = "";
            mensajear("padre: "+ oDragTarget.getElementsByClassName('palomita').item(0));
			UnmakeDragable(oDragItem);
            OnTargetOut();
            OnTargetDrop();
            oDragTarget = null;
            contestadas++;
            buenas++;
            revisar();
        } else {
            oDragItem.padreOriginal.appendChild(oDragItem);
            oDragItem.style.position="";
            oDragItem.intentos++;
            mensajear("intentos: "+oDragItem.intentos);
            if(oDragItem.intentos >= 2){//A la segunda oportunidad que falle, se cuenta como mala
                UnmakeDragable(oDragItem);
                oDragItem.getElementsByClassName('tache').item(0).style.display = "";
                mensajear("intentos sobrepasados: ");
                contestadas++;
                revisar();
            }
        }
    } else {
        //Agregado para que regrese si no se coloca en una caja
        mensajear("oDragTarget es falso, padre"+oDragItem.parentNode + " - original: " + oDragItem.padreOriginal);
        oDragItem.padreOriginal.appendChild(oDragItem);
        oDragItem.style.position="";
    }

    oDragItem.style.zIndex = 1;
    oDragItem = null;
}
function revisar(){
    if(contestadas == total){
        var mensaje = "";
        if(buenas == total){
            mensaje = "¡Muy bien!";
        } else {
            mensaje = "Inténtalo de nuevo.";
        }
        //mensajear('Terminótodo');
        retroalimentar(mensaje+' Obtuviste '+ buenas + " de " + total +'.<br /><input id="botonReiniciar" type="button" value="Otra vez" onClick="reiniciar()">');
        document.getElementById('botonReiniciar').scrollIntoView();
    }
}

function TouchEnd(e){
    //e.target.innerHTML = "TouchEnd";
    HandleDragStop();
}

function $(s){
    return document.getElementById(s);
}

function GetObjPos(obj){
    var x = 0;
    var y = 0;
    var o = obj;

    var w = obj.offsetWidth;
    var h = obj.offsetHeight;
    if (obj.offsetParent) {
        x = obj.offsetLeft;
        y = obj.offsetTop;
        while (obj = obj.offsetParent){
            x += obj.offsetLeft;
            y += obj.offsetTop;
        }
    }
    return {x:x, y:y, w:w, h:h, o:o};
}

//Drag and Drop Events
function OnTargetOver(){
    oDragTarget.style.border = "2px solid red";
    oDragTarget.style.backgroundColor = "#DDD";
}

function OnTargetOut(){
    oDragTarget.style.border = "";
    oDragTarget.style.backgroundColor = "";
}

function OnTargetDrop(){
    oDragItem.style.position="";
    oDragTarget.appendChild(oDragItem);
    //if (navigator.platform=="iPad") MakeDragable(oDragItem);
    if (is_touch_device()) MakeDragable(oDragItem);
}

function mensajear(cadena){
    //document.getElementById("mensajes").innerHTML = cadena;
}
function retroalimentar(texto){
    document.getElementById("retroalimentacion").innerHTML = texto;
}