const canvas = document.getElementById('ruleta');
const ctx = canvas.getContext('2d');
const radio = canvas.width / 2;
let angulo = 0;
let velocidad = 0;

document.getElementById('fecha').innerText = new Date().toLocaleDateString();

let participantes = JSON.parse(localStorage.getItem('participantes')) || [];
let intentos = parseInt(localStorage.getItem('intentos')) || 0;
let numeroSorteado = JSON.parse(localStorage.getItem('numeroSorteado')) || null;
let historial = JSON.parse(localStorage.getItem('historial')) || [];

document.getElementById('contador').innerText = intentos;
if(numeroSorteado) document.getElementById('numeroSorteado').innerText = `${numeroSorteado.numero} - ${numeroSorteado.nombre}`;
actualizarTabla();
actualizarHistorial();
dibujarRuleta();

function guardarEstado() {
    localStorage.setItem('participantes', JSON.stringify(participantes));
    localStorage.setItem('intentos', intentos);
    localStorage.setItem('numeroSorteado', JSON.stringify(numeroSorteado));
    localStorage.setItem('historial', JSON.stringify(historial));
}

function actualizarTabla() {
    const tbody = document.querySelector('#tablaParticipantes tbody');
    tbody.innerHTML = '';
    participantes.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${p.nombre}</td><td>${p.numero}</td>`;
        tbody.appendChild(row);
    });
}

function actualizarHistorial() {
    const tbody = document.querySelector('#tablaHistorial tbody');
    tbody.innerHTML = '';
    historial.forEach(h => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${h.fecha}</td><td>${h.nombre}</td><td>${h.numero}</td>`;
        tbody.appendChild(row);
    });
}

document.getElementById('agregar').addEventListener('click', () => {
    const nombre = document.getElementById('nombre').value.trim();
    const numero = document.getElementById('numero').value.trim();
    if(nombre && /^\d{4}$/.test(numero)) {
        participantes.push({nombre, numero});
        actualizarTabla();
        dibujarRuleta();
        guardarEstado();
        document.getElementById('nombre').value = '';
        document.getElementById('numero').value = '';
    } else alert('Ingrese un nombre y un número de 4 dígitos.');
});

document.getElementById('iniciar').addEventListener('click', () => {
    if(participantes.length === 0) return alert('Agregue participantes primero');
    intentos++;
    document.getElementById('contador').innerText = intentos;
    velocidad = Math.random() * 0.3 + 0.3;
    girarRuleta();
});

document.getElementById('resetear').addEventListener('click', () => {
    participantes = [];
    intentos = 0;
    numeroSorteado = null;
    historial = [];
    document.getElementById('contador').innerText = intentos;
    document.getElementById('numeroSorteado').innerText = '----';
    actualizarTabla();
    actualizarHistorial();
    dibujarRuleta();
    guardarEstado();
});

document.getElementById('mostrarGanador').addEventListener('click', () => {
    if(!numeroSorteado) return alert('No hay ganador aún.');
    alert(`🎉 ¡Ganador! ${numeroSorteado.nombre} con el número ${numeroSorteado.numero}`);
});

document.getElementById('descargar').addEventListener('click', () => {
    if(historial.length === 0) return alert('No hay resultados para descargar.');
    let csvContent = "data:text/csv;charset=utf-8,Fecha,Nombre,Número\n";
    historial.forEach(h => { csvContent += `${h.fecha},${h.nombre},${h.numero}\n`; });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "historial_ganadores.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    const doc = new window.jspdf.jsPDF();
    doc.text("Historial de Ganadores Rifa", 10, 10);
    historial.forEach((h,i)=>{doc.text(`${i+1}. ${h.fecha} - ${h.nombre} - ${h.numero}`,10,20+(i*10))});
    doc.save("historial_ganadores.pdf");
});

function dibujarRuleta() {
    const total = participantes.length;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(total===0) return;
    const anguloPorSegmento = (2*Math.PI)/total;
    for(let i=0;i<total;i++){
        ctx.beginPath();
        ctx.moveTo(radio,radio);
        ctx.arc(radio,radio,radio,anguloPorSegmento*i,anguloPorSegmento*(i+1));
        ctx.fillStyle = `hsl(${i*360/total},70%,60%)`;
        ctx.fill();
        ctx.stroke();
        ctx.save();
        ctx.translate(radio,radio);
        ctx.rotate(anguloPorSegmento*i + anguloPorSegmento/2);
        ctx.textAlign="right";
        ctx.fillStyle="#000";
        ctx.font="14px Arial";
        ctx.fillText(participantes[i].numero,radio-10,0);
        ctx.restore();
    }
}

function girarRuleta() {
    if(velocidad <= 0.002){
        const total = participantes.length;
        const index = Math.floor(((2*Math.PI)-angulo % (2*Math.PI)) / ((2*Math.PI)/total));
        numeroSorteado = participantes[index % total];
        document.getElementById('numeroSorteado').innerText = `${numeroSorteado.numero} - ${numeroSorteado.nombre}`;
        historial.push({fecha: new Date().toLocaleDateString(), nombre: numeroSorteado.nombre, numero: numeroSorteado.numero});
        actualizarHistorial();
        guardarEstado();
        return;
    }
    angulo += velocidad;
    velocidad *= 0.97;
    ctx.save();
    ctx.translate(radio,radio);
    ctx.rotate(angulo);
    ctx.translate(-radio,-radio);
    dibujarRuleta();
    ctx.restore();
    requestAnimationFrame(girarRuleta);
}