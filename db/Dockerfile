FROM postgres:13.3-alpine3.14

COPY ./schemas/1_schema_v1.0.sql /docker-entrypoint-initdb.d

RUN chmod a+r /docker-entrypoint-initdb.d/*