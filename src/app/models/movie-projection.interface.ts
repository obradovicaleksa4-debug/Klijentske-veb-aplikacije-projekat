export interface IGenre {
  genreId: number;
  name: string;
  createdAt: string;
}

export interface IMovieGenre {
  movieGenreId: number;
  movieId: number;
  genreId: number;
  genre: IGenre;
}

export interface IActor {
  actorId: number;
  name: string;
  createdAt: string;
}

export interface IMovieActor {
  movieActorId: number;
  movieId: number;
  actorId: number;
  actor: IActor;
}

export interface IDirector {
  directorId: number;
  name: string;
  createdAt: string;
}

export interface IMovieProjection {
  id: number;
  movieId: number;
  internalId: string;
  corporateId: string;
  directorId: number;
  title: string;
  originalTitle: string;
  description: string;
  shortDescription: string;
  poster: string;
  startDate: string;
  shortUrl: string;
  runTime: number;
  year: number;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
  director: IDirector;
  movieActors: IMovieActor[];
  movieGenres: IMovieGenre[];
}
