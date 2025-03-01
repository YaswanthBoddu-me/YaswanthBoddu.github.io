import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


// Rest of your code...

type Pokemon = {
  id: number;
  name: string;
  image: string;
  type: string;
  height: number;
  weight: number;
  abilities: string[];
  stats: { name: string; value: number }[];
  evolutionChain: { name: string; image: string }[];
  flavorText?: string; // Optional property for flavor text
  region?: string; // Optional property for the region
  isLegendary: boolean; // Property for legendary status
  isMythical: boolean; // Property for mythical status
  isBaby: boolean; // Property for baby status
};

const mockPokemonData: Pokemon[] = [
  {
    id: 1,
    name: 'Bulbasaur',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    type: 'Grass/Poison',
    height: 7,
    weight: 69,
    abilities: ['Overgrow', 'Chlorophyll'],
    stats: [
      { name: 'HP', value: 45 },
      { name: 'Attack', value: 49 },
      { name: 'Defense', value: 49 },
      { name: 'Special Attack', value: 65 },
      { name: 'Special Defense', value: 65 },
      { name: 'Speed', value: 45 }
    ],
    evolutionChain: []
  }
]

export default function Pokedex() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pokemonList, setPokemonList] = useState<Pokemon[]>(mockPokemonData)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)

  const fetchPokemonData = async (id: number) => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      if (!response.ok) {
        throw new Error('Pokémon not found')
      }
      const data = await response.json()
      return {
        id: data.id,
        name: data.name,
        image: data.sprites.front_default || 'https://via.placeholder.com/96',
        type: data.types.map((type: any) => type.type.name).join('/'),
        height: data.height,
        weight: data.weight,
        abilities: data.abilities.map((ability: any) => ability.ability.name),
        stats: data.stats.map((stat: any) => ({ name: stat.stat.name, value: stat.base_stat })),
        evolutionChain: []
      }
    } catch (error) {
      throw error
    }
  }

  const fetchEvolutionChain = async (speciesUrl: string) => {
    try {
      const response = await fetch(speciesUrl)
      if (!response.ok) {
        throw new Error('Evolution chain not found')
      }
      const speciesData = await response.json()
      const evolutionChainResponse = await fetch(speciesData.evolution_chain.url)
      if (!evolutionChainResponse.ok) {
        throw new Error('Evolution chain not found')
      }
      const evolutionChainData = await evolutionChainResponse.json()
      const chain = evolutionChainData.chain
      const evolutionChain = []

      const processChain = (chain: any) => {
        evolutionChain.push({
          name: chain.species.name,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${chain.species.url.split('/')[6]}.png`
        })
        if (chain.evolves_to.length > 0) {
          processChain(chain.evolves_to[0])
        }
      }

      processChain(chain)
      return evolutionChain
    } catch (error) {
      throw error
    }
  }

  const fetchPokemonDetails = async (pokemonName: string) => {
  setIsLoading(true);
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    if (!response.ok) {
      throw new Error('Pokémon not found');
    }
    const data = await response.json();
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${data.id}/`;
    const speciesResponse = await fetch(speciesUrl);
    if (!speciesResponse.ok) {
      throw new Error('Pokémon species not found');
    }
    const speciesData = await speciesResponse.json(); // Corrected to use speciesResponse

    // Fetch flavor text (keeping existing logic)
    const flavorText = speciesData.flavor_text_entries
      .find((entry: any) => entry.language.name === 'en')
      ?.flavor_text.replace(/\n/g, ' ').replace(/\f/g, ' ');

    // Determine region using generation data
    const generationId = speciesData.generation.url.split('/').slice(-2, -1)[0];
    const generationResponse = await fetch(`https://pokeapi.co/api/v2/generation/${generationId}/`);
    if (!generationResponse.ok) {
      throw new Error('Generation data not found');
    }
    const generationData = await generationResponse.json();
    const region = generationData.main_region.name;

    // Determine legendary, mythical, and baby status
    const isLegendary = speciesData.is_legendary || false;
    const isMythical = speciesData.is_mythical || false;
    const isBaby = speciesData.is_baby || false;

    const evolutionChain = await fetchEvolutionChain(speciesUrl);
    const pokemonDetails = {
      id: data.id,
      name: data.name,
      image: data.sprites.front_default || 'https://via.placeholder.com/96',
      type: data.types.map((type: any) => type.type.name).join('/'),
      height: data.height,
      weight: data.weight,
      abilities: data.abilities.map((ability: any) => ability.ability.name),
      stats: data.stats.map((stat: any) => ({ name: stat.stat.name, value: stat.base_stat })),
      evolutionChain,
      flavorText,
      region,
      isLegendary,
      isMythical,
      isBaby
    };
    setSelectedPokemon(pokemonDetails);
  } catch (error) {
    setError('Failed to load Pokémon details');
    console.error('Error fetching Pokémon details:', error); // Add console.log for debugging
  } finally {
    setIsLoading(false);
  }
};

  const fetchMorePokemon = async () => {
    setIsLoadingMore(true)
    try {
      const randomIds = Array.from({ length: 3 }, () => Math.floor(Math.random() * 1010) + 1)
      const newPokemon = await Promise.all(randomIds.map((id) => fetchPokemonData(id)))
      const pokemonWithEvolutions = await Promise.all(
        newPokemon.map(async (pokemon) => {
          const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}/`
          const evolutionChain = await fetchEvolutionChain(speciesUrl)
          return { ...pokemon, evolutionChain }
        })
      )
      setPokemonList((prev) => [...prev, ...pokemonWithEvolutions])
      setPage((prev) => prev + 1)
    } catch (error) {
      setError('Failed to load more Pokémon')
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleTypeFilter = (type: string) => {
    setIsFiltering(true)
    setSelectedType(type)
    setTimeout(() => {
      setIsFiltering(false)
    }, 500)
  }

  const handlePokemonClick = async (pokemonName: string) => {
    await fetchPokemonDetails(pokemonName)
  }

  const handleSearch = async () => {
    if (!searchTerm) return
    setIsLoading(true)
    setError(null)
    await fetchPokemonDetails(searchTerm)
  }

  const filteredPokemon = pokemonList
    .filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedType === 'all' || pokemon.type.toLowerCase().includes(selectedType.toLowerCase()))
    )
    .slice(0, page * 10)

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Pokédex</CardTitle>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search Pokémon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
            <Button onClick={handleSearch} className="w-[100px]">
              Search
            </Button>
            <Select value={selectedType} onValueChange={handleTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="fire">Fire</SelectItem>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="grass">Grass</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="ice">Ice</SelectItem>
                <SelectItem value="fighting">Fighting</SelectItem>
                <SelectItem value="poison">Poison</SelectItem>
                <SelectItem value="ground">Ground</SelectItem>
                <SelectItem value="flying">Flying</SelectItem>
                <SelectItem value="psychic">Psychic</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="rock">Rock</SelectItem>
                <SelectItem value="ghost">Ghost</SelectItem>
                <SelectItem value="dragon">Dragon</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="steel">Steel</SelectItem>
                <SelectItem value="fairy">Fairy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedPokemon && (
  <Card className="w-full max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
    <div className="flex items-center justify-center space-x-4 mb-6">
      <img
        src={selectedPokemon.image}
        alt={selectedPokemon.name}
        className="w-24 h-24 object-contain"
      />
      <h2 className="text-2xl font-bold capitalize text-gray-800">
        {selectedPokemon.name}
      </h2>
    </div>
    <div className="grid grid-cols-2 gap-6 mb-6">
      <div>
        <p className="font-bold text-gray-700 mb-1">Type</p>
        <p className="text-gray-600">{selectedPokemon.type}</p>
      </div>
      <div>
        <p className="font-bold text-gray-700 mb-1">Height</p>
        <p className="text-gray-600">{selectedPokemon.height / 10} m</p>
      </div>
      <div>
        <p className="font-bold text-gray-700 mb-1">Weight</p>
        <p className="text-gray-600">{selectedPokemon.weight / 10} kg</p>
      </div>
      <div>
        <p className="font-bold text-gray-700 mb-1">Abilities</p>
        <p className="text-gray-600">{selectedPokemon.abilities.join(', ')}</p>
      </div>
      {selectedPokemon.region && (
        <div>
          <p className="font-bold text-gray-700 mb-1">Region</p>
          <p className="text-gray-600 capitalize">{selectedPokemon.region}</p>
        </div>
      )}
    </div>
    {selectedPokemon.flavorText && (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="font-bold text-gray-700 mb-1">Description</p>
        <p className="text-gray-600">{selectedPokemon.flavorText}</p>
      </div>
    )}
    <div className="mb-6">
      <p className="font-bold text-gray-700 mb-2">Special Status</p>
      <div className="space-y-2">
        {selectedPokemon.isLegendary && <p className="text-gray-600">Legendary Pokémon</p>}
        {selectedPokemon.isMythical && <p className="text-gray-600">Mythical Pokémon</p>}
        {selectedPokemon.isBaby && <p className="text-gray-600">Baby Pokémon</p>}
        {!selectedPokemon.isLegendary && !selectedPokemon.isMythical && !selectedPokemon.isBaby && (
          <p className="text-gray-600">Regular Pokémon</p>
        )}
      </div>
    </div>
    <div className="mb-6">
      <p className="font-bold text-gray-700 mb-2">Stats</p>
      <div className="grid grid-cols-2 gap-4">
        {selectedPokemon.stats.map((stat) => (
          <div key={stat.name} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
            <span className="capitalize text-gray-700">{stat.name}</span>
            <span className="text-gray-800 font-medium">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="mb-6">
      <p className="font-bold text-gray-700 mb-2">Evolution Chain</p>
      <div className="flex space-x-4">
        {selectedPokemon.evolutionChain.map((evolution) => (
          <div
            key={evolution.name}
            className="flex flex-col items-center cursor-pointer hover:opacity-75"
            onClick={() => handlePokemonClick(evolution.name)}
          >
            <img
              src={evolution.image}
              alt={evolution.name}
              className="w-16 h-16 object-contain rounded-full"
            />
            <p className="capitalize text-gray-600 mt-2">{evolution.name}</p>
          </div>
        ))}
      </div>
    </div>
    <Button
      onClick={() => setSelectedPokemon(null)}
      className="w-full bg-black text-white hover:bg-gray-800 py-3 rounded-md transition-colors mt-6"
    >
      Back to List
    </Button>
  </Card>
)}
  {isLoading || isFiltering ? (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ) : (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {error ? (
            <div className="col-span-full text-center text-gray-500">
              {error}
            </div>
          ) : filteredPokemon.length > 0 ? (
            filteredPokemon.map((pokemon) => (
              <Card
                key={pokemon.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handlePokemonClick(pokemon.name)}
              >
                <CardContent className="flex flex-col items-center p-4">
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    className="w-24 h-24"
                  />
                  <p className="text-lg font-semibold capitalize mt-2">
                    {pokemon.name}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No Pokémon found.
            </div>
          )}
        </div>
        {filteredPokemon.length > 0 && (
          <Button
            onClick={fetchMorePokemon}
            className="w-full"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load More'}
          </Button>
        )}
      </div>
    )}
        </CardContent>
      </Card>
    </div>
  )
}