/* eslint-disable @typescript-eslint/no-unused-vars */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersResponesDto } from 'src/dtos/responses/users-respones-dto';

@Injectable()
export class ResidentGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: UsersResponesDto = context.switchToHttp().getRequest();
    // const user = request.user; // Data user dari JWT Strategy
    // return user && user.role === UserRole.RESIDENT;
    return true;
  }
}
