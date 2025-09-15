import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieProjectionApiService } from '../../../core/services/movie-projection-api.service';
import { IMovieProjection } from '../../../models/movie-projection.interface';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  movies: IMovieProjection[] = [];
  filteredMovies: IMovieProjection[] = [];
  availableGenres: string[] = [];
  selectedGenre: string = 'Svi';
  searchTerm: string = '';

  constructor(private movieService: MovieProjectionApiService) {}

  ngOnInit(): void {
    this.movieService.getMovies().subscribe({
      next: (data: IMovieProjection[]) => {
        this.movies = data;
        this.applyFilters();
        this.extractUniqueGenres();
        console.log('Fetched movies:', this.movies);
      },
      error: (err: any) => {
        console.error('Error fetching movies:', err);
      },
    });
  }

  getMovieGenres(movie: IMovieProjection): string {
    if (movie.movieGenres && movie.movieGenres.length > 0) {
      return movie.movieGenres
        .map((mg) => mg.genre?.name)
        .filter((name) => name)
        .join(', ');
    }
    return 'N/A';
  }

  private extractUniqueGenres(): void {
    const genres = new Set<string>();
    genres.add('Svi');

    this.movies.forEach((movie) => {
      movie.movieGenres.forEach((movieGenre) => {
        if (movieGenre.genre?.name) {
          genres.add(movieGenre.genre.name);
        }
      });
    });
    this.availableGenres = Array.from(genres);
  }

  filterByGenre(genre: string): void {
    this.selectedGenre = genre;
    this.applyFilters();
  }

  searchMovies(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let tempMovies = this.movies;

    if (this.selectedGenre !== 'Svi') {
      tempMovies = tempMovies.filter((movie) =>
        movie.movieGenres.some((mg) => mg.genre?.name === this.selectedGenre)
      );
    }

    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempMovies = tempMovies.filter((movie) => {
        const titleMatch = movie.title
          .toLowerCase()
          .includes(lowerCaseSearchTerm);
        const descriptionMatch = movie.shortDescription
          .toLowerCase()
          .includes(lowerCaseSearchTerm);

        const actorMatch = movie.movieActors?.some((ma) =>
          ma.actor?.name.toLowerCase().includes(lowerCaseSearchTerm)
        );

        return titleMatch || descriptionMatch || actorMatch;
      });
    }

    this.filteredMovies = tempMovies;
  }
}
