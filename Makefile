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

# https://blog.logrocket.com/containerized-development-nestjs-docker/
setup-dev-server:
	docker	volume	create	nodemodules

dev-server:
	docker-compose	-f docker-compose.dev-server.yml --env-file .env.nest build
	docker-compose	-f docker-compose.dev-server.yml --env-file .env.nest up

dev-server-db:	loadDevServerEnv
	docker	start	${COMPOSE_PROJECT_NAME}-pg-db

staging:
	docker-compose	-f docker-compose.staging.yml --env-file .env.staging	build
	docker-compose	-f docker-compose.staging.yml --env-file .env.staging	up

clean-dev-server:	loadDevServerEnv
	docker	rm	-f	${COMPOSE_PROJECT_NAME}-api
	docker	rmi	-f	${COMPOSE_PROJECT_NAME}-api
	docker	rm	-f	${COMPOSE_PROJECT_NAME}-youtube-downloader
	docker	rmi	-f	${COMPOSE_PROJECT_NAME}-youtube-downloader

clean-staging:	loadStagingEnv
	docker	rm	-f	${COMPOSE_PROJECT_NAME}-api
	docker	rmi	-f	${COMPOSE_PROJECT_NAME}-api
	docker	rm	-f	${COMPOSE_PROJECT_NAME}-youtube-downloader
	docker	rmi	-f	${COMPOSE_PROJECT_NAME}-youtube-downloader
