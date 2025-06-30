import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, of, tap } from 'rxjs'; // Dodan 'tap'

// Definiranje tipova za podatke
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
  height: number; // u decimetrima
  weight: number; // u hektogramima
  types: { slot: number; type: { name: string; url: string; } }[];
  sprites: { front_default: string; other: { dream_world: { front_default: string; }; }; };
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2';
  private allPokemonDetailsCache: PokemonDetails[] | null = null; // Keširaj detalje
  private totalAvailablePokemons: number = 0; // Stvarni ukupan broj Pokemona s API-ja

  constructor(private http: HttpClient) { }

  /**
   * Dohvaća listu Pokemona (trenutno se ne koristi direktno, ali je ostavljena).
   */
  getPokemonList(offset: number, limit: number): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`);
  }

  /**
   * Dohvaća detalje pojedinog Pokemona.
   */
  getPokemonDetails(nameOrId: string | number): Observable<PokemonDetails> {
    return this.http.get<PokemonDetails>(`${this.baseUrl}/pokemon/${nameOrId}/`);
  }

  /**
   * Dohvaća prvu grupu Pokemona (do 100) i njihove detalje.
   * Koristi keširanje za izbjegavanje ponovnih API poziva.
   * @param limit Ukupan broj Pokemona za dohvatiti (maksimalno 100 za ovaj zadatak).
   */
  getPokemonsInitialLoad(totalLimit: number = 100): Observable<PokemonDetails[]> {
    if (this.allPokemonDetailsCache) {
      // Ako su podaci već keširani, vrati ih odmah
      return of(this.allPokemonDetailsCache);
    }

    // Koristimo API endpoint s velikim limitom, ali uzimamo samo prvih `totalLimit`
    // (tj. prvih 100 kako je traženo za projekt)
    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon?limit=100000&offset=0`).pipe(
      map(response => {
        this.totalAvailablePokemons = response.count; // Zabilježi stvarni broj Pokemona s API-ja
        // Uzmi samo prvih `totalLimit` Pokemona s liste
        return response.results.slice(0, totalLimit);
      }),
      switchMap(pokemonListItems => {
        const detailCalls = pokemonListItems.map(item => this.getPokemonDetails(item.name));
        return forkJoin(detailCalls); // Pokrenite sve pozive za detalje paralelno
      }),
      tap(details => {
        this.allPokemonDetailsCache = details; // Keširaj dohvaćene detalje
      })
    );
  }

  /**
   * Vraća podskup keširanih detalja Pokemona za paginaciju.
   * Prvo osigurava da su svi podaci učitani, a zatim vraća traženi dio.
   * @param offset Broj Pokemona za preskočiti.
   * @param limit Broj Pokemona za dohvatiti po stranici.
   */
  getPaginatedPokemons(offset: number, limit: number = 10): Observable<PokemonDetails[]> {
    return this.getPokemonsInitialLoad().pipe( // Pozovi inicijalno učitavanje, koje koristi keš
      map(allDetails => {
        // Vrati samo dio podataka koji odgovara trenutnoj paginaciji
        return allDetails.slice(offset, offset + limit);
      })
    );
  }

  /**
   * Vraća ukupan broj Pokemona koji su trenutno učitani/dostupni za paginaciju.
   * (Ovo će biti 100, ako je getPokemonsInitialLoad() dohvatilo 100)
   */
  getTotalCachedPokemonCount(): number {
    return this.allPokemonDetailsCache ? this.allPokemonDetailsCache.length : 0;
  }
}