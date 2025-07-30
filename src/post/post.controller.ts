import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Request } from 'express';
import { Authorize } from 'src/common/guards/authorize';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // create post
  @Post('')
  @UseGuards(Authorize)
  async createPost(
    @Body() body: { title: string; content: string },
    @Req() req: Request,
  ) {
    const userId = this.extractUserId(req);
    const response = await this.postService.createPost(body, userId);
    return response;
  }

  // fetch all posts
  @Get('')
  async fetchPosts() {
    const response = await this.postService.fetchPosts();
    return { data: response };
  }

  // fetch all posts of a user
  @UseGuards(Authorize)
  @Get('/user')
  async fetchUserPosts(@Req() req: Request) {
    const userId = this.extractUserId(req);
    const response = await this.postService.fetchUserPosts(userId);
    return { data: response };
  }

  // fetch single post
  @Get(':id')
  async fetchSinglePost(@Param('id') id: string) {
    const response = await this.postService.fetchSinglePost(id);
    return response;
  }

  // delete a post of a user
  @Delete(':id')
  @UseGuards(Authorize)
  async deleteUserPost(@Param('id') id: string, @Req() req: Request) {
    const userId = this.extractUserId(req);
    const response = await this.postService.deleteUserPosts(id, userId);
    return response;
  }

  // update a post of a user
  @Patch(':id')
  @UseGuards(Authorize)
  async editUserPost(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: { title: string; content: string },
  ) {
    const userId = this.extractUserId(req);
    const response = await this.postService.editUserPosts(id, userId, body);
    return { data: response };
  }

  private extractUserId(req: Request) {
    return (req['user'] as { id: string }).id;
  }
}
