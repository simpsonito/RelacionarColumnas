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
var MAX_INTENTOS = 2;

var bodyOriginal;

window.addEventListener("load", OnLoad, false);

function OnLoad(){
    bodyOriginal = document.body.innerHTML;
    total = document.getElementsByClassName("DropTarget").length;
    iniciar();
    window.onresize = function(){
        //console.log("cambió tamaño");
        ajustarDestinos();
    };
}

function iniciar(){
    oDragTarget = null;
    oDragItem = null;
    iClickOffsetX = 0;
    iClickOffsetY = 0;

    buenas = 0;
    contestadas = 0;

    revolver();
    SetupDragDrop();
}
function reiniciar(){
    document.body.innerHTML = bodyOriginal;
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
    ajustarDestinos();
    var botones = document.getElementsByClassName("Dragable");
    for(var i = 0; i<botones.length; i++){
        MakeDragable(botones[i]);
        botones[i].padreOriginal = botones[i].parentNode;
        botones[i].intentos = 0;
        //console.log(i+" - "+botones[i].parentNode + " - " + botones[i].padreOriginal);
    }
}
function ajustarDestinos(){
    oDragTargets = [];
    var destinos = document.getElementsByClassName("DropTarget");
    for(var i = 0; i<destinos.length; i++){
        oDragTargets.push(GetObjPos(destinos[i]));
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
    oDragItem.style.zIndex = 1000;
    oDragItem.style.position = "absolute";
    oDragItem.style.left = x + "px";
    oDragItem.style.top = y + "px";

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
        //mensajear("oDragTarget true: "+ oDragItem.getAttribute("data-tipo") + " - " + oDragTarget.getAttribute("data-destino"));
        if(oDragItem.getAttribute("data-tipo") == oDragTarget.getAttribute("data-destino")){
            OnTargetOut();
            OnTargetDrop();
            oDragTarget = null;
            contestadas++;
            buenas++;
            UnmakeDragable(oDragItem);
            oDragItem.className = "Indragable bien";
            revisar();
        } else {
            oDragItem.padreOriginal.appendChild(oDragItem);
            oDragItem.style.position="";
            oDragItem.intentos++;
            mensajear("intentos: "+oDragItem.intentos);
            if(oDragItem.intentos >= MAX_INTENTOS){//A la maxima oportunidad que falle, se cuenta como mala
                UnmakeDragable(oDragItem);
                oDragItem.className += " mal";
                oDragItem.innerHTML = "<b style='color: #F96'>"+oDragItem.getAttribute("data-tipo")+".</b> "+oDragItem.innerHTML;
                //console.log("intentos sobrepasados: ");
                if(oDragItem.getAttribute("data-tipo") != "Sobrante"){//No cuenta la que sobra
                    contestadas++;
                }
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
        switch (buenas) {
            case 6:
                mensaje = "¡Excelente!";
                break;
            case 5:
                mensaje = "¡Bien!";
                break;
            default://Cualquier otro (5 ó menos)
                mensaje = "Revisa nuevamente el tema.";
        }
        //mensajear('Terminótodo');
        retroalimentar(mensaje+' Obtuviste '+ buenas + " de " + total +'.<br /><input id="botonReiniciar" type="button" value="Otra vez" onClick="reiniciar()">');
        document.getElementById('botonReiniciar').scrollIntoView();
    }
    ajustarDestinos();
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
