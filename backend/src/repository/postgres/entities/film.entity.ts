import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { commaSeparatedListTransformer } from './comma-separated-list.transformer';
import { Schedule } from './schedule.entity';

@Entity('films')
export class Film {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('double precision')
  rating: number;

  @Column()
  director: string;

  @Column('text', { transformer: commaSeparatedListTransformer })
  tags: string[];

  @Column()
  image: string;

  @Column()
  cover: string;

  @Column()
  title: string;

  @Column()
  about: string;

  @Column()
  description: string;

  @OneToMany(() => Schedule, (schedule) => schedule.film, {
    cascade: true,
  })
  schedule: Schedule[];
}
