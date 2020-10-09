import { ObjectType, Field, Int } from "type-graphql";
import PaginatedResponse from "../utils/PaginateEntity";
import UserRepresentation from "keycloak-admin/lib/defs/userRepresentation";
import { RequiredActionAlias } from "keycloak-admin/lib/defs/requiredActionProviderRepresentation";

// NOT IN DB - ONLY REPRESENTATION

@ObjectType()
export class User implements UserRepresentation {
  @Field(()=> String)
  id?:string;

  @Field(() => String)
  username: string;

  @Field(() => String, {nullable: true})
  password?: string;

  @Field(() => Boolean)
  enabled: boolean;

  @Field(() => Boolean, {nullable: true})
  totp: boolean;

  @Field(() => Boolean, {nullable: true})
  emailVerified: boolean;

  @Field(() => String)
  firstName?: string;

  @Field(() => String)
  lastName?: string;

  @Field(() => String)
  email?: string;

  @Field(() => [String], {nullable: true})
  disableableCredentialTypes?: string[];

  @Field(() => [String], {nullable: true})
  requiredActions?: RequiredActionAlias[];

  @Field(() => Int, {nullable: true})
  notBefore?: number;

  @Field(() => [String])
  realmRoles?: string[];
}
