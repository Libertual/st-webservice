import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { AddListDto, ListFile } from './dto/add-list.dto';
import { List, ListDocument, ListUser } from './list.schema';
import { ListService } from './list.service';
import { Request, Response } from 'express';
import { DefaultResponse } from 'src/shared/models/default-response';
import { ModifyListRequest } from 'src/model/rest/modify-list.request';
import { ErrorResponse } from 'src/shared/models/error-response.interface';

@UseGuards(JwtAuthGuard)
@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  /**
   * Update a new list or generate a new one
   * @param req
   * @param body
   * @returns
   */
  @Post()
  async upsertList(
    @Res() res: any,
    @Req() req: Request,
    @Body() body: AddListDto
  ): Promise<any> {
    let response;
    let status;
    const user = req.user as ListUser;
    if (!body.owner || (body.owner && user._id === body.owner._id)) {
      const result = await this.listService.upsert(body, req.user as ListUser);
      response = new DefaultResponse<any>(result);
      status = HttpStatus.OK;
    } else {
      response = new DefaultResponse<any>(null, [
        {
          code: 'STE00403',
          message: 'No permitido: No está autorizado a modificar esta lista'
        }
      ]);
      status = HttpStatus.FORBIDDEN;
    }
    return res.status(status).send(response);
  }

  /**
   * Get users lists
   * @param req
   * @returns
   */
  @Get()
  async getUserLists(@Req() req: Request): Promise<List[]> {
    return this.listService.getUserLists(req.user as ListUser);
  }

  /**
   * Delete List
   * @param listId List Identifier
   * @returns db result
   */
  @Delete('/:listId')
  deleteList(@Param('listId') listId: string, @Req() req: Request) {
    return this.listService.deleteList(listId, req.user as ListUser);
  }

  /**
   * modifyList
   * @param listId List id
   * @param body Modify list request
   */
  @Patch('/:listId')
  public async modifyList(
    @Param('listId') listId: string,
    @Body() body: ModifyListRequest
  ): Promise<DefaultResponse<any>> {
    // TODO: poner el tipo correcto
    let response = new DefaultResponse<null>(null);
    try {
      const listModified = await this.listService.modifyList(listId, body);
      if (body.saved) {
        const newList = new AddListDto();
        newList.name = listModified.name;
        newList.owner = listModified.owner;
        newList.sharedUsers = listModified.sharedUsers;
        newList.store = listModified.store;
        newList.description = listModified.description;
        response = new DefaultResponse<any>({
          listModified,
          newList: await this.listService.upsert(newList, listModified.owner)
        });
      }
    } catch (e) {
      console.error('error', e);
      const errors: ErrorResponse[] = [{ code: '1', message: 'Error: ' + e }];
      return new DefaultResponse<any>(null, errors);
    } finally {
      return response;
    }
  }

  /**
   * Add item to items list
   * @param listId
   * @param req
   * @returns
   */
  @Patch('/:listId/item/')
  addItemToList(
    @Param('listId') listId: string,
    @Req() req: Request
  ): Observable<any> {
    // TODO: cambiar Req por body
    return this.listService.addItemToItemsList(
      listId,
      req.body,
      req.user as ListUser
    );
  }

  @Patch('/:listId/cart/item/') // TODO: pasar el itemId en los parametros de la url
  addItemToCartList(
    @Param('listId') listId: string,
    @Req() req: Request
  ): Observable<any> {
    // TODO: cambiar Req por body
    return this.listService.addItemToListCart(
      listId,
      req.body,
      req.user as ListUser
    );
  }

  @Delete('/:listId/item/:listItemId')
  removeItemFromList(
    @Param('listId') listId: string,
    @Param('listItemId') listItemId: string,
    @Req() req: Request
  ) {
    return this.listService.removeItemFromList(
      listId,
      listItemId,
      req.user as ListUser
    );
  }

  @Delete('/:listId/list')
  removeListItems(@Param('listId') listId: string, @Req() req: Request) {
    return this.listService.removeListItems(listId, req.user as ListUser);
  }

  @Delete('/:listId/cart')
  removeCartItems(@Param('listId') listId: string, @Req() req: Request) {
    return this.listService.removeCartItems(listId, req.user as ListUser);
  }

  @Delete('/:listId/cart/item/:cartItemId')
  removeItemFromCartList(
    @Param('listId') listId: string,
    @Param('cartItemId') cartItemId: string,
    @Req() req: Request
  ) {
    return this.listService.removeItemFromCartList(
      listId,
      cartItemId,
      req.user as ListUser
    );
  }

  @Put('/:listId/list/item/:listItemId')
  updateListItem(
    @Param('listId') listId: string,
    @Param('listItemId') listItemId: string,
    @Body() body: any,
    @Req() req: Request
  ) {
    return this.listService.updateItemFromList(
      listId,
      listItemId,
      body,
      'list',
      req.user as ListUser
    );
  }

  @Put('/:listId/cart/item/:listItemId')
  updateCartItem(
    @Param('listId') listId: string,
    @Param('listItemId') listItemId: string,
    @Body() body: any,
    @Req() req: Request
  ) {
    return this.listService.updateItemFromList(
      listId,
      listItemId,
      body,
      'cart',
      req.user as ListUser
    );
  }

  /**
   * Add Shared User
   * @param listId
   * @param sharedUser
   * @param req
   */
  @Put('/:listId/share-user') // TODO: pasar el itemId en los parametros de la url
  addSharedUser(
    @Param('listId') listId: string,
    @Body() sharedUser: any,
    @Req() req: Request
  ): Observable<ListUser> {
    // TODO: cambiar Req por body
    return this.listService.addSharedUser(
      listId,
      sharedUser,
      req.user as ListUser
    );
  }

  /**
   * addImageTolist
   */
  @Post('/:listId/image')
  public async addImageTolist(
    @Param('listId') listId: string,
    @Body() body: any,
    @Req() req: Request
  ): Promise<DefaultResponse<any>> {
    try {
      const data = await this.listService.addImageToList(
        listId,
        body.image,
        req.user as ListUser
      );
      return new DefaultResponse<List>(data);
    } catch (e) {
      return new DefaultResponse<ErrorResponse>(null, e);
    }
  }

  /**
   * deleteAllImages
   */
  @Delete('/:listId/image')
  public async deleteAllImages(@Param('listId') listId: string) {
    try {
      const data = await this.listService.deleteAllImagesFromList(listId);
      return new DefaultResponse<List>(data);
    } catch (e) {
      return new DefaultResponse<ErrorResponse>(null, e);
    }
  }

  /**
   * Add files to list
   */
  @Post('/:listId/file')
  public async addFileTolist(
    @Param('listId') listId: string,
    @Body() body: ListFile[],
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const user = req.user as ListUser;
      const data: ListDocument = await this.listService.addFilesToList(
        listId,
        body,
        req.user as ListUser
      );
      if (data) {
        this.listService.addInvoices(listId, body, user._id);
      }

      return res.status(HttpStatus.OK).send(new DefaultResponse<List>(data));
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new DefaultResponse<ErrorResponse>(null, e));
    }
  }
}
