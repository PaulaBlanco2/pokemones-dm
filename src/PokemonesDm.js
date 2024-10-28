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

      this.dispatchEvent(new CustomEvent('pokemon-data-loaded', {
        detail: pokemonList,
        bubbles: true,
        composed: true,
      }));
    } catch (error) {
      console.error('Error al obtener datos de Pokémon:', error);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchPokemon(); 
  }


  async fetchPokemonDetails(pokemonId) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`);
      const data = await response.json();
      const pokemonDetails = {
        name: data.name,
        image: data.sprites.front_default,
        types: data.types.map(typeInfo => typeInfo.type.name).join(', '),
      };

      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
      const speciesData = await speciesResponse.json();
      const evolutionChainUrl = speciesData.evolution_chain.url;

      const evolutionResponse = await fetch(evolutionChainUrl);
      const evolutionData = await evolutionResponse.json();
      const evolutions = await this.extractEvolutionsWithImages(evolutionData.chain);

      const noEvolutionsMessage = evolutions.length === 0 ? 'Este Pokémon no tiene evoluciones.' : '';

      this.dispatchEvent(new CustomEvent('pokemon-details-loaded', {
        detail: { pokemonDetails, evolutions, noEvolutionsMessage },
        bubbles: true,
        composed: true,
      }));
    } catch (error) {
      console.error('Error al obtener detalles del Pokémon:', error);
    }
  }

  async extractEvolutionsWithImages(chain) {
    const evolutions = [];
    let current = chain;

    while (current) {
      const evolutionName = current.species.name;
      const evolutionImage = await this.fetchPokemonImage(evolutionName);
      evolutions.push({ name: evolutionName, image: evolutionImage });
      current = current.evolves_to[0];
    }

    return evolutions;
  }

  async fetchPokemonImage(evolutionName) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${evolutionName}/`);
      const data = await response.json();
      return data.sprites.front_default;
    } catch (error) {
      console.error(`Error al obtener imagen de ${evolutionName}:`, error);
      return '';
    }
  }

}
