/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post } from 'generated/prisma';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class PostService {
  constructor(private readonly db: DatabaseService) {}

  async createPost(
    data: { title: string; content: string },
    userId: string,
  ): Promise<Post> {
    try {
      const post = await this.db.post.create({
        data: {
          title: data.title,
          content: data.content,
          authorId: userId,
        },
      });

      return post;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async fetchPosts(): Promise<Post[]> {
    const posts = await this.db.post.findMany();
    return posts;
  }

  async fetchSinglePost(id: string): Promise<Post> {
    console.log('id', id);

    const post = await this.db.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async fetchUserPosts(userId: string): Promise<Post[]> {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = await this.db.post.findMany({ where: { authorId: user.id } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async deleteUserPosts(
    id: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      const user = await this.db.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const userPost = await this.db.post.findMany({
        where: { authorId: user.id },
      });

      if (!userPost) {
        throw new NotFoundException('Post not found');
      }

      const deletePost = await this.db.post.delete({
        where: { id, authorId: userId },
      });

      return { message: `Post titled: ${deletePost.title} Deleted!` };
    } catch (error) {
      throw new BadGatewayException();
    }
  }

  async editUserPosts(
    id: string,
    userId: string,
    data: { title: string; content: string },
  ): Promise<Post> {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userPost = await this.db.post.findUnique({
      where: { id, authorId: user.id },
    });

    if (!userPost) {
      throw new BadRequestException('You can only edit your own posts');
    }

    const updatePost = await this.db.post.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
      },
    });

    return updatePost;
  }
}
