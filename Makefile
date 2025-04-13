# https://unix.stackexchange.com/questions/235223/makefile-include-env-file
define	setup_env
	$(eval ENV_FILE := $(1))
    @echo " - setup env $(ENV_FILE)"
    $(eval include $(1))
    $(eval export sed 's/=.*//' $(1))
endef

loadDevServerEnv:
	$(call setup_env, .env.nest)

loadStagingEnv:
	$(call setup_env, .env.staging)

make-scripts-executable:
	chmod +x ./scripts/isLocalBTI.js

bti-local:
	npm i file:../backing-tracks-isomorphic

bti-reg:
	npm i backing-tracks-isomorphic@latest

# Leading dash (- docker ...) means “run the command, but do not stop the Make process if there’s an error.” Useful cause we can just run this script even if this is our first time and we don't have those images yet.
dev-server-clean:	loadDevServerEnv	make-scripts-executable
	- docker	rm	-f	${COMPOSE_PROJECT_NAME}-api
	- docker	rmi	-f	${COMPOSE_PROJECT_NAME}-api
	- docker	rm	-f	${COMPOSE_PROJECT_NAME}-ytdl
	- docker	rmi	-f	${COMPOSE_PROJECT_NAME}-ytdl
	- docker	volume	rm	${COMPOSE_PROJECT_NAME}_nodemodules
	./scripts/isLocalBTI.js && echo "BTI already symlinked" || $(MAKE) bti-local

dev-server:
	docker-compose	-f docker-compose.dev-server.yml --env-file .env.nest build
	docker-compose	-f docker-compose.dev-server.yml --env-file .env.nest up

dev-server-db:	loadDevServerEnv
	docker	start	${COMPOSE_PROJECT_NAME}-pg-db

staging-clean:	loadStagingEnv	make-scripts-executable
	- docker	rm	-f	${COMPOSE_PROJECT_NAME}-api
	- docker	rmi	-f	${COMPOSE_PROJECT_NAME}-api
	- docker	rm	-f	${COMPOSE_PROJECT_NAME}-ytdl
	- docker	rmi	-f	${COMPOSE_PROJECT_NAME}-ytdl
	./scripts/isLocalBTI.js && $(MAKE) bti-reg || echo "BTI registry pkg already installed."

# Big diff compared to our dev-server script - here we always first clean the older builds.
staging:
	$(MAKE) staging-clean
	docker-compose	-f docker-compose.staging.yml --env-file .env.staging	build
	docker-compose	-f docker-compose.staging.yml --env-file .env.staging	up

# todo check out docker debug https://docs.docker.com/reference/cli/docker/debug/ 
redis-debug:	loadDevServerEnv
	docker exec -it ${COMPOSE_PROJECT_NAME}-redis redis-cli
