CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.films
(
    id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    rating      double precision NOT NULL,
    director    varchar NOT NULL,
    tags        text NOT NULL,
    image       varchar NOT NULL,
    cover       varchar NOT NULL,
    title       varchar NOT NULL,
    about       varchar NOT NULL,
    description varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS public.schedules
(
    id       uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    daytime  varchar NOT NULL,
    hall     integer NOT NULL,
    rows     integer NOT NULL,
    seats    integer NOT NULL,
    price    double precision NOT NULL,
    taken    text NOT NULL,
    "filmId" uuid NOT NULL REFERENCES public.films(id) ON DELETE CASCADE
);
