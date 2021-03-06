import { Controller, Get, Post, Request, Query } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

    constructor( private readonly userService: UserService) {}

    @Post()
    async addUser(@Request() req): Promise<any> {
        const user: UserDocument =  await this.userService.add(req.body);
        return { _id: user._id, username: user.username, name: user.name, email: user.email};
    }

    @Get()
    usersList(@Query('filter') filter) {
      return this.userService.findAll(filter);
    }
}
