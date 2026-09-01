const BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Obtiene los detalles específicos de un Pokémon por nombre o ID
 */
export async function getPokemonDetails(nameOrId) {
  try {
    const res = await fetch(`${BASE_URL}/pokemon/${nameOrId.toString().toLowerCase()}`);
    if (!res.ok) {
      throw new Error(`No se pudo obtener información de "${nameOrId}".`);
    }
    const data = await res.json();

    return {
      id: data.id,
      name: data.name,
      // Imagen oficial de alta resolución con respaldo de sprite frontal
      image: data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || null,
      // Sonido / Cry oficial (formato .ogg)
      cry: data.cries?.latest || data.cries?.legacy || null,
      types: data.types ? data.types.map(t => t.type.name) : [],
    };
  } catch (error) {
    throw new Error(error.message || 'Error al conectar con la PokéAPI');
  }
}

/**
 * Consulta la lista principal y resuelve los detalles de cada Pokémon
 */
export async function getPokemonList(limit = 24) {
  try {
    const res = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=0`);
    if (!res.ok) {
      throw new Error('Error al consultar el catálogo de Pokémon.');
    }
    const data = await res.json();
    
    // Ejecuta las consultas individuales en paralelo
    const detailPromises = data.results.map(pokemon => getPokemonDetails(pokemon.name));
    return await Promise.all(detailPromises);
  } catch (error) {
    throw new Error(error.message || 'Fallo en la conexión de red.');
  }
}