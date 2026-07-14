/**
 * UserService - Handles user creation, authentication, and profile management.
 */
export class UserService {
  private users: Map<number, User> = new Map();
  private nextId = 1;

  async createUser(data: CreateUserDto): Promise<User> {
    const existing = [...this.users.values()].find((u) => u.email === data.email);
    if (existing) throw new Error('Email already exists');

    const user: User = { id: this.nextId++, ...data, createdAt: new Date().toISOString() };
    this.users.set(user.id, user);
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async updateProfile(id: number, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
}
