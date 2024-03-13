# https://unix.stackexchange.com/questions/235223/makefile-include-env-file
define	setup_env
	$(eval ENV_FILE := $(1).env)
    @echo " - setup env $(ENV_FILE)"
    $(eval include $(1).env)
    $(eval export sed 's/=.*//' $(1).env)
endef

# load .env environment
localDevEnv:
	$(call setup_env,)
setup:
	docker	volume	create	nodemodules
dev:
	docker-compose	up
# build-api:
# 	docker	build	-t	api-gateway	--target	dev	.
clean:	localDevEnv
	docker	rm	-f	${COMPOSE_PROJECT_NAME}-api-gateway
	docker	rmi	-f	${COMPOSE_PROJECT_NAME}-api-gateway
	docker	rm	-f	${COMPOSE_PROJECT_NAME}-youtube-downloader
	docker	rmi	-f	${COMPOSE_PROJECT_NAME}-youtube-downloader
	docker	rm	-f	${COMPOSE_PROJECT_NAME}-file-converter
	docker	rmi	-f	${COMPOSE_PROJECT_NAME}-file-converter
