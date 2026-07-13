// ==========================================
// 1. ESTADO DE LA APLICACIÓN (Variables globales)
// ==========================================
const familias = ["Enzo", "Nora", "Rabri"];
// Intentamos cargar los ítems guardados, si no hay, empezamos con un array vacío
let items = JSON.parse(localStorage.getItem('compras_items')) || [];

// ==========================================
// 2. LOGICA PRINCIPAL Y FUNCIONES
// ==========================================

// Función para inicializar la app al cargar la página
function iniciarApp() {
    actualizarTabla();
    actualizarTotales();
}

// Función para agregar un nuevo ítem
function agregarItem() {
    const nombre = document.getElementById('nombre').value;
    const cantidad = parseFloat(document.getElementById('cantidad').value) || 0;
    const precio = parseFloat(document.getElementById('precio').value) || 0;

    // Aquí capturás las asignaciones de Enzo, Nora y Rabri...
    const asignacionEnzo = parseFloat(document.getElementById('asignacion-Enzo')?.value) || 0;
    const asignacionNora = parseFloat(document.getElementById('asignacion-Nora')?.value) || 0;
    const asignacionRabri = parseFloat(document.getElementById('asignacion-Rabri')?.value) || 0;

    if (!nombre || cantidad <= 0 || precio <= 0) {
        alert("Por favor, completa los campos correctamente.");
        return;
    }

    const nuevoItem = {
        id: crypto.randomUUID(), // Generamos un ID único seguro
        nombre: nombre,
        cantidad: cantidad,
        precio: precio,
        asignaciones: {
            Enzo: asignacionEnzo,
            Nora: asignacionNora,
            Rabri: asignacionRabri
        }
    };

    items.push(nuevoItem);
    
    // Guardamos en LocalStorage para que no se borre al recargar
    guardarEnLocalStorage();
    
    // Limpiar formulario y refrescar pantalla
    limpiarFormulario();
    actualizarTabla();
    actualizarTotales();
}

// Función para guardar los datos en el navegador
function guardarEnLocalStorage() {
    localStorage.setItem('compras_items', JSON.stringify(items));
}

// Tu función para exportar a Excel (la que vi en tu código)
function exportarExcel() {
    const datos = items.map(item => {
        const totalAsignado = familias.reduce((sum, f) => sum + item.asignaciones[f], 0);
        const restante = item.cantidad - totalAsignado;
        return {
            Producto: item.nombre,
            Cantidad: item.cantidad,
            PrecioUnitario: item.precio,
            Enzo: item.asignaciones.Enzo,
            Nora: item.asignaciones.Nora,
            Rabri: item.asignaciones.Rabri,
            Restante: restante
        };
    });

    const totales = { Enzo: 0, Nora: 0, Rabri: 0 };
    items.forEach(item => {
        familias.forEach(f => {
            totales[f] += item.asignaciones[f] * item.precio;
        });
    });

    datos.push({
        Producto: "TOTAL",
        Cantidad: "",
        PrecioUnitario: "",
        Enzo: totales.Enzo,
        Nora: totales.Nora,
        Rabri: totales.Rabri,
        Restante: ""
    });

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Compras");
    XLSX.writeFile(wb, "compras_familia.xlsx");
}

// ... Aquí van tus otras funciones como actualizarTabla(), eliminarItem(), etc. ...

// ==========================================
// 3. EVENT LISTENERS (Escuchadores de clics/eventos)
// ==========================================
document.addEventListener("DOMContentLoaded", iniciarApp);

// Si tenés botones con ID en tu HTML, podés asignarles los eventos acá de forma limpia:
// document.getElementById('btn-agregar').addEventListener('click', agregarItem);
// document.getElementById('btn-exportar').addEventListener('click', exportarExcel);