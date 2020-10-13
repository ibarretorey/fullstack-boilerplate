import { Resolver, Query, Mutation, Arg, UseMiddleware, Int } from "type-graphql";
import { CreateUserInput } from "./types/CreateUserInput";
import { UpdateUserInput } from "./types/UpdateUserInput";
import { GqlLog } from "../../utils/middlewares/GqlLogMiddleware";
import { User } from "../../models/User";
import { Role } from "../../models/Role";
import { getUsersWithRoles, kcConnect, getUserWithRoles, getRoles } from "../../utils/helpers/kcAdmin";
import { RoleMappingPayload } from "keycloak-admin/lib/defs/roleRepresentation";
import { validatePassword } from "../../utils/helpers/validateFields";

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async users(@Arg("limit", { nullable: true }) limit: number,
    @Arg("offset", { nullable: true }) offset: number): Promise<User[]> {
    let users = await getUsersWithRoles();
    if (offset && limit) {
      users = users.slice(offset, offset + limit + 1)
    }
    return users
  }

  @Query(() => User)
  async user(@Arg("id", t => String) id: string) {
    const kcAdmin = await kcConnect();
    const user = await kcAdmin.users.findOne({ id });
    const roles = await kcAdmin.users.listRealmRoleMappings();
    return { ...user, roles } as User;
  }

  @Mutation(() => User)
  @UseMiddleware([GqlLog])
  async createUser(@Arg("data") data: CreateUserInput) {
    const kcAdmin = await kcConnect();
    const{ password, relatedRoleIds } = data
    delete data.password
    delete data.relatedRoleIds
    const { id } = await kcAdmin.users.create(data);
    if (validatePassword(data.password, true) === 'success') {
      await kcAdmin.users.resetPassword({
        id,
        credential: {
          temporary: false,
          type: 'password',
          value: password,
        },
      });
    }
    const roles = (await getRoles()).filter(
      r => relatedRoleIds.includes(r.id)).map(r =>
        ({ id: r.id, name: r.name } as RoleMappingPayload));
    await kcAdmin.users.addRealmRoleMappings({ id, roles })
    const user = await getUserWithRoles(id);
    return user;
  }

  @Mutation(() => User)
  @UseMiddleware([GqlLog])
  async updateUser(@Arg("id") id: string, @Arg("data") data: UpdateUserInput) {
    const kcAdmin = await kcConnect();
    const{ password, relatedRoleIds } = data
    delete data.password
    delete data.relatedRoleIds
    if (validatePassword(password, true) === 'success' ) {
      console.count("====================== llego aca ===================================")
      await kcAdmin.users.resetPassword({
        id,
        credential: {
          temporary: false,
          type: 'password',
          value: password,
        },
      });
    }
    console.count("====================== llego aca ===================================")
    await kcAdmin.users.update({ id }, data);
    console.count("====================== llego aca ===================================")
    if (relatedRoleIds) {
      console.log("relatedRoleIds",relatedRoleIds);
      console.log("roles", await getRoles());
      const roles = (await getRoles()).filter(
        r => relatedRoleIds.includes(r.id)).map(r =>
          ({ id: r.id, name: r.name } as RoleMappingPayload));
      const allRoles = await kcAdmin.users.listRealmRoleMappings({ id });
      console.log("roles", roles);
      console.log("allRoles", allRoles);
      console.count("====================== llego aca ===================================")
      await kcAdmin.users.delRealmRoleMappings({ id, roles: allRoles as RoleMappingPayload[] })
      console.count("====================== llego aca ===================================")
      await kcAdmin.users.addRealmRoleMappings({ id, roles })
    }
    const user = await getUserWithRoles(id);
    return user;
  }

  @Mutation(() => String)
  @UseMiddleware([GqlLog])
  async deleteUser(@Arg("id") id: string) {
    const kcAdmin = await kcConnect();
    await kcAdmin.users.del({ id });
    return id;
  }
}