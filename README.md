# Sistema de Cocina — Guía de Uso

Sincronizado vía OneDrive. Accesible desde Mac (Claude Code) y móvil (Claude).

---

## Archivos del sistema

| Archivo | Qué contiene |
|---------|-------------|
| `inventario.md` | Todo lo que hay en la cocina con estado y fecha de vencimiento |
| `lista_mercado.md` | Lista de compra generada automáticamente |
| `plan_comidas.md` | Plan semanal de comidas |
| `recetas/desayuno.md` | Recetario de desayunos |
| `recetas/almuerzo.md` | Recetario de almuerzos |
| `recetas/cena.md` | Recetario de cenas |
| `recetas/media_manana.md` | Recetario de media mañana |
| `recetas/merienda.md` | Recetario de meriendas |
| `recetas/ayuno.md` | Opciones de ayuno |

---

## Estados del inventario

| Emoji | Estado | Significado |
|-------|--------|-------------|
| 🟢 | Lleno | Bien surtido |
| 🟡 | Medio | Suficiente por ahora |
| 🔴 | Bajo | Casi vacío — comprar |

---

## Comandos — Inventario

```
"se acabó la leche"              → leche 🔴, aparece en lista de mercado
"compré huevos"                  → huevos 🟢, sale de la lista
"hay poco cilantro"              → cilantro 🔴, aparece en lista
"la pasta está por la mitad"     → pasta 🟡
"usé 2 pechugas"                 → descuenta 2 uds, recalcula estado
"añade kimchi a la nevera"       → nueva fila 🟡 en Nevera
"¿qué me falta?"                 → lista todos los 🔴
"regenera la lista de mercado"   → regenera lista_mercado.md completa
"agrega leche a la lista"        → agrega item 🟡 a la lista manualmente
"hice la compra"                 → pregunta qué compraste, actualiza estados
```

---

## Comandos — Fechas de vencimiento

```
"¿qué vence esta semana?"        → lista items con Vence ≤ 7 días
"¿qué vence hoy?"                → items con Vence = hoy
"la leche vence el 5 de marzo"   → actualiza columna Vence en inventario
```

**Alertas automáticas de vencimiento:**
- Nevera: aviso si vence en ≤ 3 días
- Despensa: aviso si vence en ≤ 7 días
- Congelador: sin alerta automática (excepto si se solicita)

**Vencimiento automático para frutas y verduras frescas:**
Claude asigna fechas típicas al agregar items a la nevera sin fecha especificada.

---

## Comandos — Plan de comidas

```
"Planifica la semana del 23 de febrero"   → genera semana completa con sugerencias
"Añade [plato] al [momento] del [día]"    → entrada individual
"El [día] [momento] es [plato]"           → entrada individual (alternativa)
"Sugerencias para [día] [momento]"        → 3 opciones según inventario
"Marca [día] como completado"             → cierra el día
"Aplica la semana"                        → confirma todas las deducciones
"Ver semana actual"                       → resumen del plan activo
"Quita [plato] del [día] [momento]"       → elimina y revierte deducciones
"Cambia [día] [momento] por [plato]"      → reemplaza plato
```

**Momentos válidos:** Ayuno · Desayuno · Media mañana · Almuerzo · Merienda · Cena

**Prioridad al planear la semana:**
1. Items por vencer en ≤ 7 días (prioridad máxima — anti-desperdicio)
2. Items en 🟡 Medio
3. Items en 🟢 Lleno
4. Recetas guardadas en el recetario tienen prioridad sobre recetas inventadas

---

## Comandos — Recetario

```
"Guarda esta receta en desayunos"              → agrega al archivo correspondiente
"Guarda esta receta en almuerzos: [texto]"     → extrae y formatea la receta
"Busca recetas para cenar con pollo"           → busca en recetas/cena.md
"¿Qué recetas tengo para el almuerzo?"        → lista recetas guardadas
```

**Fuentes que acepta Claude:**
- Texto de receta copiado
- Nombre del plato solo (Claude genera la receta)
- Foto del plato (Claude identifica e infiere ingredientes)
- PDF con múltiples recetas
- Foto del plan nutricional del nutricionista

**Duplicados:** Si ya existe una receta similar, Claude muestra las diferencias y pregunta:
- a) Guardar ambas con nombres distintos
- b) Actualizar la existente
- c) Descartar la nueva

---

## Comandos — Exportar

```
"Exporta el plan de esta semana a CSV"    → genera plan_semana_W##.csv
```

El CSV tiene columnas: Día, Momento, Plato, Ingredientes, Notas.
Diseñado para abrir en Excel e imprimir en hoja tamaño carta.

---

## Reglas de deducción de ingredientes

**Items con cantidad exacta** (carnes, pescados, huevos, unidades):
- Di cuántas unidades se usaron: "usé 2 pechugas"
- Claude descuenta y recalcula el estado

**Items sin cantidad exacta:**

| Rol | Ejemplos | Cuándo baja un nivel |
|-----|----------|----------------------|
| Principal | Pollo en plato de pollo | 1 uso |
| Secundario | Zanahoria, tomate, cebolla | 2 usos |
| Condimento | Ajo, aceite, especias | 4 usos |

**Ingrediente no en inventario:** se agrega automáticamente como 🔴 y aparece en la lista de mercado.

---

## Lista de mercado — Secciones

| Sección | Contenido |
|---------|-----------|
| 🔴 Urgente | Items ya en 🔴 en inventario |
| 📅 Necesario para el plan | Items que el plan agotará esta semana |
| ⚠️ Por vencer esta semana | Items próximos a vencer — consumir en el plan |
| 🟡 Opcionales | Items en 🟡 — tú decides si reponer |
