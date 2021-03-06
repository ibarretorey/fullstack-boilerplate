import { InputType, Field } from "type-graphql";

@InputType()
export class UpdateUserInput {
  @Field(() => String,{ nullable: true })
  username?: string;

  @Field(() => String, { nullable: true})
  password?: string;

  @Field(() => Boolean,{ nullable: true })
  enabled?: boolean;

  @Field(() => String,{ nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => String,{ nullable: true })
  email?: string;

  @Field(() => [String], { nullable: true })
  relatedRoleIds?: string[];
}