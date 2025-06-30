import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, of, tap } from 'rxjs'; 

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonDetails {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { slot: number; type: { name: string; url: string; } }[];
  sprites: { front_default: string; other: { dream_world: { front_default: string; }; }; };
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2';
  private allPokemonDetailsCache: PokemonDetails[] | null = null;
  private totalAvailablePokemons: number = 0;

  constructor(private http: HttpClient) { }

  getPokemonList(offset: number, limit: number): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`);
  }

  getPokemonDetails(nameOrId: string | number): Observable<PokemonDetails> {
    return this.http.get<PokemonDetails>(`${this.baseUrl}/pokemon/${nameOrId}/`);
  }

  getPokemonsInitialLoad(totalLimit: number = 100): Observable<PokemonDetails[]> {
    if (this.allPokemonDetailsCache) {
      return of(this.allPokemonDetailsCache);
    }

    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon?limit=100000&offset=0`).pipe(
      map(response => {
        this.totalAvailablePokemons = response.count; 
        return response.results.slice(0, totalLimit);
      }),
      switchMap(pokemonListItems => {
        const detailCalls = pokemonListItems.map(item => this.getPokemonDetails(item.name));
        return forkJoin(detailCalls); 
      }),
      tap(details => {
        this.allPokemonDetailsCache = details; 
      })
    );
  }

  
  getPaginatedPokemons(offset: number, limit: number = 10): Observable<PokemonDetails[]> {
    return this.getPokemonsInitialLoad().pipe(
      map(allDetails => {
        return allDetails.slice(offset, offset + limit);
      })
    );
  }

  
  getTotalCachedPokemonCount(): number {
    return this.allPokemonDetailsCache ? this.allPokemonDetailsCache.length : 0;
  }
}