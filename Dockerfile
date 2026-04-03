# Debian (glibc), not Alpine (musl): `ffmpeg-static` ships a Linux binary that runs on glibc.
# On Alpine, that same npm package still fails at spawn (ENOEXEC / errno -8) without a separate apk ffmpeg.
FROM node:16-bullseye-slim

WORKDIR /home/node/app
COPY ./service/ .

RUN npm ci

EXPOSE 3001

CMD [ "npm", "run", "prod" ]
