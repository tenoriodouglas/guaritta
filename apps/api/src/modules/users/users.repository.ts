import { Inject, Injectable } from '@nestjs/common';
import { eq, getTableColumns } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../../database/database.constants.js';
import { residents, users } from '../../database/schema/index.js';

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PublicUser = Omit<User, 'passwordHash'>;

const { passwordHash: _omit, ...publicColumns } = getTableColumns(users);

@Injectable()
export class UsersRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(data: NewUser): Promise<PublicUser> {
    const [user] = await this.db.insert(users).values(data).returning(publicColumns);
    return user;
  }

  findAll(limit: number, offset: number): Promise<PublicUser[]> {
    return this.db.select(publicColumns).from(users).orderBy(users.name).limit(limit).offset(offset);
  }

  /** Resolves the resident's unit so it can be embedded in the token. */
  async findByEmailWithUnit(email: string): Promise<(User & { unitId: string | null }) | undefined> {
    const [row] = await this.db
      .select({ ...getTableColumns(users), unitId: residents.unitId })
      .from(users)
      .leftJoin(residents, eq(users.residentId, residents.id))
      .where(eq(users.email, email.toLowerCase()));
    return row;
  }

  async update(id: string, data: Partial<NewUser>): Promise<PublicUser | undefined> {
    const [user] = await this.db.update(users).set(data).where(eq(users.id, id)).returning(publicColumns);
    return user;
  }
}
