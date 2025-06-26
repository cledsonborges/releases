import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService, User } from './api.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private apiService: ApiService) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string): Observable<boolean> {
    return this.apiService.login(username).pipe(
      map(response => {
        if (response.success && response.data) {
          const user = response.data.user;
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', response.data.token);
          this.currentUserSubject.next(user);
          return true;
        }
        return false;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user ? user.role === 'admin' : false;
  }

  isQualityTeam(): boolean {
    const user = this.currentUserValue;
    return user ? user.role === 'quality_team' : false;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}

