# https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
# https://snyk.io/blog/choosing-the-best-node-js-docker-image/
# https://blog.ghaiklor.com/2018/02/20/avoid-running-nodejs-as-pid-1-under-docker-images/
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
# https://github.com/krallin/tini#using-tini


FROM node:20.11.1-bookworm-slim as base
WORKDIR /usr/src/app
# https://docs.docker.com/build/cache/#use-the-dedicated-run-cache
RUN \
    --mount=type=cache,target=/var/cache/apt \
    apt-get update && \
    apt-get install tini ffmpeg -y
# && apt-get install TODO: when it comes to making the dockerfile for the file-converter and waveform generator will need to install some packages at this stage.
ARG TARGET_APP
ENV TARGET_APP $TARGET_APP
# node is not designed to be pid 1
# we need something else to be the parent process, and also needs to be able to handle and pass all the signals to the node process => Tini or dumb-init
# need to remap the exit code 143 to 0
# docker run --init uses Tini as well, but not sure if they remap the exit signal.
ENTRYPOINT ["/usr/bin/tini", "-v", "-e", "143", "--"]
# TLDR: the ENTRYPOINT specifies a command that will always be executed when the container starts. 
# The CMD specifies arguments that will be fed to the ENTRYPOINT


FROM base as prod_node_deps
# need to set DIR again cause this is a multistage build and this here is essentially a fresh image
WORKDIR /usr/src/app
# create a layer for this specific package.json and package-lock.json so we can use the cache for subsequent layers (when no changes in this layer).
COPY package*.json ./
RUN npm ci --only=production


FROM base as prod_app_build
WORKDIR /usr/src/app
# need to install deps again, this time dev as well, cause we need the nest-cli (in its correct version) in order to build the app. but we dont need the nest-cli in our final image :P
COPY package*.json ./
RUN npm ci --include=dev
# copy over all app src
COPY . .
RUN npm run build


FROM base as prod
WORKDIR /usr/src/app
ENV NODE_ENV production
# Run the app as a non-root user.
USER node
# while copying, change files' ownership to node user as well
COPY --chown=node:node --from=prod_app_build /usr/src/app/dist/$TARGET_APP /usr/src/app/dist/$TARGET_APP
COPY --chown=node:node --from=prod_node_deps /usr/src/app/node_modules /usr/src/app/node_modules
# we want to use execform and not shellform - RUN node blah/blah - which spawns a shell.
# seems like no good easy way to pass the TARGET_APP to the CMD in execform, so for now, will be overriding this where needed later.
# https://github.com/moby/moby/issues/5509
CMD ["node", "dist/apps/api-gateway/main"]


# ARG APP_VERSION=master
# ENV APP_VERSION $APP_VERSION


FROM base as dev
# for the devserver to work need to install some extra deps / or use a diff starting image
RUN apt-get update && \
    apt-get install -y procps
#  && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --include=dev
# copy all app src
COPY . .
# VOLUME [".", "/usr/src/app"]
# need to run it in a shell in order to be able pass the signals to npm - and be able to terminate the process without waiting for the timeout :P. This is fine for dev.
CMD npm run start:dev-$TARGET_APP
# TODO - actually try to use nest istead of npm

# TODO check if analogous to first copying the package json approach
# RUN --mount=type=bind,source=package.json,target=package.json \
#     --mount=type=bind,source=package-lock.json,target=package-lock.json \
#     --mount=type=cache,target=/root/.npm \
#     npm ci --include=dev