import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'generated/prisma';
import { DatabaseService } from 'src/database/database.service';
import { genSalt, hash, compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  async register(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ user: User; token: string }> {
    // generate hash
    const hashedPassword = await hash(data.password, await genSalt(10));

    const user = await this.db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    });

    // generate jwt token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' },
    );

    return { user, token };
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ token: string } | null> {
    const user = await this.db.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      console.log('User not found');
      return null;
    }

    const isValidPassword = await compare(data.password, user.password);

    if (!isValidPassword) {
      console.log('Invalid password');
      return null;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' },
    );

    return { token };
  }

  async protectedRoute(userId: string): Promise<User> {
    const user = await this.db.user.findUnique({ where: { id: userId } });

    if (!user) {
      console.log('User not found');
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
