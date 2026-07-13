const familias = ["Enzo", "Nora", "Rabri"];
let items = JSON.parse(localStorage.getItem("items")) || [];

function guardarLocal() {
    localStorage.setItem("items", JSON.stringify(items));
}

function agregarItem() {
    const nombre = document.getElementById("nombre").value;
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const precio = parseFloat(document.getElementById("precio").value);

    if (!nombre || isNaN(cantidad) || isNaN(precio)) return;

    const item = { nombre, cantidad, precio, asignaciones: { Enzo: 0, Nora: 0, Rabri: 0 } };
    items.push(item);
    renderTabla();

    // Limpiar campos
    document.getElementById("nombre").value = "";
    document.getElementById("cantidad").value = "";
    document.getElementById("precio").value = "";

    guardarLocal();
}

function renderTabla() {
    const tbody = document.querySelector("#tabla tbody");
    tbody.innerHTML = "";

    items.forEach((item, index) => {
        const totalAsignado = familias.reduce((sum, f) => sum + item.asignaciones[f], 0);
        const restante = item.cantidad - totalAsignado;

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td class="td-product">${item.nombre}</td>
            <td class="td-number">${item.cantidad}</td>
            <td class="td-number">$${item.precio}</td>
            ${familias.map(f => `
                <td>
                    <input type="number" min="0" 
                        value="${item.asignaciones[f]}" 
                        onchange="actualizarAsignacion(${index}, '${f}', this.value)">
                </td>`).join("")}
            <td class="td-number" style="color: ${restante > 0 ? '#facc15' : '#10b981'}">${restante}</td>
            <td>
                <button class="btn-danger" onclick="eliminarItem(${index})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(fila);
    });
    calcularTotales();
}

function actualizarAsignacion(index, familia, valor) {
    const item = items[index];
    const nuevaCantidad = parseInt(valor) || 0;

    const totalAsignado = familias.reduce((sum, f) => sum + item.asignaciones[f], 0);
    const disponible = item.cantidad - (totalAsignado - item.asignaciones[familia]);

    if (nuevaCantidad <= disponible) {
        item.asignaciones[familia] = nuevaCantidad;
    } else {
        alert(`Solo quedan ${disponible} unidades disponibles de ${item.nombre}`);
        item.asignaciones[familia] = disponible;
    }
    guardarLocal();
    renderTabla();
}

function eliminarItem(index) {
    items.splice(index, 1);
    guardarLocal();
    renderTabla();
}

function calcularTotales() {
    const totales = { Enzo: 0, Nora: 0, Rabri: 0 };
    items.forEach(item => {
        familias.forEach(f => {
            totales[f] += item.asignaciones[f] * item.precio;
        });
    });

    const contenedorTotales = document.getElementById("totales");
    contenedorTotales.innerHTML = familias.map(f => `
        <div class="total-card">
            <span class="total-label">${f}</span>
            <span class="total-value">$${totales[f].toLocaleString()}</span>
        </div>
    `).join("");

    guardarLocal();
}

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

// Render inicial al cargar la página
renderTabla();