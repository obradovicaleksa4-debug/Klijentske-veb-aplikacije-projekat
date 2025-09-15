import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieProjectionApiService } from '../../core/services/movie-projection-api.service';
import { IMovieProjection } from '../../models/movie-projection.interface';
import { CommonModule } from '@angular/common';
import { UserMovieDataService } from '../../core/services/user-movie-data.service';
import { IMovieReview } from '../../models/user-movie-data';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss'],
})
export class MovieDetailsComponent implements OnInit {
  movie: IMovieProjection | undefined;
  movieId: number | null = null;

  isWatched: boolean = false;
  movieReview: IMovieReview | undefined;
  isReserved: boolean = false;

  selectedRating: number = 0;
  reviewComment: string = '';
  showReviewSavedMessage: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieProjectionApiService,
    private router: Router,
    private userMovieDataService: UserMovieDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.movieId = idParam ? +idParam : null;

    console.log('NGONINIT - Movie ID from route:', this.movieId);

    if (this.movieId) {
      this.movieService.getMovieById(this.movieId).subscribe({
        next: (data: IMovieProjection) => {
          this.movie = data;

          console.log('NGONINIT - Movie data loaded:', this.movie);

          this.checkMovieStatus();
        },
        error: (err: any) => {
          console.error('Error fetching movie details:', err.message);
          this.router.navigate(['/home']);
        },
      });
    } else {
      console.error('Movie ID not provided in route.');
      this.router.navigate(['/home']);
    }
  }

  private checkMovieStatus(): void {
    const currentUser = this.authService.currentUserValue;

    console.log('CHECKMOVIERSTATUS - Current User:', currentUser);
    if (!currentUser) {
      console.warn(
        'CHECKMOVIERSTATUS - No user logged in. Skipping status check.'
      );
    }

    if (!currentUser) {
      return;
    }

    if (this.movieId) {
      this.isWatched = this.userMovieDataService.isMovieWatched(this.movieId);
      this.movieReview = this.userMovieDataService.getMovieReview(this.movieId);
      this.isReserved = this.userMovieDataService.isMovieReserved(this.movieId);

      console.log(
        'CHECKMOVIERSTATUS - isWatched:',
        this.isWatched,
        ' | isReserved:',
        this.isReserved,
        ' | movieReview:',
        this.movieReview
      );

      if (this.movieReview) {
        this.selectedRating = this.movieReview.rating;
        this.reviewComment = this.movieReview.comment || '';
      } else {
        this.selectedRating = 0;
        this.reviewComment = '';
      }
    }
  }

  markAsWatched(): void {
    console.log('MARKASWATCHED - Method called.');

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      alert('Morate biti prijavljeni da biste označili film kao gledan!');
      return;
    }
    if (this.movieId) {
      if (!this.isWatched) {
        this.userMovieDataService.markMovieWatched(this.movieId);
        this.isWatched = true;
        this.showReviewSavedMessage = false;

        console.log(
          'MARKASWATCHED - Movie marked as watched. New status:',
          this.isWatched
        );
      } else {
        this.userMovieDataService.unmarkMovieWatched(this.movieId);
        this.isWatched = false;
        this.movieReview = undefined;
        this.selectedRating = 0;
        this.reviewComment = '';
        this.userMovieDataService.deleteMovieReview(this.movieId);

        console.log(
          'MARKASWATCHED - Movie un-marked as watched. New status:',
          this.isWatched
        );
      }
    }
  }

  addMovieToCart(): void {
    console.log('ADDMOVIETOCART - Method called.');

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      alert('Morate biti prijavljeni da biste dodali film u korpu!');
      return;
    }
    if (this.movieId) {
      if (!this.isReserved) {
        this.userMovieDataService.addMovieToReserved(this.movieId);
        this.isReserved = true;
        alert('Film je dodat u korpu!');
        // >>>>> START DEBUG LOGS <<<<<
        console.log(
          'ADDMOVIETOCART - Movie added to cart. New status:',
          this.isReserved
        );
      } else {
        this.userMovieDataService.removeMovieFromReserved(this.movieId);
        this.isReserved = false;
        alert('Film je uklonjen iz korpe!');
        // >>>>> START DEBUG LOGS <<<<<
        console.log(
          'ADDMOVIETOCART - Movie removed from cart. New status:',
          this.isReserved
        );
      }
    }
  }

  setRating(rating: number): void {
    console.log('SETRATING - Method called with rating:', rating);

    this.selectedRating = rating;
    this.showReviewSavedMessage = false;
  }

  saveReview(): void {
    console.log(
      'SAVEREVIEW - Method called. Current rating:',
      this.selectedRating,
      'Comment:',
      this.reviewComment
    );

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      alert('Morate biti prijavljeni da biste sačuvali recenziju!');
      return;
    }
    if (this.movieId && this.selectedRating > 0) {
      this.userMovieDataService.saveMovieReview(
        this.movieId,
        this.selectedRating,
        this.reviewComment
      );
      this.movieReview = this.userMovieDataService.getMovieReview(this.movieId);
      this.showReviewSavedMessage = true;
      // >>>>> START DEBUG LOGS <<<<<
      console.log(
        'SAVEREVIEW - Review saved. Updated movieReview:',
        this.movieReview
      );
      // >>>>> END DEBUG LOGS <<<<<
      setTimeout(() => {
        this.showReviewSavedMessage = false;
      }, 3000);
    } else {
      alert('Molimo odaberite ocenu (1-5) pre nego što sačuvate recenziju.');
    }
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

  getMovieActors(movie: IMovieProjection): string {
    if (movie.movieActors && movie.movieActors.length > 0) {
      return movie.movieActors
        .map((ma) => ma.actor?.name)
        .filter((name) => name)
        .join(', ');
    }
    return 'N/A';
  }
}
