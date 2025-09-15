import { Injectable } from '@angular/core';
import {
  IMovieReview,
  IUserMovieDataForUser,
} from '../../models/user-movie-data';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserMovieDataService {
  private readonly BASE_STORAGE_KEY = 'userMovieData';

  constructor(private authService: AuthService) {}

  private getUserStorageKey(userId: string): string {
    return `${this.BASE_STORAGE_KEY}_${userId}`;
  }

  private loadDataForUser(userId: string): IUserMovieDataForUser {
    const userKey = this.getUserStorageKey(userId);
    try {
      const data = localStorage.getItem(userKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(
        `Error loading user movie data for user ${userId} from localStorage`,
        e
      );
    }
    return {
      watchedMovies: {},
      movieReviews: {},
      reservedMovies: [],
    };
  }

  private saveDataForUser(userId: string, data: IUserMovieDataForUser): void {
    const userKey = this.getUserStorageKey(userId);
    try {
      localStorage.setItem(userKey, JSON.stringify(data));
    } catch (e) {
      console.error(
        `Error saving user movie data for user ${userId} to localStorage`,
        e
      );
    }
  }

  private getCurrentUserMovieData(): IUserMovieDataForUser | null {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      console.warn(
        'No user logged in. Cannot access user-specific movie data.'
      );
      return null;
    }
    return this.loadDataForUser(currentUser.id);
  }

  private updateAndSaveCurrentUserMovieData(
    updateFn: (data: IUserMovieDataForUser) => void
  ): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      console.warn(
        'No user logged in. Cannot update user-specific movie data.'
      );
      return false;
    }
    const data = this.loadDataForUser(currentUser.id);
    updateFn(data);
    this.saveDataForUser(currentUser.id, data);
    return true;
  }

  isMovieWatched(movieId: number): boolean {
    const data = this.getCurrentUserMovieData();
    return data ? !!data.watchedMovies[movieId] : false;
  }

  markMovieWatched(movieId: number): void {
    this.updateAndSaveCurrentUserMovieData((data) => {
      data.watchedMovies[movieId] = true;
    });
  }

  unmarkMovieWatched(movieId: number): void {
    this.updateAndSaveCurrentUserMovieData((data) => {
      delete data.watchedMovies[movieId];
    });
  }

  getMovieReview(movieId: number): IMovieReview | undefined {
    const data = this.getCurrentUserMovieData();
    return data ? data.movieReviews[movieId] : undefined;
  }

  saveMovieReview(movieId: number, rating: number, comment: string = ''): void {
    if (rating < 1 || rating > 5) {
      console.warn('Invalid rating. Must be between 1 and 5.');
      return;
    }
    this.updateAndSaveCurrentUserMovieData((data) => {
      data.movieReviews[movieId] = {
        rating: rating,
        comment: comment,
        timestamp: Date.now(),
      };
    });
  }

  deleteMovieReview(movieId: number): void {
    this.updateAndSaveCurrentUserMovieData((data) => {
      delete data.movieReviews[movieId];
    });
  }

  isMovieReserved(movieId: number): boolean {
    const data = this.getCurrentUserMovieData();
    return data ? data.reservedMovies.includes(movieId) : false;
  }

  addMovieToReserved(movieId: number): void {
    this.updateAndSaveCurrentUserMovieData((data) => {
      if (!data.reservedMovies.includes(movieId)) {
        data.reservedMovies.push(movieId);
      }
    });
  }

  removeMovieFromReserved(movieId: number): void {
    this.updateAndSaveCurrentUserMovieData((data) => {
      data.reservedMovies = data.reservedMovies.filter((id) => id !== movieId);
    });
  }

  getReservedMovies(): number[] {
    const data = this.getCurrentUserMovieData();
    return data ? [...data.reservedMovies] : [];
  }
}
