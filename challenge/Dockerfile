

# flag logic
FROM ubuntu:22.04 AS flag-build

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends git build-essential ca-certificates libssl-dev

WORKDIR /
RUN git clone https://github.com/tum-itsec/scoreboard.git
RUN cd scoreboard/flag/ && make

# Use Ubuntu 22.04 (Jammy) which supports MongoDB 7.0 on both amd64 and arm64
FROM ubuntu:22.04 as app-build

# install mongo
# https://www.mongodb.com/docs/v7.0/tutorial/install-mongodb-on-ubuntu/
RUN apt-get update -y && apt-get install -y gnupg curl

RUN curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Ubuntu 22.04 (Jammy) repo - supports both amd64 and arm64
RUN echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

RUN apt-get update -y && apt-get install -y mongodb-org

# install bun
RUN apt-get install -y unzip
RUN curl -fsSL https://bun.com/install | bash
ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

# build backend
WORKDIR /app
RUN mkdir ./dist

WORKDIR /app/backend

COPY backend/package*.json ./
RUN bun install --frozen-lockfile --production
COPY backend/ .
# base url which will be exposed to the outside world
ARG BASE_URL="http://localhost:3000"
ENV BASE_URL=${BASE_URL}
RUN bun run build-swagger

# build frontend
WORKDIR /app/frontend

COPY frontend/package*.json ./
COPY frontend/bun.lockb ./
RUN bun install --frozen-lockfile

COPY frontend/ .

RUN bun run build


# start backend
WORKDIR /app/
COPY docker-start.sh .
RUN chmod +x docker-start.sh

# Create MongoDB data directory
RUN mkdir -p /data/db

EXPOSE 3000

ENV BASE_URL=${BASE_URL}
CMD ["/app/docker-start.sh"]


# at bottom so that Docker doesn't need to rebuild the entire thing if just the flag key changes
COPY --from=flag-build /scoreboard/flag/flag /bin/get_flag
RUN mkdir /etc/flags
COPY flag.key /etc/flags/1337.key
RUN chown -R 1337:1337 /bin/get_flag /etc/flags && \
	chmod 4005 /bin/get_flag && \
	chmod 101 /etc/flags/ && \
	chmod 400 /etc/flags/1337.key

