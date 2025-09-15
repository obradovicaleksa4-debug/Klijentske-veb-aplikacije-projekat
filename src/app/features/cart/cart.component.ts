import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MovieProjectionApiService } from '../../core/services/movie-projection-api.service';
import { UserMovieDataService } from '../../core/services/user-movie-data.service';
import { IMovieProjection } from '../../models/movie-projection.interface';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  reservedMovies: IMovieProjection[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private movieApi: MovieProjectionApiService,
    private userMovieDataService: UserMovieDataService
  ) {}

  ngOnInit(): void {
    this.loadReservedMovies();
  }

  loadReservedMovies(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const reservedMovieIds = this.userMovieDataService.getReservedMovies();

    console.log('Reserved Movie IDs from service:', reservedMovieIds);

    if (reservedMovieIds.length === 0) {
      this.reservedMovies = [];
      this.isLoading = false;
      console.log('No reserved movie IDs found. Cart is empty.');
      return;
    }

    const movieDetailRequests: Observable<IMovieProjection | null>[] =
      reservedMovieIds.map((id) =>
        this.movieApi.getMovieById(id).pipe(
          catchError((error) => {
            console.error(`Error fetching movie ID ${id}:`, error);
            return of(null);
          })
        )
      );

    forkJoin(movieDetailRequests).subscribe({
      next: (movies: (IMovieProjection | null)[]) => {
        console.log(
          'Raw movies received from forkJoin (before filter):',
          movies
        ); // NEW LOG 3

        this.reservedMovies = movies.filter(
          (movie): movie is IMovieProjection => movie !== null
        );

        console.log(
          'Filtered reservedMovies (after null check):',
          this.reservedMovies
        ); // NEW LOG 4
        console.log(
          'IDs and Titles of filtered reservedMovies:',
          this.reservedMovies.map((movie) => ({
            id: movie.id,
            title: movie.title,
          }))
        ); // NEW LOG 5

        this.isLoading = false;
      },
      error: (err) => {
        console.error(
          'Error fetching reserved movie details in forkJoin:',
          err
        ); // MODIFIED LOG
        this.errorMessage =
          'Došlo je do greške prilikom učitavanja rezervisanih filmova.';
        this.isLoading = false;
      },
    });
  }

  getMovieGenres(movie: IMovieProjection): string {
    return movie.movieGenres.map((mg) => mg.genre.name).join(', ');
  }

  getMovieActors(movie: IMovieProjection): string {
    return movie.movieActors.map((ma) => ma.actor.name).join(', ');
  }

  removeFromCart(movieId: number): void {
    console.log('removeFromCart called for movie ID:', movieId);
    if (movieId === null || movieId === undefined) {
      console.error('Movie ID is null or undefined, cannot remove.');
      return;
    }

    this.userMovieDataService.removeMovieFromReserved(movieId);

    console.log(
      'Attempted removal. Current reserved movies (from service):',
      this.userMovieDataService.getReservedMovies()
    );

    this.loadReservedMovies();
  }
}
