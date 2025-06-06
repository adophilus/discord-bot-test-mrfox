import type { Insertable, Selectable, Updateable } from "kysely";
import type { Database } from "@/features/database/types";

type ApiCompatibility<T> = T;
type KSelectable<T> = Selectable<T>;
type KInsertable<T> = Insertable<T>;
type KUpdateable<T> = Updateable<T>;

type GenerateTypes<T> = {
	Selectable: ApiCompatibility<KSelectable<T>>;
	Insertable: ApiCompatibility<KInsertable<T>>;
	Updateable: ApiCompatibility<KUpdateable<T>>;
};

export namespace Reply {
	type T = GenerateTypes<Database["replies"]>;
	export type Selectable = T["Selectable"];
	export type Insertable = T["Insertable"];
	export type Updateable = T["Updateable"];
}

export namespace DiscordProfile {
	type T = GenerateTypes<Database["discord_profiles"]>;
	export type Selectable = T["Selectable"];
	export type Insertable = T["Insertable"];
	export type Updateable = T["Updateable"];
}
