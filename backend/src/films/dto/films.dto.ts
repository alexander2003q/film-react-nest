import { ListResponseDto } from '../../common/dto/list-response.dto';

export class FilmDto {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  title: string;
  about: string;
  description: string;
  image: string;
  cover: string;
}

export class ScheduleDto {
  id: string;
  daytime: string;
  hall: string;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

export class FilmWithScheduleDto extends FilmDto {
  schedule: ScheduleDto[];
}

export class FilmsResponseDto extends ListResponseDto<FilmDto> {}

export class ScheduleResponseDto extends ListResponseDto<ScheduleDto> {}
