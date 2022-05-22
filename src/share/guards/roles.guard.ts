import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '../../entities';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserService } from '../../modules/user/user.service';
import { StoreService } from '../../modules/store/store.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userService: UserService,
    private readonly storeService: StoreService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    console.log(requiredRoles);
    if (requiredRoles.includes(Role.Store)) {
      const store = await this.storeService.findStore(user.id);
      if (!store) return false;
    }
    const userFound = await this.userService.findById(user.id);
    if (!userFound) return false;
    return requiredRoles.some((role) => userFound.role === role);
  }
}
