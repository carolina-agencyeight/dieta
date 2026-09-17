export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('', {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-claude-key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // API key can come from env (production) or from request header (dev/local)
  const apiKey = process.env.ANTHROPIC_API_KEY || req.headers.get('x-claude-key');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 }); }

  const { protein, availableIngredients = [], existingRecipeNames = [], mealCat = 'almuerzo' } = body;
  if (!protein) return new Response(JSON.stringify({ error: 'protein required' }), { status: 400 });

  const catLabel = { almuerzo: 'almuerzo', cena: 'cena', desayuno: 'desayuno' }[mealCat] || mealCat;
  const ingList = availableIngredients.slice(0, 30).join(', ');
  const existing = existingRecipeNames.length
    ? `\nRecetas que ya tengo con esta proteína (NO repetir): ${existingRecipeNames.join(', ')}`
    : '';

  const prompt = `Soy una persona que lleva una dieta saludable. Genera 4 ideas de recetas de ${catLabel} usando ${protein} como proteína principal.

Ingredientes disponibles en mi despensa/nevera: ${ingList}${existing}

Responde SOLO con un array JSON válido, sin texto adicional, con este formato exacto:
[
  {
    "name": "Nombre del plato",
    "ing": ["ingrediente 1", "ingrediente 2", "ingrediente 3"],
    "time": "20 min",
    "steps": ["Paso 1", "Paso 2", "Paso 3"]
  }
]

Reglas:
- Usa principalmente los ingredientes disponibles
- Recetas prácticas y sencillas (máx 30 min idealmente)
- Nombres en español
- 4–8 ingredientes por receta
- 3–5 pasos por receta
- NO repetir las recetas existentes listadas arriba`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: err }), { status: res.status });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || '[]';
    const recipes = JSON.parse(text);
    if (!Array.isArray(recipes)) throw new Error('Expected array');

    return new Response(JSON.stringify({ recipes }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const config = { path: '/api/suggest-recipes' };
