import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf, NgFor, TitleCasePipe } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PokemonDetails, PokemonService } from '../../pokemon.service';

@Component({
  selector: 'app-pokemon-table',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterModule, TitleCasePipe],
  templateUrl: './pokemon-table.component.html',
  styleUrls: ['./pokemon-table.component.css']
})
export class PokemonTableComponent implements OnInit, OnDestroy {
  pokemons: PokemonDetails[] = [];
  offset: number = 0;
  limit: number = 10;
  totalPokemonsDisplayed: number = 0;

  private destroy$ = new Subject<void>();

  selectedPokemon: PokemonDetails | null = null;
  private scrollPosition: number = 0;

  constructor(
    private pokemonService: PokemonService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.offset = parseInt(params['offset'] || '0', 10);
      this.loadPokemons();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPokemons(): void {
    this.pokemonService.getPaginatedPokemons(this.offset, this.limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.pokemons = data;
          this.totalPokemonsDisplayed = this.pokemonService.getTotalCachedPokemonCount();

          if (this.scrollPosition) {
            window.scrollTo(0, this.scrollPosition);
            this.scrollPosition = 0;
          }
        },
        error: (err) => {
          console.error('Error loading pokemons:', err);
          this.pokemons = [];
          this.totalPokemonsDisplayed = 0;
        }
      });
  }

  nextPage(): void {
    if (this.offset + this.limit < this.totalPokemonsDisplayed) {
      this.offset += this.limit;
      this.updateRoute();
    }
  }

  prevPage(): void {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.updateRoute();
    }
  }

  goToFirstPage(): void {
    this.offset = 0;
    this.updateRoute();
  }

  private updateRoute(): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { offset: this.offset },
      queryParamsHandling: 'merge'
    });
  }

  showDetails(pokemon: PokemonDetails): void {
    this.scrollPosition = window.pageYOffset;
    this.selectedPokemon = pokemon;
  }

  hideDetails(): void {
    this.selectedPokemon = null;
    setTimeout(() => {
      window.scrollTo(0, this.scrollPosition);
    }, 0);
  }

  getPokemonTypes(pokemon: PokemonDetails): string {
    return pokemon.types.map(t => t.type.name).join(', ');
  }

  getHeightInMeters(height: number): string {
    return (height / 10).toFixed(2) + ' m';
  }

  getWeightInKg(weight: number): string {
    return (weight / 10).toFixed(2) + ' kg';
  }
}