import { LitElement } from 'lit-element';

export class PokemonesDm extends LitElement {

  async fetchPokemon() {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?offset=0&limit=50');
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      const pokemonList = await Promise.all(data.results.map(async (pokemon) => {
        const res = await fetch(pokemon.url);
        const pokemonDetails = await res.json();
        return {
          nombre: pokemonDetails.name,
          imagen: pokemonDetails.sprites.front_default,
          tipos: pokemonDetails.types.map(typeInfo => typeInfo.type.name).join(', '),
        };
      }));

      // Emitir un evento personalizado con los datos cargados
      this.dispatchEvent(new CustomEvent('pokemon-data-loaded', {
        detail: pokemonList,
        bubbles: true,
        composed: true
      }));
    } catch (error) {
      console.error('Error al obtener datos de Pokémon:', error);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchPokemon(); // Inicia la carga automáticamente al montar el componente
  }
}
customElements.define('pokemones-dm', PokemonesDm);
