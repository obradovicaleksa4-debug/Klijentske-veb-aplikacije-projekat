import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IMovieProjection } from '../../models/movie-projection.interface';

@Injectable({
  providedIn: 'root',
})
export class MovieProjectionApiService {
  private BASE_URL = 'https://movie.pequla.com/api';

  constructor(private http: HttpClient) {}

  getMovies(): Observable<IMovieProjection[]> {
    return this.http.get<IMovieProjection[]>(`${this.BASE_URL}/movie`);
  }

  getMovieById(movieId: number): Observable<IMovieProjection> {
    return this.http.get<IMovieProjection>(`${this.BASE_URL}/movie/${movieId}`);
  }
}
