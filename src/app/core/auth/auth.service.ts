import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser } from '../../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<IUser | null>;
  public currentUser: Observable<IUser | null>;

  private readonly USERS_STORAGE_KEY = 'registeredUsers';

  constructor() {
    const storedUsersString = localStorage.getItem(this.USERS_STORAGE_KEY);
    let initialUsers: IUser[] = [];

    if (storedUsersString) {
      try {
        initialUsers = JSON.parse(storedUsersString);
      } catch (e) {
        initialUsers = [];
      }
    }

    const defaultEmail = 'korisnik@gmail.com';
    if (!initialUsers.some((user) => user.email === defaultEmail)) {
      const defaultUser: IUser = {
        id: 'default-user-' + Date.now(),
        fullName: 'Korisnik',
        email: defaultEmail,
        phone: '066 123 4567',
        password: 'korisnik123',
      };
      initialUsers.push(defaultUser);
      localStorage.setItem(
        this.USERS_STORAGE_KEY,
        JSON.stringify(initialUsers)
      );
    }

    const storedCurrentUser = sessionStorage.getItem('currentUser');
    const initialCurrentUser = storedCurrentUser
      ? JSON.parse(storedCurrentUser)
      : null;
    this.currentUserSubject = new BehaviorSubject<IUser | null>(
      initialCurrentUser
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): IUser | null {
    return this.currentUserSubject.value;
  }

  register(user: Omit<IUser, 'id'>): boolean {
    const storedUsersString = localStorage.getItem(this.USERS_STORAGE_KEY);
    let users: IUser[] = storedUsersString ? JSON.parse(storedUsersString) : [];

    if (users.some((u) => u.email === user.email)) {
      return false;
    }

    const newUser: IUser = { ...user, id: 'user-' + Date.now().toString() };

    users.push(newUser);

    localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
    return true;
  }

  login(email: string, passwordPlain: string): IUser | null {
    const storedUsersString = localStorage.getItem(this.USERS_STORAGE_KEY);
    const users: IUser[] = storedUsersString
      ? JSON.parse(storedUsersString)
      : [];

    const user = users.find(
      (u) => u.email === email && u.password === passwordPlain
    );

    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return user;
    }
    return null;
  }

  logout(): void {
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
