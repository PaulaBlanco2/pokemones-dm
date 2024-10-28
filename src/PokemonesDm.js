import { LitElement } from 'lit-element';

export class PokemonesDm extends LitElement {
  async fetchPokemon() {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?offset=0&limit=50');
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

      const data = await response.json();
      const pokemonList = await Promise.all(
        data.results.map(async (pokemon) => {
          const res = await fetch(pokemon.url);
          const pokemonDetails = await res.json();
          return {
            nombre: pokemonDetails.name,
            imagen: pokemonDetails.sprites.front_default,
            tipos: pokemonDetails.types.map((typeInfo) => typeInfo.type.name).join(', '),
          };
        })
      );

      return pokemonList; // Cambiado para devolver los datos
    } catch (error) {
      console.error('Error al obtener datos de Pokémon:', error);
      return [];
    }
  }
}

customElements.define('pokemones-dm', PokemonesDm);
