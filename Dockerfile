# https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
# https://snyk.io/blog/choosing-the-best-node-js-docker-image/
# https://blog.ghaiklor.com/2018/02/20/avoid-running-nodejs-as-pid-1-under-docker-images/
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
# https://github.com/krallin/tini#using-tini

# TODO: ffmpeg is huge, lets see if we can minimize it, also, lets only inlcude it in the images where it is needed and not all!

FROM node:20.11.1-bookworm-slim as base
WORKDIR /usr/src/app
# https://docs.docker.com/build/cache/#use-the-dedicated-run-cache
RUN \
    --mount=type=cache,target=/var/cache/apt \
    apt-get update && \
    apt-get install tini ffmpeg -y
# node is not designed to be pid 1
# we need something else to be the parent process, and also needs to be able to handle and pass all the signals to the node process => Tini or dumb-init
# need to remap the exit code 143 to 0
# docker run --init uses Tini as well, but not sure if they remap the exit signal.
ENTRYPOINT ["/usr/bin/tini", "-v", "-e", "143", "--"]
# TLDR: the ENTRYPOINT specifies a command that will always be executed when the container starts. 
# The CMD specifies arguments that will be fed to the ENTRYPOINT


FROM base as prod_node_deps
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
RUN npm run build-api && \
    npm run build-youtube-downloader && \
    npm run build-file-converter


FROM base as prod
ARG TARGET_APP
ARG DOWNLOADED_TRACKS_PATH
ARG CONVERTED_TRACKS_PATH
WORKDIR /usr/src/app
ENV NODE_ENV production
# make the necessary dirs and set the permission to use with the node user
RUN mkdir ${DOWNLOADED_TRACKS_PATH} && \
    chown -R node:node ${DOWNLOADED_TRACKS_PATH}
RUN mkdir ${CONVERTED_TRACKS_PATH} && \
    chown -R node:node ${CONVERTED_TRACKS_PATH}
# Run the app as a non-root user.
USER node
# while copying, change files' ownership to node user as well
COPY --chown=node:node --from=prod_app_build /usr/src/app/dist/apps/${TARGET_APP} /usr/src/app/dist/apps/${TARGET_APP}
COPY --chown=node:node --from=prod_node_deps /usr/src/app/node_modules /usr/src/app/node_modules
# we want to use execform and not shellform - RUN node blah/blah - which spawns a shell.
# seems like no good easy way to pass the TARGET_APP to the CMD in execform, so for now, will be overriding this where needed later.
# https://github.com/moby/moby/issues/5509
CMD ["node", "dist/apps/api/main"]


FROM base as dev
ARG TARGET_APP
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
# seems like I need to make an env of the arg to be able to pass it to the shell.. fine for now. TODO: revisit later
ENV _internal_TARGET_APP ${TARGET_APP}
# need to run it in a shell in order to be able pass the signals to npm - and be able to terminate the process without waiting for the timeout :P. This is fine for dev.
CMD npm run start:dev-${_internal_TARGET_APP}


# TODO check if analogous to first copying the package json approach
# RUN --mount=type=bind,source=package.json,target=package.json \
#     --mount=type=bind,source=package-lock.json,target=package-lock.json \
#     --mount=type=cache,target=/root/.npm \
#     npm ci --include=dev