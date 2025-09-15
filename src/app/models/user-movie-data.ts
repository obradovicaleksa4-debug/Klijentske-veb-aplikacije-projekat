export interface IMovieReview {
  rating: number;
  comment?: string;
  timestamp: number;
}

export interface IUserMovieDataForUser {
  watchedMovies: { [movieId: number]: boolean };
  movieReviews: { [movieId: number]: IMovieReview };
  reservedMovies: number[];
}
