// Cargar familias desde localStorage o usar las de defecto si está vacío
let familias = JSON.parse(localStorage.getItem("familias")) || ["Enzo", "Nora", "Rabri"];
let items = JSON.parse(localStorage.getItem("items")) || [];

function guardarLocal() {
    localStorage.setItem("items", JSON.stringify(items));
    localStorage.setItem("familias", JSON.stringify(familias));
}

// --- GESTIÓN DE FAMILIARES ---

function renderFamiliares() {
    const contenedor = document.getElementById("lista-familiares");
    if (!contenedor) return;

    contenedor.innerHTML = familias.map(f => `
        <span class="total-card" style="padding: 0.5rem 1rem; display: inline-flex; align-items: center; gap: 0.5rem; margin: 0;">
            <strong style="color: white;">${f}</strong>
            <button class="btn-danger" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; border-radius: 0.5rem;" onclick="eliminarFamiliar('${f}')">✕</button>
        </span>
    `).join("");
}

function agregarFamiliar() {
    const input = document.getElementById("nuevo-familiar");
    const nombre = input.value.trim();

    if (!nombre) return;
    if (familias.includes(nombre)) {
        alert("Este familiar ya existe");
        return;
    }

    // Agregar al array de familias
    familias.push(nombre);

    // Inicializar la asignación de este nuevo familiar en 0 para todos los ítems existentes
    items.forEach(item => {
        if (!(nombre in item.asignaciones)) {
            item.asignaciones[nombre] = 0;
        }
    });

    input.value = "";
    guardarLocal();
    renderFamiliares();
    renderEncabezadoTabla(); // Actualiza los títulos de la tabla
    renderTabla();
}

function eliminarFamiliar(nombre) {
    if (familias.length <= 1) {
        alert("Debe quedar al menos un familiar en la lista.");
        return;
    }

    // Confirmar eliminación
    if (!confirm(`¿Seguro que quieres eliminar a ${nombre}? Se perderán sus asignaciones.`)) return;

    // Quitar del array de familias
    familias = familias.filter(f => f !== nombre);

    // Limpiar las asignaciones de los ítems existentes
    items.forEach(item => {
        delete item.asignaciones[nombre];
    });

    guardarLocal();
    renderFamiliares();
    renderEncabezadoTabla();
    renderTabla();
}

// --- GESTIÓN DE ÍTEMS (COMPRAS) ---

function agregarItem() {
    const nombre = document.getElementById("nombre").value;
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const precio = parseFloat(document.getElementById("precio").value);

    if (!nombre || isNaN(cantidad) || isNaN(precio) || cantidad <= 0 || precio <= 0) {
        alert("Por favor ingresa valores válidos mayores a 0");
        return;
    }

    // Crear el objeto dinámicamente según las familias activas
    const asignacionesIniciales = {};
    familias.forEach(f => {
        asignacionesIniciales[f] = 0;
    });

    const item = { nombre, cantidad, precio, asignaciones: asignacionesIniciales };
    items.push(item);
    
    // Limpiar campos
    document.getElementById("nombre").value = "";
    document.getElementById("cantidad").value = "";
    document.getElementById("precio").value = "";

    guardarLocal();
    renderTabla();
}

// Nueva función para renderizar los títulos de la tabla dinámicamente
function renderEncabezadoTabla() {
    const tabla = document.getElementById("tabla");
    if (!tabla) return;
    
    const thead = tabla.querySelector("thead");
    thead.innerHTML = `
        <tr>
            <th>Producto</th>
            <th>Total</th>
            <th>Precio</th>
            ${familias.map(f => `<th>${f}</th>`).join("")}
            <th>Resto</th>
            <th></th>
        </tr>
    `;
}

function renderTabla() {
    const tbody = document.querySelector("#tabla tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    items.forEach((item, index) => {
        // Asegurar que si hay familias nuevas, tengan su propiedad en el item
        familias.forEach(f => {
            if (item.asignaciones[f] === undefined) item.asignaciones[f] = 0;
        });

        const totalAsignado = familias.reduce((sum, f) => sum + (item.asignaciones[f] || 0), 0);
        const restante = item.cantidad - totalAsignado;

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td class="td-product">${item.nombre}</td>
            <td class="td-number">${item.cantidad}</td>
            <td class="td-number">$${item.precio}</td>
            ${familias.map(f => `
                <td>
                    <input type="number" min="0" 
                        placeholder="0"
                        value="${item.asignaciones[f] === 0 ? '' : item.asignaciones[f]}" 
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

    const totalAsignado = familias.reduce((sum, f) => sum + (item.asignaciones[f] || 0), 0);
    const disponible = item.cantidad - (totalAsignado - (item.asignaciones[familia] || 0));

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
    const totales = {};
    familias.forEach(f => locales = totales[f] = 0);

    items.forEach(item => {
        familias.forEach(f => {
            totales[f] += (item.asignaciones[f] || 0) * item.precio;
        });
    });

    const contenedorTotales = document.getElementById("totales");
    if (!contenedorTotales) return;
    
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
        const totalAsignado = familias.reduce((sum, f) => sum + (item.asignaciones[f] || 0), 0);
        const restante = item.cantidad - totalAsignado;
        
        // Armamos el objeto base
        const fila = {
            Producto: item.nombre,
            Cantidad: item.cantidad,
            PrecioUnitario: item.precio
        };
        
        // Agregamos dinámicamente los familiares a las columnas de Excel
        familias.forEach(f => {
            fila[f] = item.asignaciones[f] || 0;
        });
        
        fila.Restante = restante;
        return fila;
    });

    const totales = {};
    familias.forEach(f => totales[f] = 0);
    items.forEach(item => {
        familias.forEach(f => {
            totales[f] += (item.asignaciones[f] || 0) * item.precio;
        });
    });

    const filaTotal = {
        Producto: "TOTAL",
        Cantidad: "",
        PrecioUnitario: ""
    };
    familias.forEach(f => {
        filaTotal[f] = totales[f];
    });
    filaTotal.Restante = "";
    
    datos.push(filaTotal);

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Compras");
    XLSX.writeFile(wb, "compras_familia.xlsx");
}

// --- RENDER INICIAL AL CARGAR LA PÁGINA ---
renderFamiliares();
renderEncabezadoTabla();
renderTabla();

// --- FUNCIÓN PARA PLEGAR / DESPLEGAR SIDEBAR ---
function toggleSidebar() {
    const dashboard = document.getElementById("dashboard");
    if (dashboard) {
        dashboard.classList.toggle("collapsed");
        
        // Guardar la preferencia
        const isCollapsed = dashboard.classList.contains("collapsed");
        localStorage.setItem("sidebarCollapsed", isCollapsed);
    } else {
        console.error("No se encontró el contenedor #dashboard");
    }
}

// Inicialización directa segura
(function() {
    const wasCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    // Usamos un pequeño delay para asegurarnos de que el HTML ya exista en el DOM
    setTimeout(() => {
        const dashboard = document.getElementById("dashboard");
        if (wasCollapsed && dashboard) {
            dashboard.classList.add("collapsed");
        }
    }, 50);
})();