import { Migration } from '@mikro-orm/migrations';

export class Migration20261025142134 extends Migration {

  override name = 'Migration20261025142134';

  override up(): void | Promise<void> {
    this.addSql(`create table "auth_sessions" ("id" uuid not null, "user_id" uuid not null, "token_hash" varchar(255) not null, "expires_at" timestamptz not null, "created_at" timestamptz not null, primary key ("id"));`);
    this.addSql(`create index "auth_sessions_user_id_index" on "auth_sessions" ("user_id");`);

    this.addSql(`create table "polls" ("id" uuid not null, "author_id" uuid not null, "name" varchar(255) not null, "description" text null, "format" text not null, "status" text not null, "multi_choice" boolean not null, "access_type" text not null, "statistics_format" text not null, "statistics_access_type" text null, "statistics_show_after_voting" boolean null, primary key ("id"));`);
    this.addSql(`create index "polls_author_id_index" on "polls" ("author_id");`);

    this.addSql(`create table "poll_access_holders" ("poll_id" uuid not null, "user_id" uuid not null, primary key ("poll_id", "user_id"));`);

    this.addSql(`create table "poll_options" ("id" serial primary key, "name" varchar(255) not null, "description" varchar(255) null, "candidate_id" uuid null, "poll_id" uuid not null);`);
    this.addSql(`create index "poll_options_candidate_id_index" on "poll_options" ("candidate_id");`);

    this.addSql(`create table "poll_statistics_access_holders" ("poll_id" uuid not null, "user_id" uuid not null, primary key ("poll_id", "user_id"));`);

    this.addSql(`create table "poll_votes" ("id" serial primary key, "voter_id" uuid not null, "poll_id" uuid not null, "created_at" timestamptz not null);`);
    this.addSql(`create index "poll_votes_voter_id_index" on "poll_votes" ("voter_id");`);

    this.addSql(`create table "poll_votes_options" ("poll_vote_id" int not null, "poll_option_id" int not null, primary key ("poll_vote_id", "poll_option_id"));`);

    this.addSql(`create table "poll_options_votes" ("poll_option_id" int not null, "poll_vote_id" int not null, primary key ("poll_option_id", "poll_vote_id"));`);

    this.addSql(`create table "users" ("id" uuid not null, "email" varchar(255) not null, "password_hash" varchar(255) not null, "name" varchar(255) not null, "surname" varchar(255) null, "full_name" varchar(255) not null, "phone" varchar(255) null, "avatar_url" varchar(255) null, primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);
    this.addSql(`create index "users_full_name_index" on "users" ("full_name");`);

    this.addSql(`alter table "polls" add constraint "polls_format_check" check ("format" in ('voting', 'elections'));`);
    this.addSql(`alter table "polls" add constraint "polls_status_check" check ("status" in ('created', 'opened', 'closed'));`);
    this.addSql(`alter table "polls" add constraint "polls_access_type_check" check ("access_type" in ('public', 'registered_only', 'specified_users'));`);
    this.addSql(`alter table "polls" add constraint "polls_statistics_format_check" check ("statistics_format" in ('none', 'partial', 'full'));`);
    this.addSql(`alter table "polls" add constraint "polls_statistics_access_type_check" check ("statistics_access_type" in ('public', 'specified_users', 'private'));`);

    this.addSql(`alter table "poll_access_holders" add constraint "poll_access_holders_poll_id_foreign" foreign key ("poll_id") references "polls" ("id") on delete cascade;`);

    this.addSql(`alter table "poll_options" add constraint "poll_options_poll_id_foreign" foreign key ("poll_id") references "polls" ("id") on delete cascade;`);

    this.addSql(`alter table "poll_statistics_access_holders" add constraint "poll_statistics_access_holders_poll_id_foreign" foreign key ("poll_id") references "polls" ("id") on delete cascade;`);

    this.addSql(`alter table "poll_votes" add constraint "poll_votes_poll_id_foreign" foreign key ("poll_id") references "polls" ("id") on delete cascade;`);

    this.addSql(`alter table "poll_votes_options" add constraint "poll_votes_options_poll_vote_id_foreign" foreign key ("poll_vote_id") references "poll_votes" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "poll_votes_options" add constraint "poll_votes_options_poll_option_id_foreign" foreign key ("poll_option_id") references "poll_options" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "poll_options_votes" add constraint "poll_options_votes_poll_option_id_foreign" foreign key ("poll_option_id") references "poll_options" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "poll_options_votes" add constraint "poll_options_votes_poll_vote_id_foreign" foreign key ("poll_vote_id") references "poll_votes" ("id") on update cascade on delete cascade;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "poll_access_holders" drop constraint "poll_access_holders_poll_id_foreign";`);
    this.addSql(`alter table "poll_options" drop constraint "poll_options_poll_id_foreign";`);
    this.addSql(`alter table "poll_statistics_access_holders" drop constraint "poll_statistics_access_holders_poll_id_foreign";`);
    this.addSql(`alter table "poll_votes" drop constraint "poll_votes_poll_id_foreign";`);
    this.addSql(`alter table "poll_votes_options" drop constraint "poll_votes_options_poll_option_id_foreign";`);
    this.addSql(`alter table "poll_options_votes" drop constraint "poll_options_votes_poll_option_id_foreign";`);
    this.addSql(`alter table "poll_votes_options" drop constraint "poll_votes_options_poll_vote_id_foreign";`);
    this.addSql(`alter table "poll_options_votes" drop constraint "poll_options_votes_poll_vote_id_foreign";`);

    this.addSql(`drop table if exists "auth_sessions" cascade;`);
    this.addSql(`drop table if exists "polls" cascade;`);
    this.addSql(`drop table if exists "poll_access_holders" cascade;`);
    this.addSql(`drop table if exists "poll_options" cascade;`);
    this.addSql(`drop table if exists "poll_statistics_access_holders" cascade;`);
    this.addSql(`drop table if exists "poll_votes" cascade;`);
    this.addSql(`drop table if exists "poll_votes_options" cascade;`);
    this.addSql(`drop table if exists "poll_options_votes" cascade;`);
    this.addSql(`drop table if exists "users" cascade;`);
  }

}
