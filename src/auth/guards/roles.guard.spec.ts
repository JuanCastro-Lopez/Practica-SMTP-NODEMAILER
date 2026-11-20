import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';
import { RoleId } from '../authorization/role-id.enum';
import { Roles } from '../authorization/roles.decorator';
import { RolesGuard } from './roles.guard';

class AdminOnlyHandler {
  @Roles(RoleId.ADMIN)
  handle(this: void) {}
}

describe('RolesGuard', () => {
  it('allows administrators and rejects clients on admin-only routes', () => {
    const guard = new RolesGuard(new Reflector());
    const handler = AdminOnlyHandler.prototype.handle;
    const adminContext = new ExecutionContextHost(
      [{ user: { rolId: RoleId.ADMIN } }],
      AdminOnlyHandler,
      handler,
    );
    const clientContext = new ExecutionContextHost(
      [{ user: { rolId: RoleId.CLIENT } }],
      AdminOnlyHandler,
      handler,
    );

    expect(guard.canActivate(adminContext)).toBe(true);
    expect(() => guard.canActivate(clientContext)).toThrow(ForbiddenException);
  });
});
